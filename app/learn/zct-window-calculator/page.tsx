import type { Metadata } from "next";
import Link from "next/link";
import ZctWindowCalculator from "../../components/knowledge/ZctWindowCalculator";
import { AnswerSummary, ProductCTA, Disclaimer } from "../../components/knowledge/parts";

const SITE = "https://savautomation.com";

export const metadata: Metadata = {
  title: "เครื่องช่วยเลือกขนาดรู ZCT จาก Cable OD",
  description:
    "หาขนาดรู ZCT (Woonyoung WYZR) ที่เหมาะจากเส้นผ่านศูนย์กลางรวมของสายที่ต้องลอดผ่าน พร้อมเผื่อระยะสำหรับดัด/ร้อยสาย — เป็นแนวทางเบื้องต้น ควรยืนยันกับ Datasheet",
  alternates: { canonical: "/learn/zct-window-calculator/" },
  openGraph: {
    title: "เครื่องช่วยเลือกขนาดรู ZCT จาก Cable OD",
    description: "หาขนาดรู ZCT Woonyoung WYZR จากเส้นผ่านศูนย์กลางสาย",
    url: "/learn/zct-window-calculator/",
    type: "website",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "หน้าแรก", item: `${SITE}/` },
    { "@type": "ListItem", position: 2, name: "คลังความรู้", item: `${SITE}/learn/` },
    { "@type": "ListItem", position: 3, name: "เครื่องช่วยเลือกขนาดรู ZCT", item: `${SITE}/learn/zct-window-calculator/` },
  ],
};

export default function ZctWindowPage() {
  return (
    <main className="bg-gray-100 min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="max-w-3xl mx-auto px-5 py-10">
        <nav className="text-[12.5px] text-gray-500 mb-4 flex flex-wrap gap-1.5">
          <Link href="/" className="hover:text-brand">หน้าแรก</Link>
          <span>/</span>
          <Link href="/learn/" className="hover:text-brand">คลังความรู้</Link>
          <span>/</span>
          <span>เครื่องช่วยเลือกขนาดรู ZCT</span>
        </nav>

        <p className="font-display text-[11px] font-extrabold tracking-[0.18em] uppercase text-brand mb-2">
          เครื่องมือคำนวณ
        </p>
        <h1 className="font-display font-extrabold text-3xl sm:text-[34px] leading-tight text-ink mb-2">
          เครื่องช่วยเลือกขนาดรู ZCT จาก Cable OD
        </h1>

        <AnswerSummary>
          ZCT เลือกจากขนาดรู (window) ไม่ใช่จากกระแสโหลด โดยให้สายที่มีกระแสทุกเส้นลอดผ่านได้ครบพร้อมเผื่อระยะ
          สำหรับดัดและร้อยสาย เครื่องมือนี้รับเส้นผ่านศูนย์กลางรวมของสายแล้วแนะนำขนาดรู ZCT ของ Woonyoung
          (รุ่น WYZR ตั้งชื่อตามขนาดรูโดยประมาณเป็นมิลลิเมตร) — เป็นแนวทางเบื้องต้น ต้องยืนยันขนาดรูจริงและระยะเผื่อ
          กับ Datasheet ของรุ่น
        </AnswerSummary>

        <div className="my-6">
          <ZctWindowCalculator />
        </div>

        <h2 className="font-display font-extrabold text-2xl text-ink mt-10 mb-3">เลือกอย่างไร</h2>
        <p className="text-[16px] leading-[1.85] text-gray-800 my-4">
          รวมเส้นผ่านศูนย์กลางของสายที่มีกระแสทุกเส้นที่ต้องลอดผ่าน (เฟส + นิวทรัล) แล้วเลือกรุ่นที่ขนาดรู
          <b> ใหญ่กว่าพอสมควร</b> เพื่อเผื่อฉนวนและการดัดสาย รุ่น WYZR ของ Woonyoung มีขนาดรูโดยประมาณ
          Φ30, 50, 65, 80, 100, 120, 150 และ 200 มม. โดยเลขรุ่นสื่อถึงขนาดรู (เช่น WYZR-100N ≈ รู Φ100 มม.)
        </p>

        <div className="rounded border-l-4 border-amber-300 bg-amber-50 text-amber-900 px-4 py-3 text-[14px] leading-relaxed my-4">
          ⚠️ เลขรุ่นเป็นขนาดรู <b>โดยประมาณ</b> — ขนาดรูจริงและระยะเผื่อที่ใช้ได้ต้องดูจาก Dimension Drawing /
          Datasheet ของรุ่นนั้น หรือให้ทีม SAV ช่วยยืนยันก่อนสั่ง
        </div>

        <h2 className="font-display font-extrabold text-2xl text-ink mt-10 mb-3">ข้อควรระวังการติดตั้ง</h2>
        <ul className="text-[16px] leading-[1.85] text-gray-800 my-4 list-disc pl-6 space-y-1">
          <li>ให้สายที่มีกระแสทุกเส้นลอดผ่านแกนเดียวกันในทิศทางเดียวกัน</li>
          <li><b>สายดิน (PE) ต้องไม่ลอดผ่าน</b> ZCT มิฉะนั้นการตรวจจับจะผิดพลาด</li>
          <li>ZCT เลือกจากขนาดรู + ความเข้ากันกับรีเลย์ ไม่ใช่จากกระแสโหลด</li>
        </ul>

        <ProductCTA
          heading="ให้ SAV ยืนยันรุ่น ZCT ที่ใช่"
          note="ส่งจำนวนสาย ขนาดสาย และ Cable OD รวม ทีมช่วยตรวจขนาดรู ZCT Woonyoung ที่เหมาะให้"
          products={[
            { model: "WYZR-N", label: "ZCT Woonyoung (200mA/1.5mA)" },
            { model: "WYZR", label: "ZCT Woonyoung (200mA/100mV)" },
          ]}
        />

        <p className="text-[13.5px] text-gray-600 my-4">
          อ่านหลักการเต็มที่{" "}
          <Link href="/learn/what-is-zct/" className="text-brand font-semibold hover:underline">ZCT คืออะไร</Link>{" "}
          และ{" "}
          <Link href="/learn/how-to-select-zct/" className="text-brand font-semibold hover:underline">วิธีเลือกขนาด ZCT</Link>
        </p>

        <Disclaimer />
      </div>
    </main>
  );
}
