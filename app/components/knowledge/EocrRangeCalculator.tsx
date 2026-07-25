"use client";

import { useState } from "react";
import Link from "next/link";
import { lineLink } from "../../lib/company";

type Mode = "flc" | "power";
type Phase = "3" | "1";
type Unit = "kW" | "HP";
type Kind = "over" | "under";

type Model = { slug: string; label: string; lo: number; hi: number };

// In-stock digital ranges — from the SAV catalog (Schneider EOCR datasheet values).
const OVER: Model[] = [
  { slug: "EOCRSSD-05S", label: "EOCR-SSD ดิจิทัล · 0.5–6 A", lo: 0.5, hi: 6 },
  { slug: "EOCRSSD-60S", label: "EOCR-SSD ดิจิทัล · 10–60 A", lo: 10, hi: 60 },
];
const UNDER: Model[] = [
  { slug: "EUCR-05S", label: "EUCR ดิจิทัล · 0.5–6 A", lo: 0.5, hi: 6 },
  { slug: "EUCR-30S", label: "EUCR ดิจิทัล · 3–30 A", lo: 3, hi: 30 },
  { slug: "EUCR-60S", label: "EUCR ดิจิทัล · 5–60 A", lo: 5, hi: 60 },
];

// Pick the tightest in-stock range that contains the current (best setting resolution).
function pick(models: Model[], a: number): Model | null {
  const fit = models.filter((m) => a >= m.lo && a <= m.hi);
  if (!fit.length) return null;
  return fit.sort((x, y) => x.hi - x.lo - (y.hi - y.lo) || x.lo - y.lo)[0];
}

