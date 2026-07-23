"use client";

import { COMPANY, whatsappLink } from "../lib/company";

// Fixed bottom contact bar, mobile only. LINE-era Thai B2B buyers expect
// one-thumb-tap contact from anywhere on the page. Hidden on lg+ where the
// hero contact rail and header CTA already cover it.
export default function ContactBar() {
  const BASE = process.env.NEXT_PUBLIC_BASE_PATH || "";
  return (
    <>
      {/* spacer so the fixed bar never covers the footer's last line */}
      <div className="h-14 lg:hidden" aria-hidden="true" />
      <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden grid grid-cols-3 bg-white border-t border-gray-200 shadow-[0_-2px_10px_rgba(0,0,0,0.08)] font-display text-[11px] font-bold">
        <a
          href={COMPANY.intlPhoneHref}
          className="flex flex-col items-center justify-center py-2 text-ink active:bg-gray-50"
        >
          <span className="text-base leading-none mb-0.5">📞</span>
          โทร
        </a>
        <a
          href={
            COMPANY.lineOfficialUrl ||
            whatsappLink("สวัสดีครับ สนใจสินค้า EOCR ขอข้อมูลเพิ่มเติมครับ")
          }
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center py-2 text-[#06A64A] active:bg-gray-50 border-x border-gray-200"
        >
          <span className="text-base leading-none mb-0.5">💬</span>
          LINE
        </a>
        <a
          href={`${BASE}/products/`}
          className="flex flex-col items-center justify-center py-2 bg-brand text-white active:bg-brand-dark"
        >
          <span className="text-base leading-none mb-0.5">🧾</span>
          ขอใบเสนอราคา
        </a>
      </div>
    </>
  );
}
