import type { Metadata } from "next";
import Link from "next/link";
import { allArticles, CLUSTERS, type ClusterId } from "../lib/knowledge";

export const metadata: Metadata = {
  title: "คลังความรู้วิศวกรรมไฟฟ้า SAV — SAV Engineering Knowledge Center",
  description:
    "บทความ เครื่องมือคำนวณ และคู่มือเลือกอุปกรณ์ระบบป้องกันมอเตอร์ EOCR, ZCT, Ground Fault และไฟฟ้าอุตสาหกรรม สำหรับวิศวกร ช่างไฟ ฝ่ายซ่อมบำรุง และฝ่ายจัดซื้อในประเทศไทย",
  alternates: { canonical: "/knowledge/" },
  openGraph: {
    title: "SAV Engineering Knowledge Center",
    description: "คลังความรู้วิศวกรรมไฟฟ้า — ระบบป้องกันมอเตอร์ EOCR, ZCT และการคำนวณกระแสมอเตอร์",
    url: "/knowledge/",
    type: "website",
  },
};

// clusters shown on the hub in this MVP (order matters)
const SHOWN: ClusterId[] = ["motor-protection", "zct-ground-fault", "motor-current"];

export default function KnowledgeHub() {
  const articles = allArticles();
  const byCluster = (c: ClusterId) => articles.filter((a) => a.cluster === c);

  return (
    <main className="bg-gray-100 min-h-screen">
      {/* header */}
      <section className="bg-ink text-white py-16 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <p className="font-display text-[11px] font-extrabold tracking-[0.22em] uppercase text-red-400 mb-3">
            SAV Engineering Knowledge Center
          </p>
          <h1 className="font-display font-extrabold text-3xl sm:text-5xl leading-tight mb-4">
            คลังความรู้วิศวกรรมไฟฟ้า SAV
          </h1>
          <p className="text-gray-300 text-[15px] sm:text-base max-w-2xl mx-auto">
            บทความ เครื่องมือคำนวณ และคู่มือเลือกอุปกรณ์ ระบบป้องกันมอเตอร์ EOCR · ZCT · Ground Fault ·
            ไฟฟ้าอุตสาหกรรม — สำหรับวิศวกร ช่างไฟ ฝ่ายซ่อมบำรุง และฝ่ายจัดซื้อ
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-5 py-14">
        {/* calculator highlight */}
        <Link
          href="/knowledge/motor-current-calculator/"
          className="block rounded-lg border border-gray-200 border-t-[3px] border-t-brand bg-white p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all mb-12"
        >
          <div className="flex items-start gap-4">
            <div className="text-3xl">🧮</div>
            <div>
              <p className="font-display text-[11px] font-extrabold tracking-[0.15em] uppercase text-brand mb-1">
                เครื่องมือคำนวณ
              </p>
              <h2 className="font-display font-extrabold text-xl text-ink mb-1">
                เครื่องคำนวณกระแสมอเตอร์ 1 เฟส / 3 เฟส
              </h2>
              <p className="text-[14px] text-gray-600">
                กรอก kW/HP, แรงดัน, Power Factor และ Efficiency → ได้กระแสโดยประมาณ พร้อมแนวทางเลือก EOCR
              </p>
            </div>
          </div>
        </Link>

        {/* clusters */}
        {SHOWN.map((cid) => {
          const list = byCluster(cid);
          if (!list.length) return null;
          const c = CLUSTERS[cid];
          return (
            <section key={cid} className="mb-12">
              <div className="mb-5">
                <h2 className="font-display font-extrabold text-2xl text-ink">{c.label}</h2>
                {c.blurb && <p className="text-[14px] text-gray-600 mt-1">{c.blurb}</p>}
                <div className="w-10 h-[3px] bg-brand rounded mt-3" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {list.map((a) => (
                  <Link
                    key={a.slug}
                    href={`/knowledge/${a.slug}/`}
                    className="block rounded-lg border border-gray-200 bg-white p-5 hover:border-brand hover:shadow-md transition-all"
                  >
                    {a.pillar && (
                      <span className="inline-block text-[10px] font-display font-bold tracking-wider uppercase text-brand bg-red-50 rounded px-2 py-0.5 mb-2">
                        คู่มือหลัก
                      </span>
                    )}
                    <h3 className="font-display font-bold text-[17px] text-ink leading-snug mb-1.5">
                      {a.title}
                    </h3>
                    <p className="text-[13.5px] text-gray-600 leading-relaxed line-clamp-2">
                      {a.description}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}

        <p className="text-center text-[13px] text-gray-500 mt-8">
          เนื้อหาเพิ่มขึ้นเรื่อย ๆ — ต้องการคำแนะนำเฉพาะงาน?{" "}
          <Link href="/products/" className="text-brand font-semibold hover:underline">
            ปรึกษาทีมวิศวกร SAV
          </Link>
        </p>
      </div>
    </main>
  );
}
