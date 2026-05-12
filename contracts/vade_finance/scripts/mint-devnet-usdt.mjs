import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { getOrCreateAssociatedTokenAccount, mintTo } from "@solana/spl-token";
import { clusterApiUrl, Connection, Keypair, PublicKey } from "@solana/web3.js";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const CFG_PATH = path.join(ROOT, "devnet-config.json");

const target = process.argv[2];
const amountUi = Number(process.argv[3] || "1000");

if (!target) {
  console.error("Usage: node scripts/mint-devnet-usdt.mjs <wallet_pubkey> [amount_ui]");
  process.exit(1);
}

const loadKeypair = (filePath) => {
  const raw = JSON.parse(fs.readFileSync(filePath, "utf8"));
  return Keypair.fromSecretKey(Uint8Array.from(raw));
};

const main = async () => {
  if (!fs.existsSync(CFG_PATH)) {
    throw new Error(`Missing ${CFG_PATH}. Run bootstrap first.`);
  }

  const cfg = JSON.parse(fs.readFileSync(CFG_PATH, "utf8"));
  const mint = new PublicKey(cfg.stableMint);

  const walletPath = process.env.ANCHOR_WALLET || path.join(os.homedir(), ".config", "solana", "id.json");
  const admin = loadKeypair(walletPath);

  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

  const targetPk = new PublicKey(target);
  const targetAta = await getOrCreateAssociatedTokenAccount(connection, admin, mint, targetPk);

  const amountBaseUnits = Math.round(amountUi * 1_000_000);
  const sig = await mintTo(connection, admin, mint, targetAta.address, admin, amountBaseUnits);

  console.log(`Minted ${amountUi} USDT to ${targetPk.toBase58()}`);
  console.log(`ATA: ${targetAta.address.toBase58()}`);
  console.log(`Signature: ${sig}`);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
