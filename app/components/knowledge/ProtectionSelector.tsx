"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  DRIVEN_EQUIPMENT,
  failureModeAnchor,
  FAILURE_MODES_ANCHOR,
  LOAD_TYPES,
  PROTECTION_FUNCTIONS,
  PROTECTION_MATRIX_ANCHOR,
  type DrivenEquipment,
  type ProtectionFunction,
} from "../../lib/driven-equipment";
import { categoryShortLabel } from "../../lib/series";
import { messagingLink } from "../../lib/company";
import { Emphasis, stripEmphasis } from "./emphasis";

// ============================================================================
// The runtime half of the driven-equipment dataset: "I have this machine, what
// protection do I need". The article bodies render the same rows at build time
// through <FailureModes> and <ProtectionMatrix>, so the two can never disagree
// — a failure mode corrected on a job shows up in both on the next build.
//
// Every "ดูรายละเอียด" link points at the exact failure-mode row inside the
// article rather than the top of the page. The reader arrives here with one
// symptom in mind; dropping them at a heading and making them find the row
// again wastes the only thing the tool knew about them.
//
// Article titles are passed in from the page rather than imported, because
// resolving them needs the filesystem and this component runs in the browser.
// ============================================================================

export type ArticleRef = { slug: string; title: string };

const ICONS: Record<string, string> = {
  "centrifugal-pump": "💧",
  "axial-propeller-pump": "🌊",
  "centrifugal-fan": "🌀",
  "belt-conveyor": "📦",
  "screw-air-compressor": "💨",
  "reciprocating-air-compressor": "🔁",
  "crusher-mill": "🪨",
  "hoist-crane": "🏗️",
};

/** Reads as a sentence in the summary the customer sends us. */
const TIER_LABEL = {
  required: "จำเป็น",
  recommended: "แนะนำ",
  conditional: "ใช้เฉพาะบางระบบ",
} as const;

function FunctionRow({
  fn,
  note,
  tone,
}: {
  fn: ProtectionFunction;
  note?: string;
  tone: string;
}) {
  const def = PROTECTION_FUNCTIONS[fn];
  return (
    <li className="border-b border-gray-100 py-2.5 last:border-b-0">
      <div className="flex flex-wrap items-baseline gap-x-2">
        <span className={`font-display text-[10px] font-extrabold uppercase tracking-[0.14em] ${tone}`}>
          ●
        </span>
        <strong className="text-[15px] text-ink">{def.nameTh}</strong>
        {def.productSeries.length > 0 && (
          <span className="flex flex-wrap gap-1.5">
            {def.productSeries.map((slug) => (
              <Link
                key={slug}
                href={`/products/series/${slug}/`}
                className="rounded border border-gray-300 px-1.5 py-0.5 text-[11.5px] font-semibold text-brand hover:border-brand"
              >
                {categoryShortLabel(slug)}
              </Link>
            ))}
          </span>
        )}
      </div>
      <p className="mt-0.5 text-[13.5px] leading-relaxed text-gray-700">{def.whatItDoesTh}</p>
      {note && <p className="mt-0.5 text-[13px] text-gray-500">เมื่อ: {note}</p>}
    </li>
  );
}

