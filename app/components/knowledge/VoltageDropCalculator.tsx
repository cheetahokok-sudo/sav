"use client";

import { useState } from "react";
import Link from "next/link";
import { lineLink } from "../../lib/company";

// Voltage drop by the standard method: VD(V) = (mV/A/m) × I × L / 1000.
// mV/A/m is read by the user from the cable datasheet / วสท. table for the
// correct system (1φ or 3φ) — we do NOT hard-code conductor resistances.
export default function VoltageDropCalculator() {
  const [current, setCurrent] = useState("40");
  const [length, setLength] = useState("50");
  const [mvam, setMvam] = useState("1.1");
  const [voltage, setVoltage] = useState("400");

  const I = parseFloat(current);
  const L = parseFloat(length);
  const M = parseFloat(mvam);
  const V = parseFloat(voltage);

  const vd = I > 0 && L > 0 && M > 0 ? (M * I * L) / 1000 : NaN;
  const pct = vd > 0 && V > 0 ? (vd / V) * 100 : NaN;
  const valid = !isNaN(vd) && !isNaN(pct) && isFinite(pct);
  const fmt = (x: number, d = 1) => x.toFixed(d);

  let tone: "ok" | "warn" | "bad" = "ok";
  let msg = "";
  if (valid) {
    if (pct <= 3) {
      tone = "ok";
      msg = "อยู่ในเกณฑ์ที่ดี (วงจรย่อยแนะนำ ≤ 3%)";
    } else if (pct <= 5) {
      tone = "warn";
      msg = "ยังไม่เกินเกณฑ์รวม 5% แต่เกิน 3% — ถ้าเป็นวงจรย่อยควรพิจารณาเพิ่มขนาดสาย";
    } else {
      tone = "bad";
      msg = "เกินเกณฑ์รวม 5% ตามมาตรฐาน — ควรเพิ่มขนาดสายหรือลดระยะ/โหลด";
    }
  }

  const nameplateMsg = valid
    ? `ขอคำแนะนำเรื่องแรงดันตก: กระแส ${current} A, ระยะ ${length} m, mV/A/m ${mvam}, แรงดัน ${voltage} V → แรงดันตก ≈ ${fmt(vd)} V (${fmt(pct)}%) รบกวนช่วยตรวจการเลือกขนาดสายครับ`
    : "";

  const inputCls = "w-full border border-gray-300 rounded px-3 py-2 text-[15px] focus:border-brand outline-none";
  const labelCls = "block text-[13px] font-semibold text-gray-600 mb-1";
  const toneCls = {
    ok: "bg-emerald-50 border-emerald-300 text-emerald-900",
    warn: "bg-amber-50 border-amber-300 text-amber-900",
    bad: "bg-red-50 border-red-300 text-red-900",
  }[tone];

  return (
    <div className="rounded-lg border border-gray-200 border-t-[3px] border-t-brand bg-white p-6">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>กระแสใช้งาน (A)</label>
          <input inputMode="decimal" value={current} onChange={(e) => setCurrent(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>ระยะสายทางเดียว (เมตร)</label>
          <input inputMode="decimal" value={length} onChange={(e) => setLength(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>ค่าสาย mV/A/m (จาก Datasheet/ตารางมาตรฐาน)</label>
          <input inputMode="decimal" value={mvam} onChange={(e) => setMvam(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>แรงดันระบบ (V)</label>
          <input inputMode="decimal" value={voltage} onChange={(e) => setVoltage(e.target.value)} className={inputCls} />
        </div>
      </div>

      <div className="mt-5 rounded bg-gray-900 text-white px-5 py-4">
        <div className="text-[12px] text-gray-400 uppercase tracking-wider">แรงดันตกโดยประมาณ</div>
        <div className="text-3xl font-display font-extrabold mt-1">
          {valid ? `≈ ${fmt(vd)} V (${fmt(pct)}%)` : "— กรอกค่าให้ครบ"}
        </div>
        {valid && (
          <div className="text-[12.5px] text-gray-300 mt-2 font-mono">
            VD = (mV/A/m × I × L) / 1000 = ({mvam} × {current} × {length}) / 1000
          </div>
        )}
      </div>

      {valid && (
        <div className={`mt-4 rounded border-l-4 px-4 py-3 text-[13.5px] leading-relaxed ${toneCls}`}>
          {tone === "ok" ? "✓ " : "⚠️ "}
          {msg}
        </div>
      )}

      <ul className="mt-4 text-[13px] text-gray-600 space-y-1 list-disc pl-5">
        <li>ใช้ค่า <b>mV/A/m</b> ให้ตรงระบบ (1 เฟส / 3 เฟส) จากตารางมาตรฐาน/แคตตาล็อกสายของรุ่นนั้น</li>
        <li>3 เฟสใช้แรงดันสาย ~400V · 1 เฟส ~230V (ตามระบบจริง)</li>
        <li>เกณฑ์ วสท.: แรงดันตกรวม (สายป้อน+วงจรย่อย) <b>ไม่เกิน 5%</b> โดยวงจรย่อยแนะนำ ≤ 3% — ตรวจฉบับล่าสุด</li>
        <li>เป็น <b>ค่าประมาณ</b> การออกแบบจริงต้องดูอุณหภูมิ วิธีเดินสาย และการ Derating ประกอบ</li>
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
          📤 ปรึกษาการเลือกสายกับ SAV
        </a>
        <Link
          href="/products/"
          className="border border-gray-300 text-ink font-display text-xs font-bold tracking-wider uppercase px-6 py-3 rounded-sm hover:border-brand hover:text-brand transition-colors"
        >
          ดูสินค้า
        </Link>
      </div>
      <p className="mt-2 text-[11.5px] text-gray-400">
        กดปุ่มแล้วข้อความสรุปจะถูกคัดลอกอัตโนมัติ — วางใน LINE ได้เลย
      </p>
    </div>
  );
}
