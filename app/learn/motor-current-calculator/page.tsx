import type { Metadata } from "next";
import Link from "next/link";
import MotorCurrentCalculator from "../../components/knowledge/MotorCurrentCalculator";
import { AnswerSummary, ProductCTA, Disclaimer } from "../../components/knowledge/parts";

const SITE = "https://savautomation.com";

export const metadata: Metadata = {
  title: "เครื่องคำนวณกระแสมอเตอร์ 1 เฟส / 3 เฟส (Motor Current Calculator)",
  description:
    "คำนวณกระแสมอเตอร์ 1 เฟสและ 3 เฟส จาก kW/HP, แรงดัน, Power Factor และ Efficiency พร้อมสูตร ตัวอย่าง และแนวทางเลือกรีเลย์ป้องกันมอเตอร์ EOCR",
  alternates: { canonical: "/learn/motor-current-calculator/" },
  openGraph: {
    title: "เครื่องคำนวณกระแสมอเตอร์ 1 เฟส / 3 เฟส",
    description: "คำนวณกระแสมอเตอร์พร้อมสูตรและแนวทางเลือก EOCR",
    url: "/learn/motor-current-calculator/",
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
      name: "เครื่องคำนวณกระแสมอเตอร์",
      item: `${SITE}/learn/motor-current-calculator/`,
    },
  ],
};

export default function CalculatorPage() {
  return (
    <main className="bg-gray-100 min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="max-w-3xl mx-auto px-5 py-10">
        <nav className="text-[12.5px] text-gray-500 mb-4 flex flex-wrap gap-1.5">
          <Link href="/" className="hover:text-brand">หน้าแรก</Link>
          <span>/</span>
          <Link href="/learn/" className="hover:text-brand">คลังความรู้</Link>
          <span>/</span>
          <span>เครื่องคำนวณกระแสมอเตอร์</span>
        </nav>

        <p className="font-display text-[11px] font-extrabold tracking-[0.18em] uppercase text-brand mb-2">
          เครื่องมือคำนวณ
        </p>
        <h1 className="font-display font-extrabold text-3xl sm:text-[34px] leading-tight text-ink mb-2">
          เครื่องคำนวณกระแสมอเตอร์ 1 เฟส / 3 เฟส
        </h1>

        <AnswerSummary>
          กระแสมอเตอร์คำนวณโดยประมาณจากกำลัง (kW/HP) แรงดัน Power Factor และ Efficiency โดย
          3 เฟสใช้สูตร I = P / (√3 × V × PF × η) และ 1 เฟสใช้ I = P / (V × PF × η) ค่าที่ได้เป็นค่าประมาณ
          สำหรับการเลือกรีเลย์และสายไฟควรยึดกระแสพิกัดบน Nameplate เป็นข้อมูลหลัก
        </AnswerSummary>

        <div className="my-6">
          <MotorCurrentCalculator />
        </div>

        <h2 className="font-display font-extrabold text-2xl text-ink mt-10 mb-3">สูตรที่ใช้</h2>
        <div className="rounded bg-gray-900 text-gray-50 px-4 py-3 font-mono text-[15px] overflow-x-auto space-y-1">
          <div>3 เฟส:&nbsp; I = P / (√3 × V × PF × η)</div>
          <div>1 เฟส:&nbsp; I = P / (V × PF × η)</div>
          <div>โดย P (วัตต์) = kW × 1000 หรือ HP × 746</div>
        </div>

        <h2 className="font-display font-extrabold text-2xl text-ink mt-10 mb-3">ตัวอย่าง</h2>
        <p className="text-[16px] leading-[1.85] text-gray-800 my-4">
          มอเตอร์ 3 เฟส 5.5 kW, 400 V, PF 0.85, η 0.88:&nbsp;
          I = 5500 / (1.732 × 400 × 0.85 × 0.88) ≈ <b>10.6 A</b> (ค่าประมาณ — ตรวจ Nameplate จริงอีกครั้ง)
        </p>

        <h2 className="font-display font-extrabold text-2xl text-ink mt-10 mb-3">นำไปเลือก EOCR อย่างไร</h2>
        <p className="text-[16px] leading-[1.85] text-gray-800 my-4">
          นำกระแสพิกัด (Full-load Current) ไปเทียบกับ <b>ช่วงกระแส (setting range)</b> ของรีเลย์
          ให้ค่าใช้งานจริงอยู่กลาง ๆ ช่วง ไม่ชิดขอบบนหรือขอบล่าง หากกระแสสูงเกินช่วงที่ร้อยสายผ่านรูได้
          ต้องใช้ External CT และตั้งอัตราส่วนให้ตรง สำหรับวิธีสตาร์ตแบบ DOL ควรเผื่อ Start Delay
          เพราะกระแสเริ่มต้นสูงประมาณ 6–8 เท่า
        </p>

        <ProductCTA
          heading="ให้ SAV ช่วยเลือกรุ่น EOCR ให้พอดีกับมอเตอร์"
          note="ส่งค่ากระแส/รูป Nameplate มา ทีมวิศวกรช่วยตรวจช่วงกระแสและฟังก์ชันที่เหมาะกับงานให้"
          products={[
            { model: "EOCRSSD-05S", label: "EOCR-SSD ดิจิทัล" },
            { href: "/products/", label: "ดู EOCR ทั้งหมด" },
          ]}
        />

        <Disclaimer />
      </div>
    </main>
  );
}
