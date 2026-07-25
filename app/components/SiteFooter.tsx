import Link from "next/link";
import { COMPANY } from "../lib/company";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || "";

// Slim shared footer for pages outside the homepage (/learn/* etc.) —
// modeled on the homepage footer (bg-neutral-900) but compact: 3 columns.
export default function SiteFooter() {
  return (
    <footer className="bg-neutral-900 mt-16">
      <div className="max-w-6xl mx-auto px-6 pt-12 pb-10 grid sm:grid-cols-3 gap-10">
        <div>
          <Link href="/" className="inline-flex items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${BASE}/sav-logo-footer.png`}
              alt="SAV Mechanical Services & Supplies"
              className="h-10 w-auto"
            />
          </Link>
          <p className="text-sm text-gray-500 leading-relaxed mt-4">
            {COMPANY.nameTh}
            <br />
            ผู้นำเข้าและจัดจำหน่าย EOCR Overload Relay และ Samwha DSP จากเกาหลีโดยตรง
          </p>
        </div>
        <div>
          <h4 className="font-display text-[11px] font-extrabold tracking-[0.18em] uppercase text-white mb-4">
            Quick Links
          </h4>
          <ul className="flex flex-col gap-2.5 text-sm">
            {[
              { href: "/", label: "หน้าแรก" },
              { href: "/products/", label: "สินค้าทั้งหมด" },
              { href: "/learn/", label: "คลังความรู้" },
              { href: "/#contact", label: "ติดต่อ / ขอใบเสนอราคา" },
            ].map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-gray-500 hover:text-brand transition-colors">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-display text-[11px] font-extrabold tracking-[0.18em] uppercase text-white mb-4">
            Contact Info
          </h4>
          <p className="text-sm text-gray-500 leading-relaxed">
            {COMPANY.addressLines[0]}
            <br />
            {COMPANY.addressLines[1]}
          </p>
          <p className="text-sm mt-3 flex flex-col gap-1.5">
            <a href={COMPANY.intlPhoneHref} className="text-gray-400 hover:text-brand transition-colors">
              📞 {COMPANY.intlPhoneDisplay} (LINE &amp; WA)
            </a>
            <a href={`mailto:${COMPANY.email}`} className="text-gray-400 hover:text-brand transition-colors">
              ✉️ {COMPANY.email}
            </a>
          </p>
        </div>
      </div>
      <div className="border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-5 font-display text-xs text-gray-600 text-center sm:text-left">
          © {new Date().getFullYear()} {COMPANY.nameEn} All Rights Reserved.
        </div>
      </div>
    </footer>
  );
}
