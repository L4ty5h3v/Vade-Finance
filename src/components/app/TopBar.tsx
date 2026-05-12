"use client";

import { Menu } from "lucide-react";
import { WalletConnectControl } from "./WalletConnectControl";
import { UserRole } from "./types";

type Props = {
  title: string;
  connected: boolean;
  role: UserRole;
  displayName: string;
  isRegistered: boolean;
  onOpenMobileNav: () => void;
};

export function TopBar({ title, connected, role, displayName, isRegistered, onOpenMobileNav }: Props) {
  return (
    <header className="sticky top-0 z-30 border-b border-[#ccdcf2] bg-[#f4f8ffea] backdrop-blur-md">
      <div className="flex items-center gap-3 px-4 py-3 md:px-6">
        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#c4d8f5] bg-white text-[#284d84] md:hidden"
          onClick={onOpenMobileNav}
          aria-label="Open navigation"
        >
          <Menu size={18} />
        </button>

        <div className="min-w-0 flex-1">
          <div className="mb-0.5 h-8" aria-hidden />
          <h1 className="text-lg font-semibold tracking-tight text-[#132c57] md:text-xl">{title}</h1>
          <p className="mt-2 text-xs font-semibold text-[#4f6f98]">
            {!connected ? (
              "Connect wallet to load your registered role."
            ) : isRegistered ? (
              <>
                Signed in as <span className="text-[#16458f]">{role}</span> · <span className="text-[#16458f]">{displayName}</span>
              </>
            ) : (
              "Complete registration for this wallet to continue."
            )}
          </p>
        </div>

        <div className="ml-auto flex flex-1 items-center justify-end gap-2 md:gap-3">
          <WalletConnectControl />
        </div>
      </div>
    </header>
  );
}
