import Link from "next/link";
import {
  equipmentById,
  failureModeAnchor,
  FAILURE_MODES_ANCHOR,
  LOAD_TYPES,
  PROTECTION_FUNCTIONS,
  PROTECTION_MATRIX_ANCHOR,
  type ProtectionFunction,
} from "../../lib/driven-equipment";
import { industryArticlesFor } from "../../lib/equipment-articles";
import { Emphasis } from "./emphasis";

// ============================================================================
// Sections E and F of the article template, rendered from the shared dataset
// in app/lib/driven-equipment.ts rather than hand-written per article.
//
// Usage inside MDX:
//   <FailureModes equipment="centrifugal-pump" />
//   <ProtectionMatrix equipment="centrifugal-pump" />
//
// An unknown id renders a visible build-time warning rather than nothing, so a
// typo cannot silently drop the most important table on the page.
//
// Both blocks are deep-link targets. The whole table answers "what goes wrong
// with this machine"; a single row answers "what is happening to mine right
// now", which is the question a reader arrives with when the Selector or a
// solution card sends them here. Ids come from driven-equipment.ts so the link
// and the target cannot drift apart.
// ============================================================================

function Missing({ id, what }: { id: string; what: string }) {
  return (
    <div className="my-5 rounded border-l-4 border-red-400 bg-red-50 px-4 py-3 text-[15px] text-red-900">
      <strong>ไม่พบข้อมูล {what}</strong> สำหรับ <code>{id}</code> — ตรวจสอบ{" "}
      <code>app/lib/driven-equipment.ts</code>
    </div>
  );
}

function FunctionChips({ fns }: { fns: ProtectionFunction[] }) {
  return (
    <span className="flex flex-wrap gap-1">
      {fns.map((f) => (
        <span
          key={f}
          className="inline-block whitespace-nowrap rounded bg-gray-100 px-1.5 py-0.5 text-[12px] font-semibold text-gray-700"
        >
          {PROTECTION_FUNCTIONS[f].nameTh}
        </span>
      ))}
    </span>
  );
}

