import Link from "next/link";
import type { ReactNode } from "react";
import type { Ref, Faq, ProductLink } from "../../lib/knowledge";
import { COMPANY, lineLink } from "../../lib/company";

/* ---- in-article building blocks (usable inside MDX) ---- */

export function Callout({
  type = "info",
  title,
  children,
}: {
  type?: "info" | "warn" | "ok";
  title?: string;
  children: ReactNode;
}) {
  const tone = {
    info: "bg-blue-50 border-blue-300 text-blue-900",
    warn: "bg-amber-50 border-amber-300 text-amber-900",
    ok: "bg-emerald-50 border-emerald-300 text-emerald-900",
  }[type];
  const icon = { info: "ℹ️", warn: "⚠️", ok: "✓" }[type];
  return (
    <div className={`my-5 rounded border-l-4 px-4 py-3 text-[15px] ${tone}`}>
      {title && <div className="font-bold mb-1">{icon} {title}</div>}
      <div className="leading-relaxed [&>p]:my-1">{children}</div>
    </div>
  );
}

export function Formula({ children }: { children: ReactNode }) {
  return (
    <div className="my-4 rounded bg-gray-900 text-gray-50 px-4 py-3 font-mono text-[15px] overflow-x-auto">
      {children}
    </div>
  );
}

// Product call-to-action — connects an engineering answer to the catalogue.
export function ProductCTA({
  heading = "ให้ทีมวิศวกร SAV ช่วยเลือกรุ่น",
  note,
  products = [],
}: {
  heading?: string;
  note?: string;
  products?: ProductLink[];
}) {
  return (
    <div className="my-8 rounded border border-gray-200 border-t-[3px] border-t-brand bg-white p-6">
      <p className="font-display font-extrabold text-lg text-brand mb-1">{heading}</p>
      {note && <p className="text-[14px] text-gray-600 mb-4">{note}</p>}
      {products.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {products.map((p) => (
            <Link
              key={p.href ?? p.model}
              href={p.href ?? `/products/${p.model}/`}
              className="text-[13px] font-semibold border border-gray-300 rounded px-3 py-2 text-ink hover:border-brand hover:text-brand transition-colors"
            >
              {p.label} →
            </Link>
          ))}
        </div>
      )}
      <div className="flex flex-wrap gap-3">
        <a
          href={lineLink()}
          target="_blank"
          rel="noopener"
          className="bg-brand text-white font-display text-xs font-bold tracking-wider uppercase px-6 py-3 rounded-sm hover:bg-brand-dark transition-colors"
        >
          💬 ปรึกษา / ส่ง Nameplate ทาง LINE
        </a>
        <Link
          href="/products/"
          className="border border-gray-300 text-ink font-display text-xs font-bold tracking-wider uppercase px-6 py-3 rounded-sm hover:border-brand hover:text-brand transition-colors"
        >
          🧾 ขอใบเสนอราคา
        </Link>
      </div>
    </div>
  );
}

/* ---- article-shell sections (driven by frontmatter) ---- */

export function AnswerSummary({ children }: { children: ReactNode }) {
  return (
    <div className="rounded bg-gray-50 border-l-4 border-brand px-5 py-4 my-6">
      <div className="text-[11px] font-display font-bold tracking-[0.15em] uppercase text-brand mb-1">
        คำตอบโดยสรุป
      </div>
      <p className="text-[15.5px] text-ink leading-relaxed m-0">{children}</p>
    </div>
  );
}

export function Toc({ items }: { items: { id: string; label: string }[] }) {
  if (items.length < 3) return null;
  return (
    <nav className="my-6 rounded border border-gray-200 bg-white p-5">
      <div className="text-[11px] font-display font-bold tracking-[0.15em] uppercase text-gray-500 mb-2">
        สารบัญ
      </div>
      <ol className="list-decimal pl-5 space-y-1 text-[14.5px] marker:text-gray-400">
        {items.map((t) => (
          <li key={t.id}>
            <a href={`#${t.id}`} className="text-ink hover:text-brand">
              {t.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function References({ items }: { items: Ref[] }) {
  if (!items?.length) return null;
  return (
    <section className="mt-10 pt-6 border-t border-gray-200">
      <h2 className="font-display font-extrabold text-lg text-ink mb-3">แหล่งอ้างอิง</h2>
      <ol className="list-decimal pl-5 space-y-2 text-[14px] text-gray-700">
        {items.map((r, i) => (
          <li key={i}>
            {r.url ? (
              <a href={r.url} target="_blank" rel="noopener" className="text-brand hover:underline font-semibold">
                {r.name}
              </a>
            ) : (
              <span className="font-semibold">{r.name}</span>
            )}
            {r.detail && <span className="text-gray-600"> — {r.detail}</span>}
          </li>
        ))}
      </ol>
    </section>
  );
}

export function FaqBlock({ items }: { items: Faq[] }) {
  if (!items?.length) return null;
  return (
    <section className="mt-10">
      <h2 className="font-display font-extrabold text-lg text-ink mb-4">คำถามที่พบบ่อย (FAQ)</h2>
      <div className="space-y-3">
        {items.map((f, i) => (
          <details key={i} className="rounded border border-gray-200 bg-white p-4">
            <summary className="font-semibold text-[15px] cursor-pointer text-ink">{f.q}</summary>
            <p className="mt-2 text-[14.5px] text-gray-700 leading-relaxed">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

export function ReviewerMeta({ reviewer, updated }: { reviewer: string; updated: string }) {
  const d = new Date(updated);
  const th = isNaN(d.getTime())
    ? updated
    : d.toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" });
  return (
    <div className="text-[12.5px] text-gray-500 flex flex-wrap gap-x-4 gap-y-1 mt-2">
      <span>เขียนโดย: ทีมวิศวกรรม {COMPANY.nameEn.split(" ")[0]} Automation</span>
      <span>ตรวจทานโดย: {reviewer}</span>
      <span>ปรับปรุงล่าสุด: {th}</span>
    </div>
  );
}

export function Disclaimer() {
  return (
    <p className="mt-8 text-[12px] text-gray-500 leading-relaxed border-t border-gray-100 pt-4">
      เนื้อหานี้เป็นข้อมูลเชิงเทคนิคเพื่อการศึกษาและการเลือกอุปกรณ์เบื้องต้น ค่าที่คำนวณเป็น
      “ค่าประมาณ” การออกแบบและติดตั้งจริงต้องตรวจสอบกับข้อมูลบน Nameplate มาตรฐานฉบับปัจจุบัน
      และวิศวกรผู้มีใบอนุญาตประกอบวิชาชีพ SAV ไม่รับผิดชอบต่อการนำไปใช้นอกบริบท
    </p>
  );
}
