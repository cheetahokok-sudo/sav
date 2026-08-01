"use client";

import { useState } from "react";
import Link from "next/link";
import { lineLink } from "../../lib/company";

const INV_SQRT3 = 1 / Math.sqrt(3);

export default function StarDeltaCalculator() {
  const [fla, setFla] = useState("45");

  const F = parseFloat(fla);
  const valid = !isNaN(F) && F > 0 && isFinite(F);
  const branch = valid ? F * INV_SQRT3 : NaN;
  const fmt = (x: number) => x.toFixed(1);

  const msg = valid
    ? `ขอคำแนะนำเลือกรุ่น EOCR สำหรับมอเตอร์สตาร์-เดลต้า FLA ${fla} A (CT ฝั่ง Line ตั้ง ${fmt(F)} A / กิ่งเดลต้าตั้ง ≈ ${fmt(branch)} A) รบกวนส่งรูป Nameplate ให้ตรวจสอบครับ`
    : "";

  return (
    <div className="rounded-lg border border-gray-200 border-t-[3px] border-t-brand bg-white p-6">
      {/* input */}
      <div className="max-w-xs">
        <label className="block text-[13px] font-semibold text-gray-600 mb-1">
          กระแสพิกัดมอเตอร์ FLA จาก Nameplate (A)
        </label>
        <input
          inputMode="decimal"
          value={fla}
          onChange={(e) => setFla(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 text-[15px] focus:border-brand outline-none"
        />
        <p className="text-[12px] text-gray-500 mt-1">
          ยังไม่รู้ FLA? ประมาณจาก kW ได้ที่{" "}
          <Link href="/learn/motor-current-calculator/" className="text-brand hover:underline">
            เครื่องคำนวณกระแสมอเตอร์
          </Link>
        </p>
      </div>

      {/* result */}
      <div className="mt-5 rounded bg-gray-900 text-white px-5 py-4 overflow-x-auto">
        <div className="text-[12px] text-gray-400 uppercase tracking-wider mb-2">
          ค่าตั้ง Current Dial แนะนำ ตามตำแหน่ง CT / รีเลย์
        </div>
        {valid ? (
          <table className="w-full text-left text-[14px] min-w-[430px]">
            <thead>
              <tr className="text-[12px] text-gray-400 border-b border-gray-700">
                <th className="py-1.5 pr-3 font-semibold">ตำแหน่งติดตั้ง</th>
                <th className="py-1.5 pr-3 font-semibold">กระแสที่รีเลย์เห็น</th>
                <th className="py-1.5 font-semibold">ตั้ง Dial</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-800">
                <td className="py-2 pr-3">ฝั่ง Line (ก่อนแยกเข้าคอนแทคเตอร์)</td>
                <td className="py-2 pr-3 font-mono">I = FLA = {fmt(F)} A</td>
                <td className="py-2 font-display font-extrabold text-xl">≈ {fmt(F)} A</td>
              </tr>
              <tr>
                <td className="py-2 pr-3">ในกิ่งเดลต้า (อนุกรมกับขดลวด)</td>
                <td className="py-2 pr-3 font-mono">I = FLA ÷ √3 = {fmt(branch)} A</td>
                <td className="py-2 font-display font-extrabold text-xl">≈ {fmt(branch)} A</td>
              </tr>
            </tbody>
          </table>
        ) : (
          <div className="text-3xl font-display font-extrabold">— กรอกค่า FLA</div>
        )}
      </div>

      {/* assumptions */}
      <ul className="mt-4 text-[13px] text-gray-600 space-y-1 list-disc pl-5">
        <li>ขณะรันในโหมดเดลต้า กระแสในขดลวด (Phase) = กระแส Line ÷ √3 ≈ FLA × 0.58</li>
        <li>
          ตรวจว่าค่าตั้งอยู่ <b>กลาง ๆ ช่วงกระแส</b> ของรุ่นรีเลย์ — เช็คได้ที่{" "}
          <Link href="/learn/eocr-current-range-calculator/" className="text-brand hover:underline">
            เครื่องช่วยเลือกช่วงกระแส EOCR
          </Link>
        </li>
        <li>เป็นค่าเริ่มต้นแนะนำ — ยึด Nameplate และคู่มือรีเลย์รุ่นที่ใช้เป็นหลัก</li>
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
