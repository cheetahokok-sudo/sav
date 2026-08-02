import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import { COMPANY, SITE_URL } from "../lib/company";
import { allProducts } from "../lib/products";
import { CATEGORIES } from "../lib/series";
import { allArticles } from "../lib/knowledge";

// ============================================================================
// About page.
//
// Every fact here already existed on the site — but only inside JSON-LD, which
// is a machine-readable annotation of visible content, not a substitute for it.
// Language models read prose. A registered-since-1987 date and a real tax ID
// stated in a sentence is one of the cheapest trust signals available, and it
// is what a buyer checks before wiring money to a supplier they found online.
// ============================================================================

const description = `${COMPANY.nameEn} — ผู้นำเข้าและจัดจำหน่าย EOCR, Samwha DSP และ ZCT จดทะเบียนตั้งแต่ปี ${COMPANY.registeredYearBE} (${COMPANY.registeredYearAD}) เลขประจำตัวผู้เสียภาษี ${COMPANY.taxId} สำนักงานที่สมุทรปราการ`;

export const metadata: Metadata = {
  title: "เกี่ยวกับ SAV",
  description,
  alternates: { canonical: "/about/" },
  openGraph: {
    title: `เกี่ยวกับ SAV | ${COMPANY.nameEn}`,
    description,
    url: "/about/",
    type: "website",
  },
};

