import type { Metadata } from "next";
import Link from "next/link";
import CtRatioCalculator from "../../components/knowledge/CtRatioCalculator";
import { AnswerSummary, ProductCTA, Disclaimer } from "../../components/knowledge/parts";

const SITE = "https://savautomation.com";

export const metadata: Metadata = {
  title: "เครื่องช่วยเลือก CT Ratio (CT Ratio Calculator)",
  description:
    "หา CT ratio ที่เหมาะจากกระแสโหลด (หรือขนาด kVA) โดยเลือกพิกัดปฐมภูมิมาตรฐานให้กระแสใช้งานอยู่ราว 60–80% ของพิกัด CT เพื่อความแม่นยำในการวัด",
  alternates: { canonical: "/learn/ct-ratio-calculator/" },
  openGraph: {
    title: "เครื่องช่วยเลือก CT Ratio",
    description: "หา CT ratio มาตรฐานจากกระแสโหลดหรือขนาด kVA",
    url: "/learn/ct-ratio-calculator/",
    type: "website",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "หน้าแรก", item: `${SITE}/` },
    { "@type": "ListItem", position: 2, name: "คลังความรู้", item: `${SITE}/learn/` },
    { "@type": "ListItem", position: 3, name: "เครื่องช่วยเลือก CT Ratio", item: `${SITE}/learn/ct-ratio-calculator/` },
  ],
};

export default function CtRatioPage() {
  return (
    <main className="bg-gray-100 min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="max-w-3xl mx-auto px-5 py-10">
        <nav className="text-[12.5px] text-gray-500 mb-4 flex flex-wrap gap-1.5">
          <Link href="/" className="hover:text-brand">หน้าแรก</Link>
          <span>/</span>
          <Link href="/learn/" className="hover:text-brand">คลังความรู้</Link>
          <span>/</span>
          <span>เครื่องช่วยเลือก CT Ratio</span>
        </nav>

        <p className="font-display text-[11px] font-extrabold tracking-[0.18em] uppercase text-brand mb-2">
          เครื่องมือคำนวณ
        </p>
        <h1 className="font-display font-extrabold text-3xl sm:text-[34px] leading-tight text-ink mb-2">
          เครื่องช่วยเลือก CT Ratio
        </h1>

        <AnswerSummary>
          CT (Current Transformer) เลือกจากกระแสโหลดสูงสุด โดยเลือกพิกัดปฐมภูมิมาตรฐาน (เช่น 100, 200, 400 …/5A)
          ให้กระแสใช้งานอยู่ราว 60–80% ของพิกัด CT จะวัดได้แม่นยำที่สุด เครื่องมือนี้รับกระแสโหลด (หรือคำนวณจาก
          ขนาด kVA) แล้วแนะนำ CT ratio มาตรฐานที่เหมาะ — เป็นแนวทางเบื้องต้น ควรตรวจคลาสความแม่นยำและ Burden
          ตามอุปกรณ์จริง
        </AnswerSummary>

        <div className="my-6">
          <CtRatioCalculator />
        </div>

        <h2 className="font-display font-extrabold text-2xl text-ink mt-10 mb-3">หลักการเลือก</h2>
        <p className="text-[16px] leading-[1.85] text-gray-800 my-4">
          เลือก <b>พิกัดปฐมภูมิ (primary)</b> ของ CT ให้สูงกว่ากระแสโหลดสูงสุด โดยให้กระแสใช้งานจริงอยู่ราว
          <b> 60–80%</b> ของพิกัด ถ้าเลือกใหญ่เกินไป กระแสจะอยู่ปลายล่างจนความแม่นยำลดลง ถ้าเล็กเกินไปก็เสี่ยง
          อิ่มตัว (saturation) ส่วน <b>วินาทีภูมิ (secondary)</b> มาตรฐานทั่วไปคือ 5A (บางระบบใช้ 1A)
        </p>

        <h2 className="font-display font-extrabold text-2xl text-ink mt-10 mb-3">พิกัดปฐมภูมิมาตรฐาน (×/5A)</h2>
        <div className="overflow-x-auto my-4">
          <table className="w-full text-[14.5px] border-collapse">
            <tbody>
              <tr>
                <td className="border border-gray-200 px-3 py-2">50, 75, 100, 150, 200, 250, 300, 400, 500, 600, 750, 800, 1000, 1200, 1500, 2000, 2500, 3000 …</td>
              </tr>
            </tbody>
          </table>
        </div>

        <ProductCTA
          heading="ต้องการ CT คู่กับมิเตอร์/รีเลย์?"
          note="ส่งกระแสโหลดหรือขนาดหม้อแปลงมา ทีม SAV ช่วยจับคู่ CT ratio กับมิเตอร์ Samwha DSP ที่ใช้ให้"
          products={[
            { model: "DSP-PM-1Z7", label: "Samwha DSP-PM (มิเตอร์)" },
            { href: "/products/", label: "ดูสินค้าทั้งหมด" },
          ]}
        />

        <p className="text-[13.5px] text-gray-600 my-4">
          หมายเหตุ: หน้านี้เป็นเรื่อง CT วัดกระแสทั่วไป — สำหรับ ZCT ตรวจไฟรั่วลงดิน ดู{" "}
          <Link href="/learn/what-is-zct/" className="text-brand font-semibold hover:underline">ZCT คืออะไร</Link>{" "}
          และ{" "}
          <Link href="/learn/zct-window-calculator/" className="text-brand font-semibold hover:underline">
            เครื่องช่วยเลือกขนาดรู ZCT
          </Link>
        </p>

        <Disclaimer />
      </div>
    </main>
  );
}