export default function EocrRangeCalculator() {
  const [mode, setMode] = useState<Mode>("flc");
  const [kind, setKind] = useState<Kind>("over");
  const [flc, setFlc] = useState("12");

  // power-mode inputs (mirror MotorCurrentCalculator)
  const [phase, setPhase] = useState<Phase>("3");
  const [unit, setUnit] = useState<Unit>("kW");
  const [power, setPower] = useState("5.5");
  const [voltage, setVoltage] = useState("400");
  const [pf, setPf] = useState("0.85");
  const [eff, setEff] = useState("0.88");

  const fmt = (x: number) => (Math.round(x * 10) / 10).toString();

  let amps = NaN;
  if (mode === "flc") {
    amps = parseFloat(flc);
  } else {
    const P = parseFloat(power);
    const watts = isNaN(P) ? NaN : P * (unit === "kW" ? 1000 : 746);
    const denom = (phase === "3" ? Math.sqrt(3) : 1) * parseFloat(voltage) * parseFloat(pf) * parseFloat(eff);
    amps = watts > 0 && denom > 0 ? watts / denom : NaN;
  }
  const valid = !isNaN(amps) && isFinite(amps) && amps > 0;

  const models = kind === "over" ? OVER : UNDER;
  const chosen = valid ? pick(models, amps) : null;

  // Honest coverage messaging
  let note = "";
  let noteTone: "ok" | "warn" = "ok";
  if (valid) {
    if (amps > 60) {
      note = "กระแสเกิน 60 A — เกินช่วงที่ร้อยสายผ่านรูรีเลย์ได้โดยตรง ต้องใช้ External CT แล้วตั้งอัตราส่วนให้ตรง ปรึกษา SAV เพื่อเลือกชุด CT + รีเลย์";
      noteTone = "warn";
    } else if (amps < 0.5) {
      note = "กระแสต่ำกว่า 0.5 A — ต่ำกว่าช่วงมาตรฐานของรุ่นพร้อมส่ง ปรึกษา SAV เพื่อเลือกรุ่นที่เหมาะ";
      noteTone = "warn";
    } else if (!chosen && kind === "over") {
      note = "ช่วง 6–10 A ไม่มีในรุ่น EOCR-SSD ดิจิทัลที่พร้อมส่ง — แนะนำรุ่นอนาล็อก EOCR-SS 3–30 A หรือปรึกษา SAV เพื่อเช็คสต๊อกช่วงนี้";
      noteTone = "warn";
    } else if (chosen) {
      const mid = (chosen.lo + chosen.hi) / 2;
      note =
        amps < chosen.lo + (chosen.hi - chosen.lo) * 0.15 || amps > chosen.hi - (chosen.hi - chosen.lo) * 0.15
          ? `กระแสอยู่ใกล้ขอบช่วง — ใช้ได้ แต่ถ้ามีรุ่นที่ทำให้ค่าอยู่กลางช่วง (~${fmt(mid)} A) จะตั้งค่าละเอียดกว่า ปรึกษา SAV ได้`
          : "กระแสใช้งานอยู่ช่วงกลาง ๆ ของรุ่นนี้ — ตั้งค่าได้ละเอียดและป้องกันแม่นยำ";
      noteTone = "ok";
    }
  }

  const kindTh = kind === "over" ? "ป้องกันกระแสเกิน (Overload)" : "ป้องกันกระแสต่ำ (Undercurrent)";
  const nameplateMsg = valid
    ? `ขอคำแนะนำเลือกรุ่น EOCR (${kindTh}) สำหรับกระแสมอเตอร์ ~${fmt(amps)} A${
        chosen ? ` (รุ่นที่คาดว่าเหมาะ: ${chosen.slug})` : ""
      } รบกวนส่งรูป Nameplate ให้ตรวจสอบครับ`
    : "";

  const inputCls = "w-full border border-gray-300 rounded px-3 py-2 text-[15px] focus:border-brand outline-none";
  const labelCls = "block text-[13px] font-semibold text-gray-600 mb-1";

  return (
    <div className="rounded-lg border border-gray-200 border-t-[3px] border-t-brand bg-white p-6">
      {/* protection kind + input mode */}
      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className={labelCls}>ชนิดการป้องกัน</label>
          <div className="flex gap-2">
            {([["over", "กระแสเกิน"], ["under", "กระแสต่ำ"]] as [Kind, string][]).map(([k, t]) => (
              <button
                key={k}
                type="button"
                onClick={() => setKind(k)}
                className={`flex-1 py-2 rounded text-[14px] font-semibold border transition-colors ${
                  kind === k ? "bg-brand text-white border-brand" : "border-gray-300 text-ink hover:border-brand"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className={labelCls}>ข้อมูลที่มี</label>
          <div className="flex gap-2">
            {([["flc", "รู้กระแส (A)"], ["power", "จากกำลัง (kW/HP)"]] as [Mode, string][]).map(([m, t]) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`flex-1 py-2 rounded text-[13.5px] font-semibold border transition-colors ${
                  mode === m ? "bg-brand text-white border-brand" : "border-gray-300 text-ink hover:border-brand"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* inputs */}
      {mode === "flc" ? (
        <div>
          <label className={labelCls}>กระแสพิกัดมอเตอร์ — Full-load Current (A)</label>
          <input inputMode="decimal" value={flc} onChange={(e) => setFlc(e.target.value)} className={inputCls} />
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>ระบบไฟ</label>
            <div className="flex gap-2">
              {(["3", "1"] as Phase[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPhase(p)}
                  className={`flex-1 py-2 rounded text-[14px] font-semibold border transition-colors ${
                    phase === p ? "bg-brand text-white border-brand" : "border-gray-300 text-ink hover:border-brand"
                  }`}
                >
                  {p} เฟส
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className={labelCls}>กำลัง</label>
            <div className="flex gap-2">
              <input inputMode="decimal" value={power} onChange={(e) => setPower(e.target.value)} className={inputCls} />
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as Unit)}
                className="border border-gray-300 rounded px-2 text-[14px] focus:border-brand outline-none"
              >
                <option value="kW">kW</option>
                <option value="HP">HP</option>
              </select>
            </div>
          </div>
          <div>
            <label className={labelCls}>แรงดัน (V)</label>
            <input inputMode="decimal" value={voltage} onChange={(e) => setVoltage(e.target.value)} className={inputCls} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Power Factor</label>
              <input inputMode="decimal" value={pf} onChange={(e) => setPf(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Efficiency</label>
              <input inputMode="decimal" value={eff} onChange={(e) => setEff(e.target.value)} className={inputCls} />
            </div>
          </div>
        </div>
      )}

      {/* result */}
      <div className="mt-5 rounded bg-gray-900 text-white px-5 py-4">
        <div className="text-[12px] text-gray-400 uppercase tracking-wider">รุ่นที่ช่วงกระแสครอบคลุม</div>
        {valid ? (
          chosen ? (
            <>
              <div className="text-2xl font-display font-extrabold mt-1">{chosen.label}</div>
              <div className="text-[13px] text-gray-300 mt-1">
                กระแสมอเตอร์ ≈ <b className="text-white">{fmt(amps)} A</b> · ตั้งค่าให้อยู่กลางช่วง{" "}
                {chosen.lo}–{chosen.hi} A
              </div>
            </>
          ) : (
            <div className="text-xl font-display font-extrabold mt-1">
              ≈ {fmt(amps)} A — ต้องปรึกษา SAV
            </div>
          )
        ) : (
          <div className="text-2xl font-display font-extrabold mt-1">— กรอกค่าให้ครบ</div>
        )}
      </div>

      {/* honest coverage note */}
      {note && (
        <div
          className={`mt-4 rounded border-l-4 px-4 py-3 text-[13.5px] leading-relaxed ${
            noteTone === "warn" ? "bg-amber-50 border-amber-300 text-amber-900" : "bg-emerald-50 border-emerald-300 text-emerald-900"
          }`}
        >
          {noteTone === "warn" ? "⚠️ " : "✓ "}
          {note}
        </div>
      )}

      {/* assumptions */}
      <ul className="mt-4 text-[13px] text-gray-600 space-y-1 list-disc pl-5">
        <li>เลือก ZCT/รีเลย์จาก <b>ช่วงกระแส</b> ให้ค่าใช้งานอยู่ราวกลางช่วง (ไม่ชิดขอบบน/ล่าง)</li>
        <li>ช่วงที่แสดงเป็นรุ่น <b>ดิจิทัลที่พร้อมส่ง</b> — ยังมีรุ่นอนาล็อก/ช่วงอื่นตามสต๊อก สอบถามได้</li>
        <li>ยึด <b>Full-load Current บน Nameplate</b> เป็นค่าจริง · เกิน 60 A ใช้ External CT</li>
      </ul>

      {/* CTA */}
      <div className="mt-5 flex flex-wrap gap-3">
        <a
          href={lineLink()}
          target="_blank"
          rel="noopener"
          onClick={() => {
            if (nameplateMsg) navigator.clipboard?.writeText(nameplateMsg).catch(() => {});
          }}
          className="bg-brand text-white font-display text-xs font-bold tracking-wider uppercase px-6 py-3 rounded-sm hover:bg-brand-dark transition-colors"
        >
          📤 ให้ SAV ยืนยันรุ่น EOCR
        </a>
        <Link
          href="/products/"
          className="border border-gray-300 text-ink font-display text-xs font-bold tracking-wider uppercase px-6 py-3 rounded-sm hover:border-brand hover:text-brand transition-colors"
        >
          ดูรีเลย์ EOCR
        </Link>
      </div>
      <p className="mt-2 text-[11.5px] text-gray-400">
        กดปุ่มแล้วข้อความสรุปจะถูกคัดลอกอัตโนมัติ — วางใน LINE พร้อมแนบรูป Nameplate ได้เลย
      </p>
    </div>
  );
}