export default function AboutPage() {
  const productCount = allProducts().length;
  const articleCount = allArticles().length;
  const yearsTrading = new Date().getFullYear() - COMPANY.registeredYearAD;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "AboutPage",
        "@id": `${SITE_URL}/about/#about`,
        url: `${SITE_URL}/about/`,
        name: "เกี่ยวกับ SAV",
        inLanguage: "th",
        isPartOf: { "@id": `${SITE_URL}/#website` },
        mainEntity: { "@id": `${SITE_URL}/#organization` },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "หน้าแรก", item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: "เกี่ยวกับ SAV", item: `${SITE_URL}/about/` },
        ],
      },
    ],
  };

  const facts: [string, string][] = [
    ["ชื่อจดทะเบียน", COMPANY.nameTh],
    ["ชื่อภาษาอังกฤษ", COMPANY.nameEn],
    ["เลขประจำตัวผู้เสียภาษี", COMPANY.taxId],
    [
      "ปีที่จดทะเบียน",
      `พ.ศ. ${COMPANY.registeredYearBE} (ค.ศ. ${COMPANY.registeredYearAD}) — ดำเนินกิจการมา ${yearsTrading} ปี`,
    ],
    ["ที่ตั้งสำนักงาน", COMPANY.addressTh],
    ["เวลาทำการ", COMPANY.hoursTh],
    ["โทรศัพท์", `${COMPANY.officePhoneDisplay} · ${COMPANY.intlPhoneDisplay} (LINE / WhatsApp)`],
    ["โทรสาร", COMPANY.fax],
    ["อีเมล", COMPANY.email],
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
          <span className="text-ink">เกี่ยวกับ SAV</span>
        </nav>

        <article className="bg-white border border-gray-200 border-t-[3px] border-t-brand rounded-lg p-7 sm:p-10">
          <h1 className="font-display font-extrabold text-3xl text-ink leading-tight mb-4">
            เกี่ยวกับ SAV
          </h1>

          <p className="text-[15px] text-gray-700 leading-relaxed mb-4">
            <strong>{COMPANY.nameTh}</strong> จดทะเบียนเมื่อ พ.ศ.{" "}
            {COMPANY.registeredYearBE} (ค.ศ. {COMPANY.registeredYearAD}) เลขประจำตัวผู้เสียภาษี{" "}
            {COMPANY.taxId} สำนักงานอยู่ที่ {COMPANY.addressTh} เราเป็นผู้นำเข้าและจัดจำหน่าย
            อุปกรณ์ป้องกันมอเตอร์และเครื่องวัดทางไฟฟ้าจากเกาหลีใต้ ให้กับโรงงานอุตสาหกรรม
            ผู้รับเหมาระบบไฟฟ้า และผู้ผลิตตู้ควบคุมในประเทศไทย
          </p>

          <p className="text-[15px] text-gray-700 leading-relaxed mb-4">
            สินค้าหลักคือ <strong>EOCR</strong> (Schneider Electric / Samwha) รีเลย์ป้องกันมอเตอร์
            แบบอิเล็กทรอนิกส์ที่ใช้ทดแทนโอเวอร์โหลดรีเลย์แบบความร้อน,{" "}
            <strong>Samwha DSP</strong> มิเตอร์วัดไฟฟ้าดิจิทัลติดหน้าตู้ และ{" "}
            <strong>ZCT / CT</strong> สำหรับระบบตรวจไฟรั่วลงดินและการวัดกระแส
            ปัจจุบันมี {productCount} รุ่นในแคตตาล็อกออนไลน์
          </p>

          <h2 className="font-display font-extrabold text-xl text-ink mt-8 mb-3">
            เราทำงานอย่างไร
          </h2>
          <ul className="space-y-2.5 text-[14.5px] text-gray-700 leading-relaxed mb-4">
            <li>
              <strong>เทียบรุ่นให้ก่อนเสนอราคา</strong> — ส่งรูป Nameplate มอเตอร์
              หรือรูปตู้เดิมมาให้ ทีมงานเทียบช่วงกระแส แรงดันคอยล์ และรูปแบบเอาต์พุตให้ตรงกับงาน
              แทนที่จะเสนอรุ่นที่ใกล้เคียงแล้วให้ไปแก้หน้างานเอง
            </li>
            <li>
              <strong>ระบุสถานะสต็อกตามจริง</strong> — หน้าสินค้าทุกหน้าแยกชัดเจนระหว่าง
              &ldquo;พร้อมส่ง&rdquo; &ldquo;สั่งล่วงหน้า&rdquo; และ &ldquo;สอบถามสต็อก&rdquo;
              ถ้าของไม่มีเราบอกว่าไม่มี พร้อมกรอบเวลาที่ของจะเข้า
            </li>
            <li>
              <strong>เอกสารเก็บไว้บนเซิร์ฟเวอร์ของเราเอง</strong> — ดาต้าชีตและคู่มือที่ลิงก์
              จากหน้าสินค้าโหลดได้จริง ไม่ใช่ลิงก์ไปเว็บผู้ผลิตที่อาจย้ายหรือหายไป
            </li>
            <li>
              <strong>ของรุ่นเก่าที่เลิกผลิตแล้ว</strong> — เรายังเก็บข้อมูลรุ่นที่เลิกขายไว้
              พร้อมระบุรุ่นทดแทน เพราะโรงงานที่ต้องหาของมาเปลี่ยนตัวที่พังคือคนที่ต้องการข้อมูลนี้มากที่สุด
            </li>
          </ul>

          <h2 className="font-display font-extrabold text-xl text-ink mt-8 mb-3">
            ข้อมูลบริษัท
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[14px]">
              <tbody>
                {facts.map(([k, v]) => (
                  <tr key={k} className="border-b border-gray-100">
                    <td className="py-2.5 pr-4 font-semibold text-ink align-top w-[38%]">{k}</td>
                    <td className="py-2.5 text-gray-700 align-top">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2 className="font-display font-extrabold text-xl text-ink mt-8 mb-3">
            คลังความรู้
          </h2>
          <p className="text-[14.5px] text-gray-700 leading-relaxed mb-3">
            เราเขียนบทความเทคนิคภาษาไทยไว้ {articleCount} เรื่อง อ้างอิงมาตรฐาน IEC และ
            มาตรฐานการติดตั้งทางไฟฟ้าของไทย พร้อมเครื่องมือคำนวณกระแสมอเตอร์ แรงดันตก
            อัตราส่วน CT และขนาดรู ZCT ให้ใช้ฟรี — เขียนโดยทีมวิศวกรรมของ SAV จากงานหน้างานจริง
            ไม่ใช่การแปลเอกสารผู้ผลิต
          </p>
          <p className="text-[14.5px]">
            <Link href="/learn/" className="text-brand font-semibold hover:underline">
              เข้าสู่คลังความรู้ →
            </Link>
          </p>

          <h2 className="font-display font-extrabold text-xl text-ink mt-8 mb-3">
            กลุ่มสินค้า
          </h2>
          <ul className="grid sm:grid-cols-2 gap-2 text-[14px]">
            {CATEGORIES.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/products/series/${c.slug}/`}
                  className="text-brand hover:underline"
                >
                  {c.title}
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-9 pt-6 border-t border-gray-200">
            <Link
              href="/contact/"
              className="inline-block bg-brand text-white font-display text-xs font-bold tracking-wider uppercase px-6 py-3 hover:bg-brand-dark transition-colors"
            >
              ติดต่อ / ขอใบเสนอราคา →
            </Link>
          </div>
        </article>
      </div>

      <SiteFooter />
    </main>
  );
}
