"use client";

import { FormEvent, useState } from "react";
import { UserRole } from "./types";

const roles: UserRole[] = ["Exporter", "Investor", "Verifier"];

type Props = {
  role: UserRole;
  displayName: string;
  walletLabel: string;
  onSave: (payload: { role: UserRole; displayName: string }) => void;
};

export function SettingsView({ role, displayName, walletLabel, onSave }: Props) {
  const [draftRole, setDraftRole] = useState<UserRole>(role);
  const [draftName, setDraftName] = useState(displayName);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = draftName.trim();
    if (!trimmed) return;
    onSave({ role: draftRole, displayName: trimmed });
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-[#143260]">Settings</h2>
        <p className="text-sm text-[#5d7598]">Manage wallet profile data used in the app interface.</p>
      </div>

      <section className="rounded-2xl border border-[#c7daf4] bg-white/85 p-4 md:p-5">
        <p className="text-xs uppercase tracking-[0.13em] text-[#5f7ba2]">Connected wallet</p>
        <p className="mt-1 text-sm font-semibold text-[#153861]">{walletLabel}</p>

        <form className="mt-5 space-y-4" onSubmit={onSubmit}>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.13em] text-[#55749c]">Role</span>
            <div className="grid gap-2 sm:grid-cols-3">
              {roles.map((item) => {
                const active = item === draftRole;
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setDraftRole(item)}
                    className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                      active
                        ? "border-[#7cb1f3] bg-[linear-gradient(160deg,#edf5ff,#dceaff)] text-[#123f82]"
                        : "border-[#c8daf2] bg-white text-[#36547b] hover:border-[#aecdf2]"
                    }`}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.13em] text-[#55749c]">Company or person name</span>
            <input
              value={draftName}
              onChange={(event) => setDraftName(event.target.value)}
              placeholder="Company or full name"
              className="w-full rounded-xl border border-[#bed3ef] bg-white px-3 py-2.5 text-sm text-[#163963] outline-none transition placeholder:text-[#7a93b3] focus:border-[#7fb1ef] focus:ring-2 focus:ring-[#8ebcff55]"
              required
            />
          </label>

          <button
            type="submit"
            className="inline-flex rounded-xl border border-[#7caef0] bg-[linear-gradient(160deg,#2a7ef5,#236be2)] px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_20px_rgba(37,99,235,0.28)] transition hover:brightness-[1.04]"
          >
            Save changes
          </button>
        </form>
      </section>
    </div>
  );
}
