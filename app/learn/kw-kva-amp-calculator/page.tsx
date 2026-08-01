import type { Metadata } from "next";
import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";
import Link from "next/link";
import PowerConverterCalculator from "../../components/knowledge/PowerConverterCalculator";
import { AnswerSummary, ProductCTA, Disclaimer } from "../../components/knowledge/parts";

const SITE = "https://savautomation.com";

export const metadata: Metadata = {
  title: "แปลง kW ↔ kVA ↔ Amp 1 เฟส / 3 เฟส (Power Converter)",
  description:
    "เครื่องแปลงหน่วยไฟฟ้า kW เป็น kVA เป็น Amp (และย้อนกลับ) สำหรับระบบ 1 เฟสและ 3 เฟส จากแรงดันและ Power Factor พร้อมสูตรและตัวอย่างการใช้เลือกอุปกรณ์",
  alternates: { canonical: "/learn/kw-kva-amp-calculator/" },
  openGraph: {
    title: "แปลง kW ↔ kVA ↔ Amp 1 เฟส / 3 เฟส",
    description: "แปลงกำลังไฟฟ้าและกระแสจากแรงดันและ PF พร้อมสูตร",
    url: "/learn/kw-kva-amp-calculator/",
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
      name: "แปลง kW ↔ kVA ↔ Amp",
      item: `${SITE}/learn/kw-kva-amp-calculator/`,
    },
  ],
};

export default function CalculatorPage() {
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
          <span>แปลง kW ↔ kVA ↔ Amp</span>
        </nav>

        <p className="font-display text-[11px] font-extrabold tracking-[0.18em] uppercase text-brand mb-2">
          เครื่องมือคำนวณ
        </p>
        <h1 className="font-display font-extrabold text-3xl sm:text-[34px] leading-tight text-ink mb-2">
          แปลง kW ↔ kVA ↔ Amp (1 เฟส / 3 เฟส)
        </h1>

        <AnswerSummary>
          kW (กำลังจริง) kVA (กำลังปรากฏ) และกระแส (A) แปลงถึงกันได้ผ่านแรงดันและ Power Factor:
          kVA = kW ÷ PF และกระแส 3 เฟส I = P / (√3 × V × PF) ส่วน 1 เฟสตัด √3 ออก
          กรอกค่าใดค่าหนึ่งเครื่องมือจะคำนวณอีกสองค่าให้ทันที ค่าที่ได้เป็นค่าประมาณสำหรับเลือกอุปกรณ์เบื้องต้น
        </AnswerSummary>

        <div className="my-6">
          <PowerConverterCalculator />
        </div>

        <h2 className="font-display font-extrabold text-2xl text-ink mt-10 mb-3">สูตรที่ใช้</h2>
        <div className="rounded bg-gray-900 text-gray-50 px-4 py-3 font-mono text-[15px] overflow-x-auto space-y-1">
          <div>kVA = kW ÷ PF&nbsp;&nbsp;·&nbsp;&nbsp;kW = kVA × PF</div>
          <div>3 เฟส:&nbsp; I = kW × 1000 / (√3 × V × PF) = kVA × 1000 / (√3 × V)</div>
          <div>1 เฟส:&nbsp; I = kW × 1000 / (V × PF) = kVA × 1000 / V</div>
        </div>

        <h2 className="font-display font-extrabold text-2xl text-ink mt-10 mb-3">ตัวอย่าง</h2>
        <p className="text-[16px] leading-[1.85] text-gray-800 my-4">
          โหลด 3 เฟส 400 V, PF 0.85, 30 kW:&nbsp; kVA = 30 / 0.85 ≈ <b>35.3 kVA</b> และ
          I = 30,000 / (1.732 × 400 × 0.85) ≈ <b>50.9 A</b> — ตัวเลขนี้ใช้ประเมินขนาดหม้อแปลง
          เมนเบรกเกอร์ หรือช่วงกระแสของรีเลย์ป้องกันเบื้องต้นได้
        </p>

        <h2 className="font-display font-extrabold text-2xl text-ink mt-10 mb-3">ใช้กับงานจริงอย่างไร</h2>
        <p className="text-[16px] leading-[1.85] text-gray-800 my-4">
          <b>kVA</b> ใช้คุยกับขนาดหม้อแปลง/เครื่องกำเนิดไฟ <b>kW</b> คือกำลังที่โหลดใช้จริง และ
          <b> A</b> คือค่าที่นำไปเทียบขนาดสาย เบรกเกอร์ และช่วงกระแสรีเลย์ป้องกันมอเตอร์
          สำหรับมอเตอร์ให้ยึดกระแส Full-load บน Nameplate เป็นหลัก เพราะสูตรนี้ไม่รวม Efficiency —
          คำนวณกระแสมอเตอร์โดยเฉพาะได้ที่{" "}
          <Link href="/learn/motor-current-calculator/" className="text-brand hover:underline">
            เครื่องคำนวณกระแสมอเตอร์
          </Link>{" "}
          แล้วเทียบช่วงรีเลย์ที่{" "}
          <Link href="/learn/eocr-current-range-calculator/" className="text-brand hover:underline">
            เครื่องช่วยเลือกช่วงกระแส EOCR
          </Link>
        </p>

        <ProductCTA
          heading="ให้ SAV ช่วยเลือกอุปกรณ์ให้พอดีกับโหลด"
          note="ส่งค่า kW/kVA/A ของโหลดมา ทีมวิศวกรช่วยเทียบรุ่นรีเลย์ป้องกันและมิเตอร์ที่เหมาะกับงานให้"
          products={[
            { model: "EOCRSSD-60S", label: "EOCR-SSD 10–60 A" },
            { model: "DSP-PM-1Z7", label: "มิเตอร์ Samwha DSP" },
            { href: "/products/", label: "ดูสินค้าทั้งหมด" },
          ]}
        />

        <Disclaimer />
      </div>
      <SiteFooter />
    </main>
  );
}
