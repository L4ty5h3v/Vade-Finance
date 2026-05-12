"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { FormEvent, useState } from "react";
import { UserRole } from "./types";

const roles: Array<{ role: UserRole; note: string }> = [
  { role: "Exporter", note: "Issue invoices and receive liquidity" },
  { role: "Investor", note: "Fund listed invoices and claim repayments" },
  { role: "Verifier", note: "Validate and advance invoice lifecycle" },
];

type Props = {
  open: boolean;
  walletLabel: string;
  defaultRole?: UserRole;
  defaultName?: string;
  onSubmit: (payload: { role: UserRole; displayName: string }) => void;
};

export function RegistrationModal({ open, walletLabel, defaultRole = "Exporter", defaultName = "", onSubmit }: Props) {
  const reducedMotion = useReducedMotion();
  const [role, setRole] = useState<UserRole>(defaultRole);
  const [displayName, setDisplayName] = useState(defaultName);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = displayName.trim();
    if (!trimmed) return;
    onSubmit({ role, displayName: trimmed });
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-[#091731b3] px-4"
          initial={reducedMotion ? false : { opacity: 0 }}
          animate={reducedMotion ? {} : { opacity: 1 }}
          exit={reducedMotion ? {} : { opacity: 0 }}
        >
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 12, scale: 0.98 }}
            animate={reducedMotion ? {} : { opacity: 1, y: 0, scale: 1 }}
            exit={reducedMotion ? {} : { opacity: 0, y: 8 }}
            transition={{ duration: 0.24 }}
            className="w-full max-w-xl rounded-3xl border border-[#bfd4ef] bg-[#f8fbff] p-5 shadow-[0_24px_48px_rgba(13,44,95,0.22)] md:p-6"
            role="dialog"
            aria-modal="true"
            aria-label="Wallet registration"
          >
            <p className="text-xs uppercase tracking-[0.16em] text-[#4f6f98]">Wallet registration</p>
            <h2 className="mt-2 text-xl font-semibold text-[#143260]">Complete profile for this wallet</h2>
            <p className="mt-1 text-sm text-[#58749a]">
              Connected wallet: <span className="font-semibold text-[#224d86]">{walletLabel}</span>
            </p>

            <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
              <fieldset>
                <legend className="mb-2 text-xs font-semibold uppercase tracking-[0.13em] text-[#55749c]">Role</legend>
                <div className="grid gap-2 sm:grid-cols-3">
                  {roles.map((item) => {
                    const active = item.role === role;
                    return (
                      <button
                        key={item.role}
                        type="button"
                        onClick={() => setRole(item.role)}
                        className={`rounded-xl border px-3 py-2 text-left transition ${
                          active
                            ? "border-[#7cb1f3] bg-[linear-gradient(160deg,#edf5ff,#dceaff)] text-[#123f82]"
                            : "border-[#c8daf2] bg-white text-[#36547b] hover:border-[#aecdf2]"
                        }`}
                      >
                        <p className="text-sm font-semibold">{item.role}</p>
                        <p className="mt-1 text-xs leading-4 opacity-85">{item.note}</p>
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.13em] text-[#55749c]">Company or person name</span>
                <input
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  placeholder="Vade Capital / John Doe"
                  className="w-full rounded-xl border border-[#bed3ef] bg-white px-3 py-2.5 text-sm text-[#163963] outline-none transition placeholder:text-[#7a93b3] focus:border-[#7fb1ef] focus:ring-2 focus:ring-[#8ebcff55]"
                  required
                />
              </label>

              <button
                type="submit"
                className="inline-flex rounded-xl border border-[#7caef0] bg-[linear-gradient(160deg,#2a7ef5,#236be2)] px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_20px_rgba(37,99,235,0.28)] transition hover:brightness-[1.04]"
              >
                Save profile
              </button>
            </form>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
