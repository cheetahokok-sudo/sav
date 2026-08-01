import type { Metadata } from "next";
import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";
import Link from "next/link";
import StarDeltaCalculator from "../../components/knowledge/StarDeltaCalculator";
import { AnswerSummary, ProductCTA, Disclaimer } from "../../components/knowledge/parts";

const SITE = "https://savautomation.com";

export const metadata: Metadata = {
  title: "คำนวณกระแสสตาร์-เดลต้า และค่าตั้ง EOCR (Star-Delta Current)",
  description:
    "คำนวณกระแส Line กับกระแสในกิ่งเดลต้า (FLA × 0.58) ของมอเตอร์สตาร์-เดลต้า พร้อมค่าตั้ง Current Dial ของ EOCR ทั้งกรณีติดฝั่ง Line และในกิ่งเดลต้า",
  alternates: { canonical: "/learn/star-delta-current-calculator/" },
  openGraph: {
    title: "คำนวณกระแสสตาร์-เดลต้า และค่าตั้ง EOCR",
    description: "กระแส Line vs กิ่งเดลต้า (×0.58) + ค่าตั้ง Dial สำหรับ CT ทั้งสองตำแหน่ง",
    url: "/learn/star-delta-current-calculator/",
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
      name: "คำนวณกระแสสตาร์-เดลต้า",
      item: `${SITE}/learn/star-delta-current-calculator/`,
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
          <span>คำนวณกระแสสตาร์-เดลต้า</span>
        </nav>

        <p className="font-display text-[11px] font-extrabold tracking-[0.18em] uppercase text-brand mb-2">
          เครื่องมือคำนวณ
        </p>
        <h1 className="font-display font-extrabold text-3xl sm:text-[34px] leading-tight text-ink mb-2">
          คำนวณกระแสสตาร์-เดลต้า และค่าตั้ง EOCR
        </h1>

        <AnswerSummary>
          ในวงจรสตาร์-เดลต้าขณะรันโหมดเดลต้า กระแสในขดลวด (Phase) เท่ากับกระแส Line หารด้วย √3
          หรือประมาณ FLA × 0.58 ดังนั้นถ้ารีเลย์/CT ติดฝั่ง Line ให้ตั้ง Current Dial เท่า FLA
          แต่ถ้าติดในกิ่งเดลต้า (อนุกรมกับขดลวด) ต้องตั้งประมาณ FLA × 0.58 มิฉะนั้นการป้องกันจะเพี้ยน
        </AnswerSummary>

        <div className="my-6">
          <StarDeltaCalculator />
        </div>

        <h2 className="font-display font-extrabold text-2xl text-ink mt-10 mb-3">สูตรที่ใช้</h2>
        <div className="rounded bg-gray-900 text-gray-50 px-4 py-3 font-mono text-[15px] overflow-x-auto space-y-1">
          <div>I_phase = I_line ÷ √3 ≈ I_line × 0.577</div>
          <div>CT ฝั่ง Line: ตั้ง Dial = FLA</div>
          <div>CT ในกิ่งเดลต้า: ตั้ง Dial = FLA ÷ √3 ≈ FLA × 0.58</div>
        </div>

        <h2 className="font-display font-extrabold text-2xl text-ink mt-10 mb-3">ตัวอย่าง</h2>
        <p className="text-[16px] leading-[1.85] text-gray-800 my-4">
          มอเตอร์ 22 kW, 380 V, FLA 45 A สตาร์ทแบบสตาร์-เดลต้า: ถ้ารีเลย์ติดฝั่ง Line ตั้ง <b>45 A</b> —
          แต่ถ้าร้อยสายผ่านรีเลย์ในกิ่งเดลต้า กระแสที่รีเลย์เห็นคือ 45 / 1.732 ≈ <b>26 A</b> จึงต้องตั้ง
          Dial ≈ 26 A (รุ่นช่วง 10–60 A เช่น EOCR-SSD-60S จะให้ค่านี้อยู่กลางช่วงพอดี)
        </p>

        <h2 className="font-display font-extrabold text-2xl text-ink mt-10 mb-3">ทำไมตั้งเท่า FLA ในกิ่งเดลต้าไม่ได้</h2>
        <p className="text-[16px] leading-[1.85] text-gray-800 my-4">
          ถ้า CT อยู่ในกิ่งเดลต้าแต่ตั้ง Dial เท่า FLA รีเลย์จะเห็นกระแสแค่ ~58% ของค่าที่ตั้งไว้
          มอเตอร์อาจโหลดเกินมากโดยรีเลย์ไม่ตัด — เท่ากับไม่มีการป้องกันจริง อ่านเหตุผลเชิงวงจรแบบเต็มที่{" "}
          <Link href="/learn/eocr-in-star-delta/" className="text-brand hover:underline">
            EOCR ในวงจรสตาร์-เดลต้า
          </Link>{" "}
          และเปรียบเทียบวิธีสตาร์ทที่{" "}
          <Link href="/learn/motor-starting-methods/" className="text-brand hover:underline">
            DOL vs สตาร์-เดลต้า vs Soft Starter vs VFD
          </Link>
        </p>

        <ProductCTA
          heading="ให้ SAV ช่วยเลือกรุ่น EOCR สำหรับวงจรสตาร์-เดลต้า"
          note="ส่ง FLA และตำแหน่งติดตั้ง (Line หรือกิ่งเดลต้า) มา ทีมวิศวกรช่วยเช็คช่วงกระแสและค่าตั้งที่เหมาะให้"
          products={[
            { model: "EOCRSS-30S", label: "EOCR-SS 3–30 A" },
            { model: "EOCRSSD-60S", label: "EOCR-SSD 10–60 A" },
            { href: "/products/", label: "ดู EOCR ทั้งหมด" },
          ]}
        />

        <Disclaimer />
      </div>
      <SiteFooter />
    </main>
  );
}