export default function ProtectionSelector({
  articles,
}: {
  /** equipment id → its published article, for equipment that has one. */
  articles: Record<string, ArticleRef>;
}) {
  const [pickedId, setPickedId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const picked: DrivenEquipment | undefined = useMemo(
    () => DRIVEN_EQUIPMENT.find((e) => e.id === pickedId),
    [pickedId]
  );
  const article = picked ? articles[picked.id] : undefined;

  // The text the customer sends us. Written as something an engineer can act on
  // without opening the site again — equipment, load type, and the function list
  // in tier order. The relay model is deliberately not guessed here: that needs
  // the motor's FLA, which this tool never asked for.
  const summary = useMemo(() => {
    if (!picked) return "";
    const line = (fn: ProtectionFunction) => `- ${PROTECTION_FUNCTIONS[fn].nameTh}`;
    return [
      `ขอคำแนะนำระบบป้องกันมอเตอร์`,
      `เครื่องจักร: ${picked.nameTh} (${picked.nameEn})`,
      `ลักษณะโหลด: ${LOAD_TYPES[picked.loadType].nameTh}`,
      ``,
      `[${TIER_LABEL.required}]`,
      ...picked.required.map(line),
      ``,
      `[${TIER_LABEL.recommended}]`,
      ...picked.recommended.map(line),
      ...(picked.conditional.length
        ? [
            ``,
            `[${TIER_LABEL.conditional}]`,
            ...picked.conditional.map((c) => `${line(c.fn)} — เมื่อ ${c.whenTh}`),
          ]
        : []),
      ``,
      `ข้อมูลมอเตอร์ (กรอกเพิ่ม): kW/HP ......  แรงดัน ......  FLA ......  วิธีสตาร์ต ......`,
    ]
      .map(stripEmphasis) // this lands in LINE and email, where ** is noise
      .join("\n");
  }, [picked]);

  async function copySummary() {
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Clipboard is blocked in some in-app browsers. The textarea below is
      // always present and selectable, so there is still a way to send this.
      setCopied(false);
    }
  }

  return (
    <div className="rounded-lg border border-gray-200 border-t-[3px] border-t-brand bg-white p-6">
      <p className="font-display text-[11px] font-extrabold uppercase tracking-[0.15em] text-brand">
        ขั้นที่ 1 — เลือกเครื่องจักรที่มอเตอร์ขับอยู่
      </p>
      <p className="mb-4 mt-1 text-[13.5px] text-gray-600">
        ลักษณะโหลดเป็นตัวกำหนดว่าต้องป้องกันด้านไหน ไม่ใช่ขนาดมอเตอร์
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        {DRIVEN_EQUIPMENT.map((e) => {
          const active = e.id === pickedId;
          return (
            <button
              key={e.id}
              type="button"
              onClick={() => setPickedId(active ? null : e.id)}
              aria-pressed={active}
              className={`rounded-lg border p-4 text-left transition-all ${
                active
                  ? "border-brand bg-red-50 shadow-sm"
                  : "border-gray-200 bg-white hover:border-brand hover:shadow-sm"
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl leading-none">{ICONS[e.id] ?? "⚙️"}</span>
                <div>
                  <span className="block font-display text-[15px] font-bold leading-snug text-ink">
                    {e.nameTh}
                  </span>
                  <span className="block text-[12.5px] text-gray-500">{e.nameEn}</span>
                  <span className="mt-1 inline-block rounded bg-gray-100 px-1.5 py-0.5 text-[11px] font-semibold text-gray-700">
                    {LOAD_TYPES[e.loadType].nameTh}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {!picked && (
        <p className="mt-5 rounded border border-dashed border-gray-300 px-4 py-6 text-center text-[13.5px] text-gray-500">
          เลือกเครื่องจักรด้านบนเพื่อดูฟังก์ชันป้องกันที่ต้องมี
        </p>
      )}

      {picked && (
        <div className="mt-7 border-t border-gray-200 pt-6">
          <p className="font-display text-[11px] font-extrabold uppercase tracking-[0.15em] text-brand">
            ขั้นที่ 2 — ฟังก์ชันป้องกันสำหรับ {picked.nameTh}
          </p>

          <div className="mt-3 rounded bg-gray-50 px-4 py-3 text-[13.5px] leading-relaxed text-gray-700">
            <strong className="text-ink">{LOAD_TYPES[picked.loadType].nameTh}</strong> —{" "}
            {LOAD_TYPES[picked.loadType].behaviourTh}
            <br />
            ความเสี่ยงหลัก: {LOAD_TYPES[picked.loadType].riskTh}
          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <div>
              <p className="font-display text-[11px] font-extrabold uppercase tracking-[0.14em] text-brand">
                จำเป็น
              </p>
              <ul className="mt-1">
                {picked.required.map((fn) => (
                  <FunctionRow key={fn} fn={fn} tone="text-brand" />
                ))}
              </ul>

              <p className="mt-4 font-display text-[11px] font-extrabold uppercase tracking-[0.14em] text-gray-700">
                แนะนำ
              </p>
              <ul className="mt-1">
                {picked.recommended.map((fn) => (
                  <FunctionRow key={fn} fn={fn} tone="text-gray-500" />
                ))}
              </ul>

              {picked.conditional.length > 0 && (
                <>
                  <p className="mt-4 font-display text-[11px] font-extrabold uppercase tracking-[0.14em] text-gray-500">
                    ใช้เฉพาะบางระบบ
                  </p>
                  <ul className="mt-1">
                    {picked.conditional.map((c) => (
                      <FunctionRow key={c.fn} fn={c.fn} note={c.whenTh} tone="text-gray-400" />
                    ))}
                  </ul>
                </>
              )}
            </div>

            <div>
              <p className="font-display text-[11px] font-extrabold uppercase tracking-[0.14em] text-gray-700">
                อาการเสียที่ต้องกัน
              </p>
              <ul className="mt-1">
                {picked.failureModes.map((fm) => (
                  <li key={fm.id} className="border-b border-gray-100 py-2.5 last:border-b-0">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                      <strong className="text-[14.5px] text-ink">{fm.nameTh}</strong>
                      {article && (
                        <Link
                          href={`/learn/${article.slug}/#${failureModeAnchor(picked.id, fm.id)}`}
                          className="text-[12.5px] font-semibold text-brand hover:underline"
                        >
                          ดูรายละเอียด →
                        </Link>
                      )}
                    </div>
                    <p className="mt-0.5 text-[13px] leading-relaxed text-gray-600">
                      <Emphasis text={fm.currentSignatureTh} />
                    </p>
                    {fm.caveatTh && (
                      <p className="mt-1 border-l-2 border-amber-300 pl-2 text-[12.5px] leading-relaxed text-amber-800">
                        ⚠️ <Emphasis text={fm.caveatTh} />
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-6 rounded border-l-4 border-amber-300 bg-amber-50 px-4 py-3 text-[13.5px] leading-relaxed text-amber-900">
            <strong>เครื่องมือนี้บอกว่าต้องมีฟังก์ชันอะไร ไม่ได้บอกว่าต้องซื้อรุ่นไหน</strong> —
            การเลือกรุ่นต้องใช้กระแสพิกัดมอเตอร์ (FLA) วิธีสตาร์ต และตำแหน่งที่ติด CT ประกอบด้วยเสมอ
            ค่าที่ตั้งจริงต้องวัดจากเครื่องตัวนั้น ไม่ใช่คัดลอกจากเครื่องอื่น
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            {article && (
              <Link
                href={`/learn/${article.slug}/#${PROTECTION_MATRIX_ANCHOR}`}
                className="rounded-sm bg-brand px-5 py-2.5 font-display text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-brand-dark"
              >
                อ่านวิธีตั้งค่าแบบเต็ม →
              </Link>
            )}
            <button
              type="button"
              onClick={copySummary}
              className="rounded-sm border border-gray-300 px-5 py-2.5 font-display text-xs font-bold uppercase tracking-wider text-ink transition-colors hover:border-brand hover:text-brand"
            >
              {copied ? "✓ คัดลอกแล้ว" : "📋 คัดลอกสรุป"}
            </button>
            <a
              href={messagingLink(summary)}
              target="_blank"
              rel="noopener"
              className="rounded-sm border border-gray-300 px-5 py-2.5 font-display text-xs font-bold uppercase tracking-wider text-ink transition-colors hover:border-brand hover:text-brand"
            >
              💬 ส่งให้ทีมวิศวกร
            </a>
            {article && (
              <Link
                href={`/learn/${article.slug}/#${FAILURE_MODES_ANCHOR}`}
                className="text-[13px] font-semibold text-brand hover:underline"
              >
                ดูตารางอาการเสียทั้งหมด
              </Link>
            )}
          </div>

          {/* Always present, not only when the clipboard API fails: in-app
              browsers (LINE, Facebook) block navigator.clipboard silently, and
              a customer who cannot copy simply leaves. */}
          <details className="mt-4">
            <summary className="cursor-pointer text-[13px] font-semibold text-gray-600 hover:text-brand">
              คัดลอกไม่ได้? กดที่นี่เพื่อเลือกข้อความเอง
            </summary>
            <textarea
              readOnly
              value={summary}
              rows={12}
              onFocus={(ev) => ev.currentTarget.select()}
              className="mt-2 w-full rounded border border-gray-300 p-3 font-mono text-[12.5px] leading-relaxed text-gray-800"
            />
          </details>
        </div>
      )}
    </div>
  );
}
