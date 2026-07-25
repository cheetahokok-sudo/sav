import type { Metadata } from "next";
import Link from "next/link";
import VoltageDropCalculator from "../../components/knowledge/VoltageDropCalculator";
import { AnswerSummary, ProductCTA, Disclaimer } from "../../components/knowledge/parts";

const SITE = "https://savautomation.com";

export const metadata: Metadata = {
  title: "เครื่องคำนวณแรงดันตกในสายไฟ (Voltage Drop Calculator)",
  description:
    "คำนวณแรงดันตก (Voltage Drop) ในสายไฟจากกระแส ระยะสาย และค่า mV/A/m ของสาย พร้อมเทียบกับเกณฑ์ วสท. (ไม่เกิน 5%) เพื่อช่วยตัดสินใจเพิ่มขนาดสาย",
  alternates: { canonical: "/learn/voltage-drop-calculator/" },
  openGraph: {
    title: "เครื่องคำนวณแรงดันตกในสายไฟ",
    description: "คำนวณ Voltage Drop และเทียบเกณฑ์ วสท. 5%",
    url: "/learn/voltage-drop-calculator/",
    type: "website",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "หน้าแรก", item: `${SITE}/` },
    { "@type": "ListItem", position: 2, name: "คลังความรู้", item: `${SITE}/learn/` },
    { "@type": "ListItem", position: 3, name: "เครื่องคำนวณแรงดันตก", item: `${SITE}/learn/voltage-drop-calculator/` },
  ],
};

export default function VoltageDropPage() {
  return (
    <main className="bg-gray-100 min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="max-w-3xl mx-auto px-5 py-10">
        <nav className="text-[12.5px] text-gray-500 mb-4 flex flex-wrap gap-1.5">
          <Link href="/" className="hover:text-brand">หน้าแรก</Link>
          <span>/</span>
          <Link href="/learn/" className="hover:text-brand">คลังความรู้</Link>
          <span>/</span>
          <span>เครื่องคำนวณแรงดันตก</span>
        </nav>

        <p className="font-display text-[11px] font-extrabold tracking-[0.18em] uppercase text-brand mb-2">
          เครื่องมือคำนวณ
        </p>
        <h1 className="font-display font-extrabold text-3xl sm:text-[34px] leading-tight text-ink mb-2">
          เครื่องคำนวณแรงดันตกในสายไฟ
        </h1>

        <AnswerSummary>
          แรงดันตก (Voltage Drop) คำนวณโดยประมาณจากสูตร VD = (mV/A/m × กระแส × ระยะสาย) / 1000 โดยค่า mV/A/m
          อ่านจากตารางมาตรฐาน/แคตตาล็อกสายให้ตรงระบบ (1 เฟส/3 เฟส) มาตรฐาน วสท. แนะนำให้แรงดันตกรวมไม่เกิน 5%
          ของแรงดันระบบ (วงจรย่อยแนะนำ ≤ 3%) ค่าที่ได้เป็นค่าประมาณสำหรับคัดกรองขนาดสายเบื้องต้น
        </AnswerSummary>

        <div className="my-6">
          <VoltageDropCalculator />
        </div>

        <h2 className="font-display font-extrabold text-2xl text-ink mt-10 mb-3">สูตรที่ใช้</h2>
        <div className="rounded bg-gray-900 text-gray-50 px-4 py-3 font-mono text-[15px] overflow-x-auto space-y-1">
          <div>VD (โวลต์) = (mV/A/m × I × L) / 1000</div>
          <div>%VD = VD / แรงดันระบบ × 100</div>
          <div>โดย I = กระแส (A), L = ระยะสายทางเดียว (เมตร)</div>
        </div>

        <h2 className="font-display font-extrabold text-2xl text-ink mt-10 mb-3">ค่า mV/A/m มาจากไหน</h2>
        <p className="text-[16px] leading-[1.85] text-gray-800 my-4">
          ค่า <b>mV/A/m</b> (แรงดันตกต่อกระแส 1 แอมป์ ต่อความยาว 1 เมตร) เป็นค่าประจำของสายแต่ละขนาด/ชนิด
          หาได้จาก <b>ตารางในมาตรฐานการติดตั้งฯ (วสท.)</b> หรือ <b>แคตตาล็อกของผู้ผลิตสาย</b> โดยมีคอลัมน์แยก
          สำหรับระบบ 1 เฟสและ 3 เฟส — เลือกให้ตรงกับระบบที่ใช้จริง
        </p>

        <h2 className="font-display font-extrabold text-2xl text-ink mt-10 mb-3">เกณฑ์ที่ควรผ่าน</h2>
        <p className="text-[16px] leading-[1.85] text-gray-800 my-4">
          มาตรฐานการติดตั้งทางไฟฟ้าสำหรับประเทศไทย (วสท.) แนะนำให้ <b>แรงดันตกรวม (สายป้อน + วงจรย่อย)
          ไม่เกิน 5%</b> ของแรงดันที่กำหนด และมักให้วงจรย่อยไม่เกิน 3% หากเกินควรพิจารณาเพิ่มขนาดสาย ลดระยะ
          หรือทบทวนการจัดโหลด (ตรวจสอบฉบับล่าสุดของ วสท. เสมอ)
        </p>

        <ProductCTA
          heading="ให้ SAV ช่วยตรวจการเลือกสายและอุปกรณ์ป้องกัน"
          note="ส่งค่ากระแส ระยะสาย และชนิดสายมา ทีมช่วยตรวจแรงดันตกและอุปกรณ์ป้องกันที่เหมาะให้"
          products={[{ href: "/products/", label: "ดูสินค้าทั้งหมด" }]}
        />

        <Disclaimer />
      </div>
    </main>
  );
}
