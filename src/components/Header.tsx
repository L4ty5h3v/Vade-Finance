"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Menu, X } from "lucide-react";
import type { MouseEvent } from "react";
import { useEffect, useState } from "react";
import BrandLogo from "./BrandLogo";

const navItems = [
  { label: "Product", href: "/#product" },
  { label: "How it Works", href: "/#how-it-works" },
  { label: "Marketplace", href: "/#marketplace-preview" },
  { label: "Security", href: "/#security" },
  { label: "Docs", href: "/docs" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const reducedMotion = useReducedMotion();

  const centerToHash = (hash: string, behavior: ScrollBehavior = "smooth") => {
    if (!hash.startsWith("#")) return;
    const id = hash.slice(1);
    if (!id) return;
    const target = document.getElementById(id);
    if (!target) return;
    target.scrollIntoView({ behavior, block: "center" });
  };

  const onNavAnchorClick = (event: MouseEvent<HTMLAnchorElement>, href: string) => {
    if (!href.startsWith("/#")) {
      return;
    }

    if (window.location.pathname !== "/") {
      return;
    }

    event.preventDefault();
    const hash = href.slice(1);
    history.replaceState(null, "", hash);
    centerToHash(hash);
  };

  useEffect(() => {
    const onHashChange = () => {
      centerToHash(window.location.hash);
    };

    if (window.location.pathname === "/" && window.location.hash) {
      // Wait for sections to render before initial centering.
      requestAnimationFrame(() => {
        centerToHash(window.location.hash, "auto");
      });
    }

    window.addEventListener("hashchange", onHashChange);
    return () => {
      window.removeEventListener("hashchange", onHashChange);
    };
  }, []);

  return (
    <motion.header
      initial={reducedMotion ? false : { opacity: 0, y: -24 }}
      animate={reducedMotion ? {} : { opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed inset-x-0 top-0 z-50"
    >
      <div className="mx-auto max-w-7xl px-4 pt-4 md:px-8">
        <div className="frosted rounded-2xl border border-white/45">
          <div className="flex h-16 items-center justify-between px-4 md:px-6">
            <BrandLogo href="/" size="md" />

            <nav className="hidden items-center gap-1 md:flex" aria-label="Primary navigation">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={(event) => onNavAnchorClick(event, item.href)}
                  className="rounded-xl px-3 py-2 text-sm font-medium text-[#27416d] transition hover:bg-white/70 hover:text-[#103d88]"
                >
                  {item.label}
                </a>
              ))}
            </nav>

            <div className="hidden items-center gap-3 md:flex">
              <a
                href="/app"
                className="rounded-xl border border-[#b8d3ff] bg-[linear-gradient(160deg,#f8fbff,#dce9ff)] px-4 py-2 text-sm font-semibold text-[#0f3f91] shadow-[0_16px_30px_rgba(21,64,143,0.34)] transition hover:-translate-y-0.5 hover:bg-[#ffffff]"
              >
                Launch App
              </a>
            </div>

            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-[#27416d] hover:bg-white/70 md:hidden"
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label="Toggle navigation"
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          <AnimatePresence>
            {open ? (
              <motion.nav
                id="mobile-nav"
                initial={reducedMotion ? false : { opacity: 0, height: 0 }}
                animate={reducedMotion ? {} : { opacity: 1, height: "auto" }}
                exit={reducedMotion ? {} : { opacity: 0, height: 0 }}
                className="overflow-hidden border-t border-white/50 md:hidden"
                aria-label="Mobile navigation"
              >
                <div className="flex flex-col gap-1 p-3">
                  {navItems.map((item) => (
                    <a
                      key={item.label}
                      href={item.href}
                      onClick={(event) => {
                        onNavAnchorClick(event, item.href);
                        setOpen(false);
                      }}
                      className="rounded-xl px-3 py-2 text-sm font-medium text-[#27416d] transition hover:bg-white/70"
                    >
                      {item.label}
                    </a>
                  ))}
                  <a
                    href="/app"
                    className="mt-2 rounded-xl border border-[#b8d3ff] bg-[linear-gradient(160deg,#f8fbff,#dce9ff)] px-4 py-2 text-center text-sm font-semibold text-[#0f3f91]"
                  >
                    Launch App
                  </a>
                </div>
              </motion.nav>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </motion.header>
  );
}
