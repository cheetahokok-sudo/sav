import type { Metadata } from "next";
import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";
import Link from "next/link";
import EocrRangeCalculator from "../../components/knowledge/EocrRangeCalculator";
import { AnswerSummary, ProductCTA, Disclaimer } from "../../components/knowledge/parts";

const SITE = "https://savautomation.com";

export const metadata: Metadata = {
  title: "เครื่องช่วยเลือกช่วงกระแส EOCR (EOCR Current-Range Selector)",
  description:
    "กรอกกระแสมอเตอร์ (หรือคำนวณจาก kW/HP) แล้วดูว่ารุ่น EOCR-SSD / EUCR ช่วงกระแสไหนครอบคลุม พร้อมคำแนะนำให้ตั้งค่าอยู่กลางช่วงเพื่อป้องกันแม่นยำและลดการทริปผิดพลาด",
  alternates: { canonical: "/learn/eocr-current-range-calculator/" },
  openGraph: {
    title: "เครื่องช่วยเลือกช่วงกระแส EOCR",
    description: "หาช่วงกระแส EOCR-SSD / EUCR ที่เหมาะกับกระแสมอเตอร์ของคุณ",
    url: "/learn/eocr-current-range-calculator/",
    type: "website",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "หน้าแรก", item: `${SITE}/` },
    { "@type": "ListItem", position: 2, name: "คลังความรู้", item: `${SITE}/learn/` },
    {
      "@type": "ListItem",
      position: 3,
      name: "เครื่องช่วยเลือกช่วงกระแส EOCR",
      item: `${SITE}/learn/eocr-current-range-calculator/`,
    },
  ],
};

export default function EocrRangePage() {
  return (
    <main className="bg-gray-100 min-h-screen">
      <SiteHeader />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="max-w-3xl mx-auto px-5 py-10">
        <nav className="text-[12.5px] text-gray-500 mb-4 flex flex-wrap gap-1.5">
          <Link href="/" className="hover:text-brand">หน้าแรก</Link>
          <span>/</span>
          <Link href="/learn/" className="hover:text-brand">คลังความรู้</Link>
          <span>/</span>
          <span>เครื่องช่วยเลือกช่วงกระแส EOCR</span>
        </nav>

        <p className="font-display text-[11px] font-extrabold tracking-[0.18em] uppercase text-brand mb-2">
          เครื่องมือคำนวณ
        </p>
        <h1 className="font-display font-extrabold text-3xl sm:text-[34px] leading-tight text-ink mb-2">
          เครื่องช่วยเลือกช่วงกระแส EOCR
        </h1>

        <AnswerSummary>
          รีเลย์ป้องกันมอเตอร์เลือกจาก “ช่วงกระแส (setting range)” ไม่ใช่รุ่นเดียวครอบคลุมทุกกระแส
          หลักคือให้กระแสพิกัดของมอเตอร์ (Full-load Current) อยู่ราวกลางช่วงของรุ่นที่เลือก จะตั้งค่าได้ละเอียด
          และลดการทริปผิดพลาด เครื่องมือนี้จับคู่กระแสของคุณกับช่วงของรุ่น EOCR-SSD (กระแสเกิน) และ EUCR
          (กระแสต่ำ) ที่พร้อมส่ง — ค่าที่ได้เป็นแนวทางเบื้องต้น ควรยืนยันกับ Nameplate จริง
        </AnswerSummary>

        <div className="my-6">
          <EocrRangeCalculator />
        </div>

        <h2 className="font-display font-extrabold text-2xl text-ink mt-10 mb-3">ทำไมต้องเลือกช่วงให้พอดี</h2>
        <p className="text-[16px] leading-[1.85] text-gray-800 my-4">
          ถ้าเลือกช่วงกว้างเกินไป (กระแสใช้งานอยู่ปลายล่างของช่วง) จะตั้งจุดตัดละเอียดยากและอาจป้องกันโหลดเกิน
          ได้ไม่ทันพอ ถ้าชิดขอบบนก็เสี่ยงทริปตอนกระแสแกว่งปกติ แนวทางที่ดีคือให้กระแสพิกัดอยู่ประมาณ
          กลางช่วง แล้วเผื่อ Start Delay สำหรับการสตาร์ตแบบ DOL ที่กระแสเริ่มต้นสูงราว 6–8 เท่า
        </p>

        <h2 className="font-display font-extrabold text-2xl text-ink mt-10 mb-3">ช่วงกระแสรุ่นที่พร้อมส่ง</h2>
        <div className="overflow-x-auto my-4">
          <table className="w-full text-[14.5px] border-collapse">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="border border-gray-200 px-3 py-2 font-semibold">รุ่น</th>
                <th className="border border-gray-200 px-3 py-2 font-semibold">ชนิด</th>
                <th className="border border-gray-200 px-3 py-2 font-semibold">ช่วงกระแส</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-200 px-3 py-2">EOCR-SSD-05S</td>
                <td className="border border-gray-200 px-3 py-2">ป้องกันกระแสเกิน (ดิจิทัล)</td>
                <td className="border border-gray-200 px-3 py-2">0.5–6 A</td>
              </tr>
              <tr>
                <td className="border border-gray-200 px-3 py-2">EOCR-SSD-60S</td>
                <td className="border border-gray-200 px-3 py-2">ป้องกันกระแสเกิน (ดิจิทัล)</td>
                <td className="border border-gray-200 px-3 py-2">10–60 A</td>
              </tr>
              <tr>
                <td className="border border-gray-200 px-3 py-2">EUCR-05S / 30S / 60S</td>
                <td className="border border-gray-200 px-3 py-2">ป้องกันกระแสต่ำ (ดิจิทัล)</td>
                <td className="border border-gray-200 px-3 py-2">0.5–6 / 3–30 / 5–60 A</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-[13.5px] leading-relaxed text-gray-600 my-3">
          หมายเหตุ: ช่วง 6–10 A ไม่มีในรุ่น EOCR-SSD ดิจิทัลที่พร้อมส่ง — มีรุ่นอนาล็อก EOCR-SS (0.5–6 / 3–30 / 5–60 A)
          และรุ่นดิจิทัลตระกูลอื่นตามสต๊อก สอบถามทีม SAV เพื่อเช็คช่วงที่ต้องการได้
        </p>

        <ProductCTA
          heading="ให้ SAV ยืนยันรุ่นและช่วงกระแสที่ใช่"
          note="ส่งค่ากระแส/รูป Nameplate มา ทีมวิศวกรช่วยตรวจช่วงกระแส ฟังก์ชัน และสต๊อกที่เหมาะกับงานให้"
          products={[
            { model: "EOCRSSD-05S", label: "EOCR-SSD ดิจิทัล" },
            { model: "EUCR-05S", label: "EUCR (กระแสต่ำ)" },
            { href: "/products/", label: "ดู EOCR ทั้งหมด" },
          ]}
        />

        <p className="text-[13.5px] text-gray-600 my-4">
          ไม่ทราบกระแสพิกัด? เริ่มที่{" "}
          <Link href="/learn/motor-current-calculator/" className="text-brand font-semibold hover:underline">
            เครื่องคำนวณกระแสมอเตอร์
          </Link>{" "}
          แล้วนำค่ามาหาช่วง EOCR ต่อได้เลย
        </p>

        <Disclaimer />
      </div>
      <SiteFooter />
    </main>
  );
}