/** Section E — failure mode → current signature → symptom → detection. */
export function FailureModes({ equipment }: { equipment: string }) {
  const e = equipmentById(equipment);
  if (!e) return <Missing id={equipment} what="อาการเสีย" />;

  return (
    <>
      <div id={FAILURE_MODES_ANCHOR} className="my-6 overflow-x-auto rounded border border-gray-200">
        <table className="w-full border-collapse text-[14.5px]">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="border-b border-gray-200 px-3 py-2.5 font-display font-bold text-ink">
                อาการเสีย
              </th>
              <th className="border-b border-gray-200 px-3 py-2.5 font-display font-bold text-ink">
                กระแสเป็นอย่างไร
              </th>
              <th className="border-b border-gray-200 px-3 py-2.5 font-display font-bold text-ink">
                อาการหน้างาน
              </th>
              <th className="border-b border-gray-200 px-3 py-2.5 font-display font-bold text-ink">
                ตรวจจับด้วย
              </th>
            </tr>
          </thead>
          <tbody>
            {e.failureModes.map((fm) => (
              <tr
                key={fm.id}
                id={failureModeAnchor(e.id, fm.id)}
                className="anchor-target border-b border-gray-100"
              >
                <td className="px-3 py-2.5 align-top font-semibold text-ink">{fm.nameTh}</td>
                <td className="px-3 py-2.5 align-top text-gray-800">
                  <Emphasis text={fm.currentSignatureTh} />
                </td>
                <td className="px-3 py-2.5 align-top text-gray-800">
                  <Emphasis text={fm.fieldSymptomTh} />
                </td>
                <td className="px-3 py-2.5 align-top">
                  <FunctionChips fns={fm.detection} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Caveats are the honest half of the table: where current alone cannot
          separate two different failures, saying so is the whole value. */}
      {e.failureModes.some((fm) => fm.caveatTh) && (
        <div className="my-5 rounded border-l-4 border-amber-300 bg-amber-50 px-4 py-3 text-[15px] text-amber-900">
          <div className="mb-1 font-bold">⚠️ ข้อควรระวังในการอ่านกระแส</div>
          <ul className="list-disc space-y-1 pl-5 leading-relaxed">
            {e.failureModes
              .filter((fm) => fm.caveatTh)
              .map((fm) => (
                <li key={fm.id}>
                  <strong>{fm.nameTh}</strong> — <Emphasis text={fm.caveatTh!} />
                </li>
              ))}
          </ul>
        </div>
      )}
    </>
  );
}

function Tier({
  title,
  tone,
  rows,
}: {
  title: string;
  tone: string;
  rows: { fn: ProtectionFunction; note?: string }[];
}) {
  if (rows.length === 0) return null;
  return (
    <div className="mb-4">
      <p className={`font-display text-[11px] font-extrabold uppercase tracking-[0.15em] ${tone} mb-2`}>
        {title}
      </p>
      <ul className="space-y-2">
        {rows.map(({ fn, note }) => {
          const def = PROTECTION_FUNCTIONS[fn];
          return (
            <li key={fn} className="text-[14.5px] leading-relaxed text-gray-800">
              <strong className="text-ink">{def.nameTh}</strong> — {def.whatItDoesTh}
              {note && <span className="text-gray-600"> ({note})</span>}
              {def.productSeries.length > 0 && (
                <span className="ml-1">
                  {def.productSeries.map((slug, i) => (
                    <span key={slug}>
                      {i === 0 ? " · " : " · "}
                      <Link
                        href={`/products/series/${slug}/`}
                        className="font-semibold text-brand hover:underline"
                      >
                        ดูรุ่น
                      </Link>
                    </span>
                  ))}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** Section F — protection matrix, split into required / recommended / conditional. */
export function ProtectionMatrix({ equipment }: { equipment: string }) {
  const e = equipmentById(equipment);
  if (!e) return <Missing id={equipment} what="ฟังก์ชันป้องกัน" />;
  const load = LOAD_TYPES[e.loadType];

  return (
    <div
      id={PROTECTION_MATRIX_ANCHOR}
      className="anchor-target my-6 rounded border border-gray-200 border-t-[3px] border-t-brand bg-white p-6"
    >
      <p className="mb-1 text-[13px] text-gray-600">
        <strong className="text-ink">{e.nameTh}</strong> — ลักษณะโหลด{" "}
        <strong className="text-ink">{load.nameTh}</strong> · {load.behaviourTh}
      </p>
      <p className="mb-5 text-[13px] text-gray-600">ความเสี่ยงหลัก: {load.riskTh}</p>

      <Tier
        title="จำเป็น"
        tone="text-brand"
        rows={e.required.map((fn) => ({ fn }))}
      />
      <Tier
        title="แนะนำ"
        tone="text-gray-700"
        rows={e.recommended.map((fn) => ({ fn }))}
      />
      <Tier
        title="ใช้เฉพาะบางระบบ"
        tone="text-gray-500"
        rows={e.conditional.map((c) => ({ fn: c.fn, note: c.whenTh }))}
      />

      <p className="mt-4 border-t border-gray-100 pt-3 text-[12.5px] text-gray-500">
        เลือกฟังก์ชันป้องกันตามลักษณะโหลดก่อนเลือกรุ่นรีเลย์ — ไม่ควรเลือกรุ่นจากช่วงกระแสอย่างเดียว
      </p>
    </div>
  );
}

/**
 * Generated back-links: which industry articles reference this equipment.
 *
 * Resolved against the articles that actually exist, for two reasons. The
 * dataset names industry articles before they are written — centrifugal-pump
 * has pointed at water-pumping-motor-protection since the dataset landed, and
 * rendering that eagerly meant shipping a link to a 404. And a slug is not a
 * title: "water-pumping-motor-protection" told the reader nothing about what
 * was on the other end of the link.
 */
export function UsedIn({ equipment }: { equipment: string }) {
  const e = equipmentById(equipment);
  if (!e) return null;
  const articles = industryArticlesFor(e);
  if (articles.length === 0) return null;
  return (
    <p className="my-4 text-[14px] text-gray-700">
      อ่านการใช้งานจริงในอุตสาหกรรม:{" "}
      {articles.map((a, i) => (
        <span key={a.slug}>
          {i > 0 && " · "}
          <Link href={`/learn/${a.slug}/`} className="font-semibold text-brand hover:underline">
            {a.title}
          </Link>
        </span>
      ))}
    </p>
  );
}
