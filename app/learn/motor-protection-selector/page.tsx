import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";
import ProtectionSelector, {
  type ArticleRef,
} from "../../components/knowledge/ProtectionSelector";
import { AnswerSummary, Disclaimer } from "../../components/knowledge/parts";
import { DRIVEN_EQUIPMENT, LOAD_TYPES } from "../../lib/driven-equipment";
import { articleFor } from "../../lib/equipment-articles";
import { SITE_URL } from "../../lib/company";

const SITE = SITE_URL;

export const metadata: Metadata = {
  title: "เลือกฟังก์ชันป้องกันมอเตอร์ตามเครื่องจักรที่ขับ — Motor Protection Selector",
  description:
    "เลือกเครื่องจักรที่มอเตอร์ขับอยู่ (ปั๊มหอยโข่ง ปั๊มแนวแกน พัดลม สายพานลำเลียง) แล้วดูว่าต้องมีฟังก์ชันป้องกันอะไรบ้าง จำเป็น แนะนำ หรือใช้เฉพาะบางระบบ พร้อมอาการเสียที่แต่ละฟังก์ชันจับได้ และข้อจำกัดที่กระแสมองไม่เห็น",
  alternates: { canonical: "/learn/motor-protection-selector/" },
  openGraph: {
    title: "Motor Protection Selector — เลือกฟังก์ชันป้องกันจากลักษณะโหลด",
    description:
      "เลือกเครื่องจักรที่มอเตอร์ขับ → ได้ฟังก์ชันป้องกันที่ต้องมี พร้อมอาการเสียและข้อจำกัดของการอ่านกระแส",
    url: "/learn/motor-protection-selector/",
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
      name: "เลือกฟังก์ชันป้องกันมอเตอร์",
      item: `${SITE}/learn/motor-protection-selector/`,
    },
  ],
};

