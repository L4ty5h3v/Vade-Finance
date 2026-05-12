"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  ChartNoAxesCombined,
  Clock3,
  Landmark,
  ListChecks,
  Settings,
  ShieldCheck,
} from "lucide-react";
import BrandLogo from "@/components/BrandLogo";
import { AppView, UserRole } from "./types";

const nav = [
  { label: "Marketplace" as AppView, icon: Landmark },
  { label: "Portfolio" as AppView, icon: ChartNoAxesCombined },
  { label: "History" as AppView, icon: Clock3 },
  { label: "Verification" as AppView, icon: ShieldCheck },
];

const settingsNav = { label: "Settings" as AppView, icon: Settings };

type Props = {
  active: AppView;
  role: UserRole;
  onSelect: (view: AppView) => void;
  onNavigate?: () => void;
};

export function Sidebar({ active, role, onSelect, onNavigate }: Props) {
  const reducedMotion = useReducedMotion();
  const navItems =
    role === "Verifier"
      ? nav.filter((item) => item.label !== "Portfolio" && item.label !== "History")
      : nav.filter((item) => item.label !== "Verification");

  return (
    <aside className="flex h-full w-full max-w-[280px] flex-col border-r border-[#ccdcf2] bg-[linear-gradient(180deg,#f9fbff_0%,#eef4ff_100%)] p-4 md:p-5">
      <div className="mb-6 flex items-center gap-2 px-2">
        <div>
          <BrandLogo href="/" size="sm" />
        </div>
      </div>

      <nav className="space-y-1" aria-label="App Navigation">
        {navItems.map((item) => {
          const selected = item.label === active;
          return (
            <button
              key={item.label}
              type="button"
              onClick={() => {
                onSelect(item.label);
                onNavigate?.();
              }}
              className={`group relative flex w-full items-center gap-3 overflow-hidden rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${
                selected
                  ? "bg-[#1f59f012] text-[#18438f]"
                  : "text-[#375277] hover:bg-white/75 hover:text-[#143f87]"
              }`}
            >
              {selected ? (
                <motion.span
                  layoutId="active-app-nav"
                  className="absolute inset-0 rounded-xl border border-[#9fc2f5] bg-[linear-gradient(160deg,rgba(214,229,255,0.75),rgba(241,247,255,0.9))]"
                  transition={reducedMotion ? { duration: 0 } : { type: "spring", duration: 0.45 }}
                />
              ) : null}
              <span className="relative z-10">
                <item.icon size={17} />
              </span>
              <span className="relative z-10">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="mt-4 border-t border-[#d4e2f4] pt-4">
        <button
          type="button"
          onClick={() => {
            onSelect(settingsNav.label);
            onNavigate?.();
          }}
          className={`group relative flex w-full items-center gap-3 overflow-hidden rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${
            settingsNav.label === active
              ? "bg-[#1f59f012] text-[#18438f]"
              : "text-[#375277] hover:bg-white/75 hover:text-[#143f87]"
          }`}
        >
          {settingsNav.label === active ? (
            <motion.span
              layoutId="active-app-nav"
              className="absolute inset-0 rounded-xl border border-[#9fc2f5] bg-[linear-gradient(160deg,rgba(214,229,255,0.75),rgba(241,247,255,0.9))]"
              transition={reducedMotion ? { duration: 0 } : { type: "spring", duration: 0.45 }}
            />
          ) : null}
          <span className="relative z-10">
            <settingsNav.icon size={17} />
          </span>
          <span className="relative z-10">{settingsNav.label}</span>
        </button>
      </div>

      <div className="mt-auto rounded-2xl border border-[#bfd4ef] bg-white/80 p-4 shadow-[0_10px_20px_rgba(24,55,105,0.08)]">
        <div className="flex items-center gap-2 text-[#15438d]">
          <ListChecks size={16} />
          <p className="text-sm font-semibold">Solana Devnet</p>
        </div>
        <p className="mt-2 text-xs leading-5 text-[#5d7598]">USDT settlement enabled. Settlement events are tracked in the interface.</p>
      </div>
    </aside>
  );
}
