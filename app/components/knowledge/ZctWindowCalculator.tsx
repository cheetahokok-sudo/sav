"use client";

import { useState } from "react";
import Link from "next/link";
import { lineLink } from "../../lib/company";

// Woonyoung WYZR round ZCT nominal window sizes (mm) — model number tracks the
// nominal inner diameter (corroborated by the CAD labels ZCT30…ZCT200). Exact
// usable window + clearance must be confirmed against the datasheet.
const WINDOWS = [30, 50, 65, 80, 100, 120, 150, 200];
const pad = (w: number) => String(w).padStart(3, "0"); // 30 -> "030"

export default function ZctWindowCalculator() {
  const [od, setOd] = useState("35");
  const [clearance, setClearance] = useState("30"); // % clearance to leave

  const OD = parseFloat(od);
  const CL = parseFloat(clearance);
  const valid = !isNaN(OD) && OD > 0 && !isNaN(CL) && CL >= 0;

  // Need window ≥ bundle OD × (1 + clearance%) so cables pass with room to bend.
  const needed = valid ? OD * (1 + CL / 100) : NaN;
  const pick = valid ? WINDOWS.find((w) => w >= needed) : undefined;
  const fmt = (x: number, d = 0) => x.toFixed(d);

  const nameplateMsg = valid
    ? `ขอคำแนะนำเลือกขนาดรู ZCT: เส้นผ่านศูนย์กลางรวมของสาย ~${od} มม.${
        pick ? ` (คาดว่าเหมาะกับรุ่นรู ~Φ${pick} มม. เช่น WYZR-${pad(pick)}N)` : ""
      } รบกวนช่วยยืนยันรุ่นครับ`
    : "";

  const inputCls = "w-full border border-gray-300 rounded px-3 py-2 text-[15px] focus:border-brand outline-none";
  const labelCls = "block text-[13px] font-semibold text-gray-600 mb-1";

  return (
    <div className="rounded-lg border border-gray-200 border-t-[3px] border-t-brand bg-white p-6">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>เส้นผ่านศูนย์กลางรวมของสายที่ต้องลอด (มม.)</label>
          <input inputMode="decimal" value={od} onChange={(e) => setOd(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>เผื่อระยะ (%) สำหรับดัด/ร้อยสาย</label>
          <input inputMode="decimal" value={clearance} onChange={(e) => setClearance(e.target.value)} className={inputCls} />
        </div>
      </div>

      <div className="mt-5 rounded bg-gray-900 text-white px-5 py-4">
        <div className="text-[12px] text-gray-400 uppercase tracking-wider">ขนาดรู ZCT ที่แนะนำ (ขั้นต่ำ)</div>
        {valid ? (
          pick ? (
            <>
              <div className="text-3xl font-display font-extrabold mt-1">≈ Φ{pick} มม.</div>
              <div className="text-[13px] text-gray-300 mt-1">
                เช่นรุ่น <b className="text-white">WYZR-{pad(pick)}N</b> หรือ WYZR-{pad(pick)} · ต้องการรูอย่างน้อย{" "}
                ≈ {fmt(needed)} มม. (สาย {od} มม. + เผื่อ {clearance}%)
              </div>
            </>
          ) : (
            <div className="text-xl font-display font-extrabold mt-1">
              เกิน Φ200 มม. — ปรึกษา SAV เรื่องรุ่นรูใหญ่พิเศษ
            </div>
          )
        ) : (
          <div className="text-3xl font-display font-extrabold mt-1">— กรอกค่าให้ครบ</div>
        )}
      </div>

      <div className="mt-4 rounded border-l-4 border-amber-300 bg-amber-50 text-amber-900 px-4 py-3 text-[13.5px] leading-relaxed">
        ⚠️ เลขรุ่น WYZR เป็น <b>ขนาดรูโดยประมาณ (มม.)</b> — ยืนยันขนาดรูจริงและระยะเผื่อที่ใช้ได้กับ Dimension
        Drawing / Datasheet ของรุ่น หรือให้ทีม SAV ช่วยตรวจก่อนสั่ง
      </div>

      <ul className="mt-4 text-[13px] text-gray-600 space-y-1 list-disc pl-5">
        <li>ให้สายที่มีกระแส <b>ทุกเส้น</b> (เฟส+นิวทรัล) ลอดผ่านแกนเดียวกัน · สายดิน (PE) ต้องไม่ลอดผ่าน</li>
        <li>เผื่อระยะให้สายร้อยและดัดได้สะดวก อย่าเลือกรูพอดีเป๊ะ</li>
        <li>ZCT เลือกจาก <b>ขนาดรู + ความเข้ากันกับรีเลย์</b> ไม่ใช่จากกระแสโหลด</li>
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
          📤 ให้ SAV ยืนยันรุ่น ZCT
        </a>
        <Link
          href="/products/WYZR-N/"
          className="border border-gray-300 text-ink font-display text-xs font-bold tracking-wider uppercase px-6 py-3 rounded-sm hover:border-brand hover:text-brand transition-colors"
        >
          ดู ZCT Woonyoung
        </Link>
      </div>
      <p className="mt-2 text-[11.5px] text-gray-400">กดปุ่มแล้วข้อความสรุปจะถูกคัดลอกอัตโนมัติ — วางใน LINE ได้เลย</p>
    </div>
  );
}
