"use client";

import { useState } from "react";
import Link from "next/link";

type NavLink = { href: string; label: string };

export default function MobileNav({ navLinks }: { navLinks: NavLink[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close menu" : "Open menu"}
        className="flex flex-col items-center justify-center gap-1.5 w-10 h-10"
      >
        <span
          className={`block w-6 h-[2px] bg-gray-700 transition-transform ${
            open ? "translate-y-[6px] rotate-45" : ""
          }`}
        />
        <span className={`block w-6 h-[2px] bg-gray-700 transition-opacity ${open ? "opacity-0" : ""}`} />
        <span
          className={`block w-6 h-[2px] bg-gray-700 transition-transform ${
            open ? "-translate-y-[6px] -rotate-45" : ""
          }`}
        />
      </button>

      {open && (
        <div className="absolute top-16 left-0 right-0 bg-white border-t border-gray-100 shadow-lg flex flex-col font-display text-sm font-semibold uppercase tracking-wide">
          {navLinks.map((l) =>
            l.href.startsWith("/") ? (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="px-6 py-4 border-b border-gray-100 text-gray-700 hover:text-brand hover:bg-gray-50 transition-colors"
              >
                {l.label}
              </Link>
            ) : (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="px-6 py-4 border-b border-gray-100 text-gray-700 hover:text-brand hover:bg-gray-50 transition-colors"
              >
                {l.label}
              </a>
            )
          )}
          <a
            href="#contact"
            onClick={() => setOpen(false)}
            className="px-6 py-4 bg-brand text-white text-center hover:bg-brand-dark transition-colors"
          >
            REQUEST QUOTATION
          </a>
        </div>
      )}
    </div>
  );
}
