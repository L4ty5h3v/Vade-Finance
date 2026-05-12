"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { ChevronDown, LogOut, RefreshCcw, Wallet } from "lucide-react";
import { useEffect, useRef, useState } from "react";

function shortAddress(address: string) {
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

export function WalletConnectControl() {
  const { publicKey, connected, connecting, disconnect, wallet } = useWallet();
  const { setVisible } = useWalletModal();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("mousedown", onClick);
    window.addEventListener("keydown", onEscape);
    return () => {
      window.removeEventListener("mousedown", onClick);
      window.removeEventListener("keydown", onEscape);
    };
  }, []);

  if (!connected) {
    return (
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setVisible(true)}
          disabled={connecting}
          className="inline-flex items-center gap-2 rounded-xl border border-[#b8d0f2] bg-[linear-gradient(160deg,#f8fbff,#dce9ff)] px-3 py-2 text-sm font-semibold text-[#113f8f] disabled:opacity-55"
        >
          <Wallet size={15} />
          {connecting ? "Connecting..." : "Connect Wallet"}
        </button>
      </div>
    );
  }

  const address = publicKey ? shortAddress(publicKey.toBase58()) : "Connected";

  return (
    <div className="relative flex items-center gap-2" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex items-center gap-2 rounded-xl border border-[#8ec6ff] bg-[linear-gradient(160deg,#f2f9ff,#d8ebff)] px-3 py-2 text-sm font-semibold text-[#0f3f91]"
      >
        <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" aria-hidden />
        {address}
        <ChevronDown size={14} />
      </button>

      {open ? (
        <div className="absolute right-0 z-40 mt-2 w-48 rounded-xl border border-[#c5d8f2] bg-white p-1.5 shadow-[0_14px_28px_rgba(15,52,111,0.16)]">
          <p className="px-2 py-1 text-[11px] uppercase tracking-[0.12em] text-[#6a84a8]">{wallet?.adapter.name || "Wallet"}</p>
          <button
            type="button"
            onClick={() => {
              setVisible(true);
              setOpen(false);
            }}
            className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-xs font-semibold text-[#234d85] hover:bg-[#eff6ff]"
          >
            <RefreshCcw size={13} />
            Switch Wallet
          </button>
          <button
            type="button"
            onClick={async () => {
              await disconnect();
              setOpen(false);
            }}
            className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-xs font-semibold text-[#8c2f2f] hover:bg-rose-50"
          >
            <LogOut size={13} />
            Disconnect
          </button>
        </div>
      ) : null}
    </div>
  );
}