export default function ProtectionSelectorPage() {
  // Resolve equipment → article here, on the server. articleFor() reads the
  // filesystem, so the client component takes the join as a prop instead of
  // importing it. Equipment without a published article simply gets no deep
  // links, rather than links to a 404.
  const articles: Record<string, ArticleRef> = {};
  for (const e of DRIVEN_EQUIPMENT) {
    const a = articleFor(e);
    if (a) articles[e.id] = { slug: a.slug, title: a.title };
  }

  return (
    <main className="min-h-screen bg-gray-100">
      <SiteHeader />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto max-w-3xl px-5 py-10">
        <nav className="mb-4 flex flex-wrap gap-1.5 text-[12.5px] text-gray-500">
          <Link href="/" className="hover:text-brand">
            หน้าแรก
          </Link>
          <span>/</span>
          <Link href="/learn/" className="hover:text-brand">
            คลังความรู้
          </Link>
          <span>/</span>
          <span>เลือกฟังก์ชันป้องกันมอเตอร์</span>
        </nav>

        <p className="mb-2 font-display text-[11px] font-extrabold uppercase tracking-[0.18em] text-brand">
          เครื่องมือคำนวณ
        </p>
        <h1 className="mb-2 font-display text-3xl font-extrabold leading-tight text-ink sm:text-[34px]">
          เลือกฟังก์ชันป้องกันมอเตอร์ตามเครื่องจักรที่ขับ
        </h1>

        <AnswerSummary>
          รีเลย์ป้องกันมอเตอร์ไม่ได้เลือกจากขนาดมอเตอร์อย่างเดียว
          สิ่งที่กำหนดว่าต้องป้องกันด้านไหนคือ “ลักษณะโหลด” ของเครื่องจักรที่มอเตอร์ขับอยู่ —
          ปั๊มหอยโข่งเสียตอนกระแส<strong>ต่ำ</strong> ปั๊มแนวแกนเสียตอนกระแส<strong>สูง</strong>
          ทั้งที่เป็นปั๊มเหมือนกัน เลือกเครื่องจักรด้านล่างเพื่อดูว่าต้องมีฟังก์ชันอะไร
          และอาการใดที่รีเลย์กระแสมองไม่เห็นจนต้องใช้เซนเซอร์ภายนอก
        </AnswerSummary>

        <div className="my-6">
          <ProtectionSelector articles={articles} />
        </div>

        <h2 className="mb-3 mt-10 font-display text-2xl font-extrabold text-ink">
          ทำไมลักษณะโหลดถึงมาก่อนรุ่นรีเลย์
        </h2>
        <p className="my-4 text-[16px] leading-[1.85] text-gray-800">
          คำถามที่ได้รับบ่อยที่สุดคือ “มอเตอร์ 15 kW ใช้รีเลย์ตัวไหน” ซึ่งตอบไม่ได้จากข้อมูลเท่านั้น
          ขนาดมอเตอร์บอกแค่ <strong>ช่วงกระแส</strong> ที่รีเลย์ต้องครอบคลุม
          แต่ไม่ได้บอกว่าต้องมีฟังก์ชันอะไรบ้าง มอเตอร์ 15 kW สองตัวที่ขับปั๊มหอยโข่งกับขับสายพาน
          ต้องการการป้องกันคนละชุดกัน ทั้งที่ใช้ช่วงกระแสเดียวกัน
        </p>
        <p className="my-4 text-[16px] leading-[1.85] text-gray-800">
          เมื่อรู้แล้วว่าต้องมีฟังก์ชันอะไร จึงค่อยเลือกช่วงกระแสด้วย
          <Link href="/learn/eocr-current-range-calculator/" className="font-semibold text-brand hover:underline">
            เครื่องมือเลือกช่วงกระแส EOCR
          </Link>{" "}
          และตรวจกระแสพิกัดด้วย
          <Link href="/learn/motor-current-calculator/" className="font-semibold text-brand hover:underline">
            เครื่องคำนวณกระแสมอเตอร์
          </Link>{" "}
          ลำดับนี้กลับกันไม่ได้ — เลือกรุ่นก่อนแล้วค่อยมาดูว่าโหลดต้องการอะไร
          คือที่มาของตู้ที่มีรีเลย์ครบแต่ป้องกันผิดด้าน
        </p>

        <h2 className="mb-3 mt-10 font-display text-2xl font-extrabold text-ink">
          ลักษณะโหลดที่เครื่องมือนี้ครอบคลุม
        </h2>
        <div className="my-6 overflow-x-auto rounded border border-gray-200">
          <table className="w-full border-collapse text-[14.5px]">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="border-b border-gray-200 px-3 py-2.5 font-display font-bold text-ink">
                  เครื่องจักร
                </th>
                <th className="border-b border-gray-200 px-3 py-2.5 font-display font-bold text-ink">
                  ลักษณะโหลด
                </th>
                <th className="border-b border-gray-200 px-3 py-2.5 font-display font-bold text-ink">
                  ความเสี่ยงหลัก
                </th>
              </tr>
            </thead>
            <tbody>
              {DRIVEN_EQUIPMENT.map((e) => {
                const a = articles[e.id];
                return (
                  <tr key={e.id} className="border-b border-gray-100">
                    <td className="px-3 py-2.5 align-top font-semibold text-ink">
                      {a ? (
                        <Link href={`/learn/${a.slug}/`} className="text-brand hover:underline">
                          {e.nameTh}
                        </Link>
                      ) : (
                        e.nameTh
                      )}
                    </td>
                    <td className="px-3 py-2.5 align-top text-gray-800">
                      {LOAD_TYPES[e.loadType].nameTh}
                    </td>
                    <td className="px-3 py-2.5 align-top text-gray-800">
                      {LOAD_TYPES[e.loadType].riskTh}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="my-4 text-[16px] leading-[1.85] text-gray-800">
          รายการนี้เพิ่มขึ้นตามงานที่เจอหน้างานจริง ถ้าเครื่องจักรของคุณยังไม่อยู่ในรายการ
          ส่งรายละเอียดมาได้ — ทีมวิศวกรจะช่วยดูให้ และเครื่องจักรที่ถามเข้ามาบ่อยจะถูกเพิ่มเข้าเครื่องมือนี้
        </p>

        <Disclaimer />
      </div>
      <SiteFooter />
    </main>
  );
}
