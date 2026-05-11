"use client";

import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";

export type NewInvoiceInput = {
  invoiceNumber: string;
  debtorCompany: string;
  debtorCountry: string;
  faceValue: number;
  paymentTerm: number;
  goodsCategory: string;
  dueDate: string;
  invoicePdf: string;
  shipmentProof: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: NewInvoiceInput) => void;
};

const initial: NewInvoiceInput = {
  invoiceNumber: "",
  debtorCompany: "",
  debtorCountry: "Germany",
  faceValue: 10000,
  paymentTerm: 60,
  goodsCategory: "Food Export",
  dueDate: "",
  invoicePdf: "",
  shipmentProof: "",
};

const inputClass =
  "w-full rounded-xl border border-[#c7daf4] bg-white px-3 py-2 text-sm text-[#173c68] outline-none focus:border-[#8fb5f0]";

export function CreateInvoiceModal({ open, onClose, onSubmit }: Props) {
  const reducedMotion = useReducedMotion();
  const [form, setForm] = useState<NewInvoiceInput>(initial);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, open]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit(form);
    setForm(initial);
    onClose();
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-[#08152faa] p-0 md:items-center md:p-4"
          initial={reducedMotion ? false : { opacity: 0 }}
          animate={reducedMotion ? {} : { opacity: 1 }}
          exit={reducedMotion ? {} : { opacity: 0 }}
          onClick={onClose}
        >
          <motion.form
            onSubmit={submit}
            onClick={(event) => event.stopPropagation()}
            initial={reducedMotion ? false : { opacity: 0, y: 20 }}
            animate={reducedMotion ? {} : { opacity: 1, y: 0 }}
            exit={reducedMotion ? {} : { opacity: 0, y: 20 }}
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl border border-[#bfd4ef] bg-[#f9fbff] p-5 md:rounded-3xl md:p-6"
            aria-label="Create invoice modal"
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-[#13315e]">Create invoice</h2>
                <p className="text-sm text-[#5f7799]">Submission uses local UI state for this build.</p>
              </div>
              <button type="button" onClick={onClose} className="rounded-lg border border-[#c9dcf5] bg-white p-2 text-[#355987]">
                <X size={16} />
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Invoice number">
                <input required value={form.invoiceNumber} onChange={(e) => setForm({ ...form, invoiceNumber: e.target.value })} className={inputClass} />
              </Field>
              <Field label="Debtor company">
                <input required value={form.debtorCompany} onChange={(e) => setForm({ ...form, debtorCompany: e.target.value })} className={inputClass} />
              </Field>
              <Field label="Debtor country">
                <input required value={form.debtorCountry} onChange={(e) => setForm({ ...form, debtorCountry: e.target.value })} className={inputClass} />
              </Field>
              <Field label="Face value (USDT)">
                <input required type="number" min={1000} value={form.faceValue} onChange={(e) => setForm({ ...form, faceValue: Number(e.target.value) })} className={inputClass} />
              </Field>
              <Field label="Payment term (days)">
                <input required type="number" min={15} max={180} value={form.paymentTerm} onChange={(e) => setForm({ ...form, paymentTerm: Number(e.target.value) })} className={inputClass} />
              </Field>
              <Field label="Goods category">
                <input required value={form.goodsCategory} onChange={(e) => setForm({ ...form, goodsCategory: e.target.value })} className={inputClass} />
              </Field>
              <Field label="Due date">
                <input required type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className={inputClass} />
              </Field>
              <Field label="Upload invoice PDF">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(event) => setForm({ ...form, invoicePdf: event.target.files?.[0]?.name ?? "" })}
                  className={`${inputClass} file:mr-2 file:rounded-md file:border file:border-[#c7daf4] file:bg-white file:px-2 file:py-1 file:text-xs`}
                />
              </Field>
              <Field label="Upload shipment proof">
                <input
                  type="file"
                  onChange={(event) => setForm({ ...form, shipmentProof: event.target.files?.[0]?.name ?? "" })}
                  className={`${inputClass} file:mr-2 file:rounded-md file:border file:border-[#c7daf4] file:bg-white file:px-2 file:py-1 file:text-xs`}
                />
              </Field>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button type="button" onClick={onClose} className="rounded-xl border border-[#c4d7f3] bg-white px-4 py-2 text-sm font-semibold text-[#305480]">
                Cancel
              </button>
              <button type="submit" className="rounded-xl border border-[#b8d3ff] bg-[linear-gradient(160deg,#f8fbff,#dce9ff)] px-4 py-2 text-sm font-semibold text-[#0f3f91]">
                Submit Invoice
              </button>
            </div>
          </motion.form>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="space-y-1.5 text-xs text-[#567197]">
      <span>{label}</span>
      {children}
    </label>
  );
}
