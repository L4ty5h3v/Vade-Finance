import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import * as anchor from "@coral-xyz/anchor";
import { createMint, getOrCreateAssociatedTokenAccount, mintTo } from "@solana/spl-token";
import { clusterApiUrl, Connection, Keypair, PublicKey, SystemProgram } from "@solana/web3.js";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const IDL_PATH = path.join(ROOT, "target", "idl", "vade_finance.json");
const OUT_PATH = path.join(ROOT, "devnet-config.json");
const ENV_PATH = path.resolve(ROOT, "..", "..", ".env.local");

const loadKeypair = (filePath) => {
  const raw = JSON.parse(fs.readFileSync(filePath, "utf8"));
  return Keypair.fromSecretKey(Uint8Array.from(raw));
};

const upsertEnv = (kv) => {
  let body = "";
  if (fs.existsSync(ENV_PATH)) {
    body = fs.readFileSync(ENV_PATH, "utf8");
  }

  const lines = body ? body.split(/\r?\n/) : [];
  const map = new Map(lines.filter(Boolean).map((line) => {
    const [k, ...rest] = line.split("=");
    return [k, rest.join("=")];
  }));

  Object.entries(kv).forEach(([k, v]) => map.set(k, String(v)));

  const next = Array.from(map.entries()).map(([k, v]) => `${k}=${v}`).join("\n") + "\n";
  fs.writeFileSync(ENV_PATH, next);
};

const main = async () => {
  if (!fs.existsSync(IDL_PATH)) {
    throw new Error(`IDL not found: ${IDL_PATH}. Run: anchor build`);
  }

  const idl = JSON.parse(fs.readFileSync(IDL_PATH, "utf8"));
  const programId = new PublicKey(idl.address);

  const walletPath = process.env.ANCHOR_WALLET || path.join(os.homedir(), ".config", "solana", "id.json");
  const admin = loadKeypair(walletPath);

  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
  const wallet = new anchor.Wallet(admin);
  const provider = new anchor.AnchorProvider(connection, wallet, {
    commitment: "confirmed",
    preflightCommitment: "confirmed",
  });

  anchor.setProvider(provider);
  const program = new anchor.Program(idl, provider);

  const [configPda] = PublicKey.findProgramAddressSync([Buffer.from("config")], programId);

  const stableMint = await createMint(connection, admin, admin.publicKey, null, 6);
  const treasuryAta = await getOrCreateAssociatedTokenAccount(connection, admin, stableMint, admin.publicKey);

  const configExists = await connection.getAccountInfo(configPda);
  if (!configExists) {
    const sig = await program.methods
      .initializePlatform(150)
      .accounts({
        config: configPda,
        admin: admin.publicKey,
        verifier: admin.publicKey,
        treasury: treasuryAta.address,
        stableMint,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
    console.log(`initialize_platform signature: ${sig}`);
  } else {
    console.log("Platform config already exists; initialize skipped.");
  }

  const treasuryMintSig = await mintTo(connection, admin, stableMint, treasuryAta.address, admin, 1_000_000_000_000);
  console.log(`Treasury top-up signature: ${treasuryMintSig}`);

  const recipients = (process.env.DEMO_RECIPIENTS || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  for (const address of recipients) {
    const target = new PublicKey(address);
    const targetAta = await getOrCreateAssociatedTokenAccount(connection, admin, stableMint, target);
    const sig = await mintTo(connection, admin, stableMint, targetAta.address, admin, 250_000_000_000);
    console.log(`Minted demo USDT to ${address}: ${sig}`);
  }

  const payload = {
    cluster: "devnet",
    programId: programId.toBase58(),
    configPda: configPda.toBase58(),
    stableMint: stableMint.toBase58(),
    treasuryAta: treasuryAta.address.toBase58(),
    verifier: admin.publicKey.toBase58(),
    admin: admin.publicKey.toBase58(),
    createdAt: new Date().toISOString(),
  };

  fs.writeFileSync(OUT_PATH, JSON.stringify(payload, null, 2));

  upsertEnv({
    NEXT_PUBLIC_VADE_PROGRAM_ID: payload.programId,
    NEXT_PUBLIC_VADE_CLUSTER: payload.cluster,
    NEXT_PUBLIC_VADE_STABLE_MINT: payload.stableMint,
    NEXT_PUBLIC_VADE_CONFIG_PDA: payload.configPda,
    NEXT_PUBLIC_VADE_TREASURY_ATA: payload.treasuryAta,
    NEXT_PUBLIC_VADE_VERIFIER: payload.verifier,
  });

  console.log("Devnet bootstrap complete:");
  console.log(payload);
  console.log(`Updated env file: ${ENV_PATH}`);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
