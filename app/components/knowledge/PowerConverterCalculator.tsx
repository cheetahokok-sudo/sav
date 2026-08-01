"use client";

import { useState } from "react";
import Link from "next/link";
import { lineLink } from "../../lib/company";

type Phase = "3" | "1";
type From = "kW" | "kVA" | "A";

export default function PowerConverterCalculator() {
  const [phase, setPhase] = useState<Phase>("3");
  const [from, setFrom] = useState<From>("kW");
  const [value, setValue] = useState("30");
  const [voltage, setVoltage] = useState("400");
  const [pf, setPf] = useState("0.85");

  const X = parseFloat(value);
  const V = parseFloat(voltage);
  const PF = parseFloat(pf);

  const k = phase === "3" ? Math.sqrt(3) : 1;
  const pfOk = !isNaN(PF) && PF > 0 && PF <= 1;
  const vOk = !isNaN(V) && V > 0;
  const xOk = !isNaN(X) && X > 0;

  // Solve all three quantities from whichever one the user entered.
  let kW = NaN;
  let kVA = NaN;
  let amp = NaN;
  if (xOk) {
    if (from === "kW") {
      kW = X;
      if (pfOk) kVA = X / PF;
      if (pfOk && vOk) amp = (X * 1000) / (k * V * PF);
    } else if (from === "kVA") {
      kVA = X;
      if (pfOk) kW = X * PF;
      if (vOk) amp = (X * 1000) / (k * V);
    } else {
      amp = X;
      if (vOk) kVA = (k * V * X) / 1000;
      if (vOk && pfOk) kW = ((k * V * X) / 1000) * PF;
    }
  }

  const fmt = (x: number) => (isNaN(x) || !isFinite(x) ? "—" : x >= 100 ? x.toFixed(0) : x.toFixed(1));
  const any = [kW, kVA, amp].some((x) => !isNaN(x) && isFinite(x));

  const msg = any
    ? `ขอใบเสนอราคา/คำแนะนำอุปกรณ์ สำหรับโหลด ${phase} เฟส ${V || "-"}V PF ${pf}: ประมาณ ${fmt(kW)} kW / ${fmt(kVA)} kVA / ${fmt(amp)} A`
    : "";

  const inputCls =
    "w-full border border-gray-300 rounded px-3 py-2 text-[15px] focus:border-brand outline-none";
  const labelCls = "block text-[13px] font-semibold text-gray-600 mb-1";

  return (
    <div className="rounded-lg border border-gray-200 border-t-[3px] border-t-brand bg-white p-6">
      {/* inputs */}
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
          <label className={labelCls}>แปลงจาก</label>
          <div className="flex gap-2">
            <input inputMode="decimal" value={value} onChange={(e) => setValue(e.target.value)} className={inputCls} />
            <select
              value={from}
              onChange={(e) => setFrom(e.target.value as From)}
              className="border border-gray-300 rounded px-2 text-[14px] focus:border-brand outline-none"
            >
              <option value="kW">kW</option>
              <option value="kVA">kVA</option>
              <option value="A">A</option>
            </select>
          </div>
        </div>
        <div>
          <label className={labelCls}>แรงดัน (V)</label>
          <input
            inputMode="decimal"
            value={voltage}
            onChange={(e) => setVoltage(e.target.value)}
            placeholder={phase === "1" ? "เช่น 230" : "เช่น 400"}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Power Factor</label>
          <input inputMode="decimal" value={pf} onChange={(e) => setPf(e.target.value)} className={inputCls} />
          {!pfOk && pf !== "" && (
            <p className="text-[12px] text-brand mt-1">PF ต้องอยู่ระหว่าง 0–1</p>
          )}
        </div>
      </div>

      {/* result */}
      <div className="mt-5 rounded bg-gray-900 text-white px-5 py-4">
        <div className="text-[12px] text-gray-400 uppercase tracking-wider">ผลการแปลง (ค่าประมาณ)</div>
        {any ? (
          <div className="grid grid-cols-3 gap-2 mt-2">
            {(
              [
                ["kW", kW, "กำลังจริง"],
                ["kVA", kVA, "กำลังปรากฏ"],
                ["A", amp, "กระแส"],
              ] as const
            ).map(([u, x, name]) => (
              <div key={u} className={from === u ? "opacity-70" : ""}>
                <div className="text-2xl font-display font-extrabold">
                  {fmt(x)} <span className="text-[14px] font-bold">{u}</span>
                </div>
                <div className="text-[11.5px] text-gray-400">
                  {name}
                  {from === u ? " (ค่าที่กรอก)" : ""}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-3xl font-display font-extrabold mt-1">— กรอกค่าให้ครบ</div>
        )}
      </div>

      {/* assumptions */}
      <ul className="mt-4 text-[13px] text-gray-600 space-y-1 list-disc pl-5">
        <li>kVA = kW ÷ PF · กระแส {phase === "3" ? "3 เฟส: I = P / (√3 × V × PF)" : "1 เฟส: I = P / (V × PF)"}</li>
        <li>เป็น <b>ค่าประมาณ</b> — สำหรับมอเตอร์ กระแสจริงให้ยึด <b>Full-load Current บน Nameplate</b></li>
        <li>ไม่รวม Efficiency ของมอเตอร์ — ถ้าต้องการกระแสมอเตอร์จาก kW เพลา ใช้ <Link href="/learn/motor-current-calculator/" className="text-brand hover:underline">เครื่องคำนวณกระแสมอเตอร์</Link></li>
      </ul>

      {/* CTA */}
      <div className="mt-5 flex flex-wrap gap-3">
        <a
          href={lineLink()}
          target="_blank"
          rel="noopener"
          onClick={() => {
            if (msg) navigator.clipboard?.writeText(msg).catch(() => {});
          }}
          className="bg-brand text-white font-display text-xs font-bold tracking-wider uppercase px-6 py-3 rounded-sm hover:bg-brand-dark transition-colors"
        >
          📤 ส่งค่าให้ SAV แนะนำอุปกรณ์
        </a>
        <Link
          href="/products/"
          className="border border-gray-300 text-ink font-display text-xs font-bold tracking-wider uppercase px-6 py-3 rounded-sm hover:border-brand hover:text-brand transition-colors"
        >
          ดูสินค้าทั้งหมด
        </Link>
      </div>
      <p className="mt-2 text-[11.5px] text-gray-400">
        กดปุ่มแล้วข้อความสรุปจะถูกคัดลอกอัตโนมัติ — วางใน LINE ได้เลย
      </p>
    </div>
  );
}
