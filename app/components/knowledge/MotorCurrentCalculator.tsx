"use client";

import { useState } from "react";
import Link from "next/link";
import { lineLink } from "../../lib/company";

type Phase = "3" | "1";
type Unit = "kW" | "HP";

export default function MotorCurrentCalculator() {
  const [phase, setPhase] = useState<Phase>("3");
  const [unit, setUnit] = useState<Unit>("kW");
  const [power, setPower] = useState("5.5");
  const [voltage, setVoltage] = useState("400");
  const [pf, setPf] = useState("0.85");
  const [eff, setEff] = useState("0.88");

  const P = parseFloat(power);
  const V = parseFloat(voltage);
  const PF = parseFloat(pf);
  const EFF = parseFloat(eff);

  const watts = isNaN(P) ? NaN : P * (unit === "kW" ? 1000 : 746);
  const denom = (phase === "3" ? Math.sqrt(3) : 1) * V * PF * EFF;
  const current = watts > 0 && denom > 0 ? watts / denom : NaN;
  const valid = !isNaN(current) && isFinite(current);
  const I = valid ? current : 0;
  const fmt = (x: number) => x.toFixed(1);

  const nameplateMsg =
    valid
      ? `ขอคำแนะนำเลือกรุ่น EOCR สำหรับมอเตอร์ ${phase} เฟส ${power} ${unit} ${V}V (คำนวณกระแสประมาณ ${fmt(I)} A) รบกวนส่งรูป Nameplate ให้ตรวจสอบครับ`
      : "";

  return (
    <div className="rounded-lg border border-gray-200 border-t-[3px] border-t-brand bg-white p-6">
      {/* inputs */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[13px] font-semibold text-gray-600 mb-1">ระบบไฟ</label>
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
          <label className="block text-[13px] font-semibold text-gray-600 mb-1">กำลัง</label>
          <div className="flex gap-2">
            <input
              inputMode="decimal"
              value={power}
              onChange={(e) => setPower(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-[15px] focus:border-brand outline-none"
            />
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
          <label className="block text-[13px] font-semibold text-gray-600 mb-1">แรงดัน (V)</label>
          <input
            inputMode="decimal"
            value={voltage}
            onChange={(e) => setVoltage(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 text-[15px] focus:border-brand outline-none"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[13px] font-semibold text-gray-600 mb-1">Power Factor</label>
            <input
              inputMode="decimal"
              value={pf}
              onChange={(e) => setPf(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-[15px] focus:border-brand outline-none"
            />
          </div>
          <div>
            <label className="block text-[13px] font-semibold text-gray-600 mb-1">Efficiency</label>
            <input
              inputMode="decimal"
              value={eff}
              onChange={(e) => setEff(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-[15px] focus:border-brand outline-none"
            />
          </div>
        </div>
      </div>

      {/* result */}
      <div className="mt-5 rounded bg-gray-900 text-white px-5 py-4">
        <div className="text-[12px] text-gray-400 uppercase tracking-wider">กระแสโดยประมาณ (Estimated Full-Load Current)</div>
        <div className="text-3xl font-display font-extrabold mt-1">
          {valid ? `≈ ${fmt(I)} A` : "— กรอกค่าให้ครบ"}
        </div>
        {valid && (
          <div className="text-[12.5px] text-gray-300 mt-2 font-mono">
            I = P / ({phase === "3" ? "√3 × " : ""}V × PF × η) = {fmt(watts)} / ({phase === "3" ? "1.732 × " : ""}
            {V} × {PF} × {EFF})
          </div>
        )}
      </div>

      {/* assumptions */}
      <ul className="mt-4 text-[13px] text-gray-600 space-y-1 list-disc pl-5">
        <li>P แปลงเป็นวัตต์: kW×1000 หรือ HP×746 · η = ประสิทธิภาพ · PF = ตัวประกอบกำลัง</li>
        <li>เป็น <b>ค่าประมาณ</b> — กระแสจริงให้ยึด <b>Full-load Current บน Nameplate</b> เป็นหลัก</li>
        <li>กระแสเริ่มต้น (Starting Current) แบบ DOL สูงประมาณ 6–8 เท่าของกระแสพิกัด — เผื่อ Start Delay เมื่อตั้งรีเลย์</li>
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
          📤 ส่ง Nameplate ให้ SAV เลือกรุ่น EOCR
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
