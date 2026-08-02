import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import { COMPANY, SITE_URL, lineLink } from "../lib/company";

// ============================================================================
// Contact page.
//
// Contact details previously existed only as an anchor on the homepage
// (/#contact), which cannot rank, cannot be linked to precisely, and gives a
// search engine no page to associate with the business's NAP. This is that
// page. Everything here comes from lib/company.ts so the name, address and
// phone stay identical to the footer, the JSON-LD and the Google Business
// Profile — inconsistent NAP is a real local-ranking problem.
// ============================================================================

const description = `ติดต่อ ${COMPANY.nameEn} — โทร ${COMPANY.intlPhoneDisplay} (LINE / WhatsApp) หรือ ${COMPANY.officePhoneDisplay} · ${COMPANY.addressTh} · เวลาทำการ ${COMPANY.hoursTh}`;

export const metadata: Metadata = {
  title: "ติดต่อ / ขอใบเสนอราคา",
  description,
  alternates: { canonical: "/contact/" },
  openGraph: {
    title: `ติดต่อ / ขอใบเสนอราคา | ${COMPANY.nameEn}`,
    description,
    url: "/contact/",
    type: "website",
  },
};

export default function ContactPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ContactPage",
        "@id": `${SITE_URL}/contact/#contact`,
        url: `${SITE_URL}/contact/`,
        name: "ติดต่อ / ขอใบเสนอราคา",
        inLanguage: "th",
        isPartOf: { "@id": `${SITE_URL}/#website` },
        mainEntity: { "@id": `${SITE_URL}/#organization` },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "หน้าแรก", item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: "ติดต่อ", item: `${SITE_URL}/contact/` },
        ],
      },
    ],
  };

  const channels = [
    {
      icon: "💬",
      label: "LINE",
      value: "แชทกับทีมงานโดยตรง — ช่องทางที่ตอบเร็วที่สุด",
      href: lineLink(),
      external: true,
      primary: true,
    },
    {
      icon: "📞",
      label: COMPANY.intlPhoneDisplay,
      value: "มือถือ — รับสาย LINE และ WhatsApp หมายเลขเดียวกัน",
      href: COMPANY.intlPhoneHref,
      external: false,
      primary: false,
    },
    {
      icon: "☎️",
      label: COMPANY.officePhoneDisplay,
      value: "เบอร์สำนักงาน",
      href: COMPANY.officePhoneHref,
      external: false,
      primary: false,
    },
    {
      icon: "✉️",
      label: COMPANY.email,
      value: "อีเมล — เหมาะกับการส่งรายการยาวหรือแนบไฟล์",
      href: `mailto:${COMPANY.email}`,
      external: false,
      primary: false,
    },
  ];

  return (
    <main className="bg-gray-100 min-h-screen">
      <SiteHeader />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-3xl mx-auto px-6 py-10">
        <nav className="text-[12.5px] text-gray-500 mb-4 flex flex-wrap gap-1.5">
          <Link href="/" className="hover:text-brand">
            หน้าแรก
          </Link>
          <span>/</span>
          <span className="text-ink">ติดต่อ</span>
        </nav>

        <div className="bg-white border border-gray-200 border-t-[3px] border-t-brand rounded-lg p-7 sm:p-10 mb-6">
          <h1 className="font-display font-extrabold text-3xl text-ink leading-tight mb-3">
            ติดต่อ / ขอใบเสนอราคา
          </h1>
          <p className="text-[15px] text-gray-700 leading-relaxed mb-7">
            ตอบกลับพร้อมราคาและสถานะสต็อกภายในวันทำการ ({COMPANY.hoursTh})
          </p>

          <div className="flex flex-col gap-3">
            {channels.map((c) => (
              <a
                key={c.label}
                href={c.href}
                {...(c.external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                className={`flex items-start gap-4 rounded border px-5 py-4 transition-colors ${
                  c.primary
                    ? "border-brand bg-brand/5 hover:bg-brand/10"
                    : "border-gray-200 hover:border-brand"
                }`}
              >
                <span className="text-xl leading-none mt-0.5">{c.icon}</span>
                <span>
                  <span className="block font-display font-bold text-[15px] text-ink">
                    {c.label}
                  </span>
                  <span className="block text-[13px] text-gray-600 leading-snug mt-0.5">
                    {c.value}
                  </span>
                </span>
              </a>
            ))}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-7 sm:p-10 mb-6">
          <h2 className="font-display font-extrabold text-lg text-ink mb-4 pb-3 border-b border-gray-200">
            ส่งอะไรมาให้บ้าง จะได้ราคาเร็วที่สุด
          </h2>
          <ul className="space-y-2.5 text-[14.5px] text-gray-700 leading-relaxed">
            <li>
              <strong>รุ่นและจำนวน</strong> — ถ้ารู้รหัสรุ่นอยู่แล้ว ส่งรหัสกับจำนวนมาพอ
            </li>
            <li>
              <strong>ถ้าไม่รู้รุ่น</strong> — ส่งรูป Nameplate ของมอเตอร์ (กระแสพิกัด แรงดัน
              จำนวนเฟส) หรือรูปตัวเดิมในตู้ ทีมงานเทียบรุ่นให้
            </li>
            <li>
              <strong>แรงดันไฟควบคุม</strong> — 220 V หรือ 380 V เพราะรุ่นเดียวกันมีหลายแบบ
            </li>
            <li>
              <strong>จังหวัดที่จัดส่ง</strong> — เพื่อคิดค่าขนส่งและกรอบเวลา
            </li>
            <li>
              <strong>ต้องการใบกำกับภาษีหรือไม่</strong>
            </li>
          </ul>
          <p className="text-[13px] text-gray-600 mt-4">
            ยังไม่แน่ใจว่าต้องใช้รุ่นไหน — ลองอ่าน{" "}
            <Link href="/learn/how-to-select-eocr/" className="text-brand font-semibold hover:underline">
              วิธีเลือก EOCR
            </Link>{" "}
            หรือ{" "}
            <Link href="/learn/what-to-send-for-quote/" className="text-brand font-semibold hover:underline">
              ข้อมูลที่ควรส่งมาเพื่อขอราคา
            </Link>
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-7 sm:p-10">
          <h2 className="font-display font-extrabold text-lg text-ink mb-4 pb-3 border-b border-gray-200">
            สำนักงาน
          </h2>
          <p className="text-[15px] text-gray-800 font-semibold mb-1">{COMPANY.nameTh}</p>
          <p className="text-[14px] text-gray-700 leading-relaxed">
            {COMPANY.addressLines[0]}
            <br />
            {COMPANY.addressLines[1]}
          </p>
          <p className="text-[13.5px] text-gray-600 mt-3">
            เลขประจำตัวผู้เสียภาษี {COMPANY.taxId}
            <br />
            เวลาทำการ {COMPANY.hoursTh} · โทรสาร {COMPANY.fax}
          </p>

          <div className="mt-5 rounded overflow-hidden border border-gray-200">
            <iframe
              src={COMPANY.mapsEmbed}
              title={`แผนที่ ${COMPANY.nameTh}`}
              className="w-full h-[300px]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          <p className="text-[13px] text-gray-600 mt-5">
            รายละเอียดบริษัทเพิ่มเติมที่{" "}
            <Link href="/about/" className="text-brand font-semibold hover:underline">
              หน้าเกี่ยวกับ SAV
            </Link>
          </p>
        </div>
      </div>

      <SiteFooter />
    </main>
  );
}
