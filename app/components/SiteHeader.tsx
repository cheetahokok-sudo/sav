import Link from "next/link";
import MobileNav from "./MobileNav";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || "";

// Shared sticky top bar for pages outside the homepage (/learn/* etc.).
// Mirrors the homepage nav exactly; anchor links use "/#..." so they route
// back to the landing page from any route.
const NAV_LINKS = [
  { href: "/", label: "หน้าแรก" },
  { href: "/products/", label: "PRODUCTS" },
  { href: "/learn/", label: "LEARN" },
  { href: "/#contact", label: "CONTACT" },
];

export default function SiteHeader() {
  return (
    <nav className="sticky top-0 z-50 bg-white shadow-md flex items-center justify-between px-6 h-16">
      <Link href="/" className="flex items-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`${BASE}/sav-logo.png`}
          alt="SAV Mechanical Services & Supplies"
          className="h-10 w-auto"
        />
      </Link>
      <ul className="hidden lg:flex items-center font-display text-xs font-semibold tracking-wider uppercase">
        {NAV_LINKS.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="px-4 h-16 flex items-center text-gray-700 border-b-[3px] border-transparent hover:text-brand hover:border-brand transition-colors"
            >
              {l.label}
            </Link>
          </li>
        ))}
        <li>
          <Link
            href="/products/"
            className="ml-2 px-5 h-16 flex items-center bg-brand text-white font-bold hover:bg-brand-dark transition-colors"
          >
            REQUEST QUOTATION
          </Link>
        </li>
      </ul>
      <MobileNav navLinks={NAV_LINKS} quoteHref="/products/" />
    </nav>
  );
}
