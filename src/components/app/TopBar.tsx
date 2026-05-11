"use client";

import { Menu } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";
import { WalletConnectControl } from "./WalletConnectControl";
import { UserRole } from "./types";

type Props = {
  title: string;
  role: UserRole;
  onRoleChange: (role: UserRole) => void;
  onOpenMobileNav: () => void;
};

const roles: UserRole[] = ["Exporter", "Investor"];

export function TopBar({ title, role, onRoleChange, onOpenMobileNav }: Props) {
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
          <div className="mb-0.5"><BrandLogo href="/" size="sm" /></div>
          <h1 className="text-lg font-semibold tracking-tight text-[#132c57] md:text-xl">{title}</h1>
        </div>

        <div className="hidden flex-1 justify-center sm:flex">
          <div className="rounded-xl border border-[#bcd2f2] bg-white p-1">
            {roles.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => onRoleChange(item)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  role === item ? "bg-[#1f59f0] text-white" : "text-[#3e5f89] hover:bg-[#edf4ff]"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="ml-auto flex flex-1 items-center justify-end gap-2 md:gap-3">
          <WalletConnectControl />
        </div>
      </div>

      <div className="border-t border-[#d2e1f5] px-4 py-2 sm:hidden">
        <div className="grid grid-cols-2 gap-2">
          {roles.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => onRoleChange(item)}
              className={`rounded-lg px-2 py-1.5 text-xs font-semibold ${
                role === item ? "bg-[#1f59f0] text-white" : "bg-white text-[#3e5f89]"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
