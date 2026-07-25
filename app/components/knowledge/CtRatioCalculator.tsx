"use client";

import { useState } from "react";
import Link from "next/link";
import { lineLink } from "../../lib/company";

type Mode = "amps" | "kva";
type Phase = "3" | "1";

// Standard CT primary ratings (×/5A secondary), commercial values.
const PRIMARIES = [
  50, 75, 100, 150, 200, 250, 300, 400, 500, 600, 750, 800, 1000, 1200, 1500, 2000, 2500, 3000, 4000, 5000, 6000,
];

export default function CtRatioCalculator() {
  const [mode, setMode] = useState<Mode>("amps");
  const [amps, setAmps] = useState("380");
  const [kva, setKva] = useState("250");
  const [voltage, setVoltage] = useState("400");
  const [phase, setPhase] = useState<Phase>("3");

  let I = NaN;
  if (mode === "amps") {
    I = parseFloat(amps);
  } else {
    const S = parseFloat(kva);
    const V = parseFloat(voltage);
    const denom = (phase === "3" ? Math.sqrt(3) : 1) * V;
    I = S > 0 && denom > 0 ? (S * 1000) / denom : NaN;
  }
  const valid = !isNaN(I) && isFinite(I) && I > 0;
  const fmt = (x: number, d = 0) => x.toFixed(d);

  // Pick smallest standard primary so load sits at ≤80% of the CT (ideal band 60–80%).
  const primary = valid ? PRIMARIES.find((p) => I <= 0.8 * p) : undefined;
  const loadPct = valid && primary ? (I / primary) * 100 : NaN;

  let note = "";
  let tone: "ok" | "warn" = "ok";
  if (valid) {
    if (!primary) {
      note = "โหลดสูงเกินช่วงมาตรฐานทั่วไป (เกิน ~4800 A) — ต้องเลือก CT พิกัดพิเศษ ปรึกษา SAV";
      tone = "warn";
    } else if (I < 0.6 * primary) {
      note = `โหลดอยู่ต่ำกว่า 60% ของ CT (${fmt(loadPct)}%) — ใช้ได้ แต่ถ้ามี CT พิกัดเล็กกว่านี้จะวัดแม่นกว่า`;
      tone = "warn";
    } else {
      note = `โหลดอยู่ที่ ${fmt(loadPct)}% ของพิกัด CT — อยู่ในช่วงแนะนำ 60–80% วัดได้แม่นยำ`;
      tone = "ok";
    }
  }

  const nameplateMsg = valid
    ? `ขอคำแนะนำเลือก CT ratio: กระแสโหลด ~${fmt(I, 1)} A${primary ? ` (คาดว่าเหมาะกับ ${primary}/5A)` : ""} รบกวนช่วยยืนยันรุ่น/พิกัดครับ`
    : "";

  const inputCls = "w-full border border-gray-300 rounded px-3 py-2 text-[15px] focus:border-brand outline-none";
  const labelCls = "block text-[13px] font-semibold text-gray-600 mb-1";

  return (
    <div className="rounded-lg border border-gray-200 border-t-[3px] border-t-brand bg-white p-6">
      <div className="mb-4">
        <label className={labelCls}>ข้อมูลที่มี</label>
        <div className="flex gap-2 max-w-xs">
          {([["amps", "กระแสโหลด (A)"], ["kva", "จากขนาด kVA"]] as [Mode, string][]).map(([m, t]) => (
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

      {mode === "amps" ? (
        <div>
          <label className={labelCls}>กระแสโหลดสูงสุด (A)</label>
          <input inputMode="decimal" value={amps} onChange={(e) => setAmps(e.target.value)} className={inputCls} />
        </div>
      ) : (
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className={labelCls}>ขนาด (kVA)</label>
            <input inputMode="decimal" value={kva} onChange={(e) => setKva(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>แรงดัน (V)</label>
            <input inputMode="decimal" value={voltage} onChange={(e) => setVoltage(e.target.value)} className={inputCls} />
          </div>
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
                  {p}φ
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="mt-5 rounded bg-gray-900 text-white px-5 py-4">
        <div className="text-[12px] text-gray-400 uppercase tracking-wider">CT ratio ที่แนะนำ</div>
        {valid ? (
          primary ? (
            <>
              <div className="text-3xl font-display font-extrabold mt-1">{primary} / 5 A</div>
              <div className="text-[13px] text-gray-300 mt-1">
                กระแสโหลด ≈ <b className="text-white">{fmt(I, 1)} A</b> · โหลด {fmt(loadPct)}% ของพิกัด
              </div>
            </>
          ) : (
            <div className="text-xl font-display font-extrabold mt-1">≈ {fmt(I, 1)} A — ต้องปรึกษา SAV</div>
          )
        ) : (
          <div className="text-3xl font-display font-extrabold mt-1">— กรอกค่าให้ครบ</div>
        )}
      </div>

      {note && (
        <div
          className={`mt-4 rounded border-l-4 px-4 py-3 text-[13.5px] leading-relaxed ${
            tone === "warn" ? "bg-amber-50 border-amber-300 text-amber-900" : "bg-emerald-50 border-emerald-300 text-emerald-900"
          }`}
        >
          {tone === "warn" ? "⚠️ " : "✓ "}
          {note}
        </div>
      )}

      <ul className="mt-4 text-[13px] text-gray-600 space-y-1 list-disc pl-5">
        <li>หลักการ: เลือกพิกัดปฐมภูมิของ CT ให้กระแสใช้งานอยู่ราว <b>60–80%</b> ของพิกัด</li>
        <li>พิกัดมาตรฐาน (×/5A): 50, 75, 100, 150, 200, 250, 300, 400, 500, 600, 800, 1000, 1200, 1500, 2000 …</li>
        <li>วินาทีภูมิมาตรฐานทั่วไปคือ 5A (บางระบบใช้ 1A) — เลือกให้เข้ากับมิเตอร์/รีเลย์</li>
        <li>เป็นแนวทางเบื้องต้น — ตรวจคลาสความแม่นยำและ Burden ตาม IEC 61869-2 และสเปกอุปกรณ์</li>
      </ul>

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
          📤 ปรึกษา CT / มิเตอร์กับ SAV
        </a>
        <Link
          href="/products/"
          className="border border-gray-300 text-ink font-display text-xs font-bold tracking-wider uppercase px-6 py-3 rounded-sm hover:border-brand hover:text-brand transition-colors"
        >
          ดูมิเตอร์ Samwha DSP
        </Link>
      </div>
      <p className="mt-2 text-[11.5px] text-gray-400">กดปุ่มแล้วข้อความสรุปจะถูกคัดลอกอัตโนมัติ — วางใน LINE ได้เลย</p>
    </div>
  );
}
