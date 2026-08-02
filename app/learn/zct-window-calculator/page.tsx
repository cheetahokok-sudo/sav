import type { Metadata } from "next";
import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";
import Link from "next/link";
import ZctWindowCalculator from "../../components/knowledge/ZctWindowCalculator";
import { AnswerSummary, ProductCTA, Disclaimer } from "../../components/knowledge/parts";

const SITE = "https://savautomation.com";

export const metadata: Metadata = {
  title: "เครื่องช่วยเลือกขนาดรู ZCT — เลือกจากการเดินสายและสเปกสาย",
  description:
    "เลือกขนาดรู ZCT (Woonyoung WYZR) แบบวิศวกร: เลือกการเดินสาย (1 เฟส / 3 เฟส / Star-Delta) และสเปกสาย (THW, CV, NYY, VCT ตามขนาด mm²) ระบบคำนวณมัดสายและวาดภาพจำลองรู ZCT พร้อมสายให้เห็นจริงตามสเกล",
  alternates: { canonical: "/learn/zct-window-calculator/" },
  openGraph: {
    title: "เครื่องช่วยเลือกขนาดรู ZCT — เห็นภาพสายในรูจริงตามสเกล",
    description: "เลือกการเดินสาย + สเปกสาย → เห็นภาพจำลองสายใน ZCT พร้อมรุ่นที่แนะนำ",
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
      <SiteHeader />
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
          เครื่องช่วยเลือกขนาดรู ZCT
        </h1>

        <AnswerSummary>
          ไม่ต้องรู้ Cable OD — แค่เลือกการเดินสาย (1 เฟส / 3 เฟส 3–4 สาย / Star-Delta 6 เส้น) และสเปกสายที่ใช้
          (THW, CV, NYY, VCT ตามขนาด mm²) ระบบจะดึงเส้นผ่านศูนย์กลางสายจากสเปกผู้ผลิต จัดเรียงมัดสายตามหลัก
          เรขาคณิต แล้ววาดภาพจำลองรู ZCT พร้อมสายให้เห็นจริงตามสเกล พร้อมแนะนำรุ่น Woonyoung WYZR ที่ใส่ได้
          แบบเหลือระยะร้อยสายสบาย ๆ โดย <b>เผื่อขนาดสายแต่ละเส้น 10–20%</b> เพราะสายจริงดัดตรงและมัดชิด
          แบบอุดมคติไม่ได้ และ <b>กันพื้นที่ร้อยสายเพิ่มตามจำนวนเส้น</b> เพราะ 2–3 เส้นสุดท้ายคือเส้นที่ร้อยยากที่สุด
        </AnswerSummary>

        <div className="my-6">
          <ZctWindowCalculator />
        </div>

        <h2 className="font-display font-extrabold text-2xl text-ink mt-10 mb-3">ทำไมต้องนับสายจากการเดินสาย</h2>
        <p className="text-[16px] leading-[1.85] text-gray-800 my-4">
          ZCT ตรวจ “ผลรวมกระแส” จึงต้องให้ <b>สายที่มีกระแสทุกเส้น</b> ลอดผ่านแกนเดียวกัน จำนวนเส้นจึงขึ้นกับ
          การเดินสาย ไม่ใช่แค่ขนาดมอเตอร์:
        </p>
        <div className="overflow-x-auto my-4">
          <table className="w-full text-[14.5px] border-collapse">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="border border-gray-200 px-3 py-2 font-semibold">การเดินสาย</th>
                <th className="border border-gray-200 px-3 py-2 font-semibold">สายเดี่ยวที่ลอด ZCT</th>
                <th className="border border-gray-200 px-3 py-2 font-semibold">หมายเหตุ</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-200 px-3 py-2">1 เฟส</td>
                <td className="border border-gray-200 px-3 py-2">2 เส้น (L + N)</td>
                <td className="border border-gray-200 px-3 py-2">—</td>
              </tr>
              <tr>
                <td className="border border-gray-200 px-3 py-2">3 เฟส 3 สาย</td>
                <td className="border border-gray-200 px-3 py-2">3 เส้น</td>
                <td className="border border-gray-200 px-3 py-2">มอเตอร์ทั่วไป DOL</td>
              </tr>
              <tr>
                <td className="border border-gray-200 px-3 py-2">3 เฟส 4 สาย</td>
                <td className="border border-gray-200 px-3 py-2">4 เส้น (มีนิวทรัล)</td>
                <td className="border border-gray-200 px-3 py-2">นิวทรัลต้องลอดด้วย</td>
              </tr>
              <tr>
                <td className="border border-gray-200 px-3 py-2">Star-Delta</td>
                <td className="border border-gray-200 px-3 py-2"><b>6 เส้น</b> (สายมอเตอร์ 2 ชุด)</td>
                <td className="border border-gray-200 px-3 py-2">ติด ZCT ฝั่งสายมอเตอร์</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-[16px] leading-[1.85] text-gray-800 my-4">
          ถ้าใช้ <b>สายหลายแกน (Multicore)</b> เช่น CV 4C — สายหนึ่งเส้นรวมทุกตัวนำอยู่แล้ว จึงลอดเพียง 1 เส้น
          (Star-Delta ที่ใช้สายหลายแกน = 2 เส้น) และ <b>สายดิน (PE) ต้องไม่ลอดผ่าน ZCT</b> เสมอ
        </p>

        <h2 className="font-display font-extrabold text-2xl text-ink mt-10 mb-3">วิธีคำนวณมัดสาย</h2>
        <p className="text-[16px] leading-[1.85] text-gray-800 my-4">
          เริ่มจากค่าคงที่การจัดเรียงวงกลมแบบแน่นที่สุด (circle packing): มัดสาย n เส้นต้องการวงกลมล้อมรอบ
          เส้นผ่านศูนย์กลาง k(n) เท่าของ OD สาย — เช่น 3 เส้น ≈ 2.15×, 4 เส้น ≈ 2.41×, 6 เส้น = 3×
        </p>
        <p className="text-[16px] leading-[1.85] text-gray-800 my-4">
          แต่ค่านั้นคือ <b>ค่าต่ำสุดทางทฤษฎี</b> ที่สมมติว่าสายทุกเส้นตรงสนิท ขนานกันพอดี และแนบชิดกัน
          โดยไม่มีช่องว่าง ซึ่งไม่มีงานจริงงานไหนเป็นแบบนั้น สายยังคงรัศมีดัดจากม้วน สายขนาดใหญ่แข็งและ
          ไม่ยอมเรียงแบน เครื่องมือนี้จึง <b>เผื่อขนาดของสายแต่ละเส้นเพิ่ม 10–20%</b> ก่อนคำนวณมัดรวม
          (ค่าเริ่มต้น 15%) แล้วค่อยใช้ค่านั้นเลือกรุ่น
        </p>

        <h3 className="font-display font-bold text-lg text-ink mt-7 mb-2">
          ระยะที่ต้องกันไว้ ไม่ได้มีไว้ให้มัดสายนั่ง แต่มีไว้ให้ร้อย
        </h3>
        <p className="text-[16px] leading-[1.85] text-gray-800 my-4">
          จุดที่คนคำนวณพลาดบ่อยคือคิดแค่ว่ามัดสายที่เสร็จแล้ว “นั่ง” อยู่ในรูได้หรือไม่ ความจริงคือ
          มัดสายนั้นต้องถูก <b>ประกอบขึ้นทีละเส้นภายในรู</b> และการร้อยไม่ได้ยากเท่ากันทุกเส้น
          เส้นแรก ๆ เข้าง่ายเพราะยังว่าง แต่ <b>2–3 เส้นสุดท้ายแทบไม่มีที่ให้ขยับ</b> รูที่มัดสายสำเร็จรูป
          นั่งได้พอดี จึงอาจร้อยไม่เข้าตั้งแต่ต้น
        </p>
        <p className="text-[16px] leading-[1.85] text-gray-800 my-4">
          เครื่องมือจึงกันพื้นที่ว่างในรูตามจำนวนเส้น — 20% สำหรับ 2–3 เส้น, 25% สำหรับ 4–5 เส้น และ
          <b> 30% สำหรับ 6 เส้นขึ้นไป</b> ซึ่งเป็นกรณีของงานสตาร์-เดลตาพอดี
        </p>

        <h3 className="font-display font-bold text-lg text-ink mt-7 mb-2">
          ถ้าเข้าหัวหางปลามาแล้ว ตัวที่ต้องลอดคือหางปลา
        </h3>
        <p className="text-[16px] leading-[1.85] text-gray-800 my-4">
          บนสายแรงสูงและสายกระแสสูงที่เข้าหัวหางปลาพร้อมปลอกหุ้ม (Capping) มาจากโรงงานหรือจากร้านย้ำสาย
          สิ่งที่กว้างที่สุดในชุดนั้นไม่ใช่ตัวสาย แต่เป็น <b>หางปลาและปลอกที่หุ้มอยู่</b> และบนงานลักษณะนี้
          มักตัดหัวออกมาย้ำใหม่หน้างานไม่ได้ ทำให้ ZCT ต้องคล่อมผ่านหางปลาให้ได้
        </p>
        <p className="text-[16px] leading-[1.85] text-gray-800 my-4">
          เครื่องมือนี้ <b>ไม่เดาขนาดหางปลาให้</b> เพราะต่างกันมากตามยี่ห้อและขนาดที่ย้ำ วิธีที่ถูกคือ
          วัดความกว้างที่สุดของหางปลาพร้อมปลอก แล้วกรอกค่านั้นในช่อง “กรอก OD เอง” แทน OD ของสาย
          พร้อมติ๊กช่องสายเข้าหัวแล้ว เพื่อให้ระบบกันระยะร้อยเพิ่มอีก 5% — สายที่เข้าหัวแล้วแข็งและบิดหลบไม่ได้
        </p>
        <p className="text-[16px] leading-[1.85] text-gray-800 my-4">
          ค่าเผื่อทั้งสองชุดนี้เป็น <b>ค่าจากประสบการณ์การติดตั้ง ไม่ใช่ค่าที่กำหนดในมาตรฐานฉบับใด</b>
          จึงเปิดให้ปรับได้ และควรยืนยันกับหน้างานจริงก่อนสั่งของทุกครั้ง
        </p>

        <ProductCTA
          heading="ให้ SAV ยืนยันรุ่น ZCT ที่ใช่"
          note="กดปุ่มในเครื่องมือด้านบน สรุปการเดินสาย/สเปกสาย/รุ่นที่คาดว่าเหมาะจะถูกคัดลอกให้ส่งทาง LINE ได้ทันที"
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

        <section className="mt-10 pt-6 border-t border-gray-200">
          <h2 className="font-display font-extrabold text-lg text-ink mb-3">แหล่งอ้างอิง</h2>
          <ol className="list-decimal pl-5 space-y-2 text-[14px] text-gray-700">
            <li>
              <a href="https://thaiyazaki-electricwire.co.th/download/1" target="_blank" rel="noopener" className="text-brand hover:underline font-semibold">
                Thai Yazaki — Specification Sheets
              </a>
              <span className="text-gray-600"> — ค่า OD สาย: THW (TYSS 5200/5801), CV (TYSS 6004/5803), NYY (TYSS 6083), VCT (TYSS 6081) — ค่าโดยประมาณ ต่างยี่ห้อต่างกันเล็กน้อย</span>
            </li>
            <li>
              <span className="font-semibold">Woonyoung ZCT Datasheet (WYZR series)</span>
              <span className="text-gray-600"> — ขนาดรูตามเลขรุ่น (ค่าประมาณ) · </span>
              <a href="/products/WYZR-N/" className="text-brand hover:underline">ดูเอกสารที่หน้าสินค้า</a>
            </li>
          </ol>
        </section>

        <Disclaimer />
      </div>
      <SiteFooter />
    </main>
  );
}
