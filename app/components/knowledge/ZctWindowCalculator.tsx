"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { lineLink } from "../../lib/company";
import {
  CABLE_TYPES,
  type CableTypeId,
  type CoreCount,
  cableType,
  sizesFor,
  odFor,
  PACK_K,
  packPositions,
  ZCT_WINDOWS,
  zctModel,
  SLACK_OPTIONS,
  DEFAULT_SLACK,
  threadingHeadroom,
  TERMINATED_EXTRA_HEADROOM,
} from "./cableOdData";

type WiringId = "1p" | "3p3w" | "3p4w" | "stardelta";

const WIRINGS: { id: WiringId; label: string; sub: string; conductors: number; cores: CoreCount }[] = [
  { id: "1p", label: "1 เฟส", sub: "2 สาย (L+N)", conductors: 2, cores: 2 },
  { id: "3p3w", label: "3 เฟส 3 สาย", sub: "L1 L2 L3", conductors: 3, cores: 3 },
  { id: "3p4w", label: "3 เฟส 4 สาย", sub: "มีนิวทรัล", conductors: 4, cores: 4 },
  { id: "stardelta", label: "Star-Delta", sub: "สายมอเตอร์ 6 เส้น", conductors: 6, cores: 3 },
];

const fmt = (x: number, d = 1) => (Math.round(x * 10 ** d) / 10 ** d).toString();

export default function ZctWindowCalculator() {
  const [wiring, setWiring] = useState<WiringId>("stardelta");
  const [parallel, setParallel] = useState(false);
  const [typeId, setTypeId] = useState<CableTypeId>("THW");
  const [cores, setCores] = useState<CoreCount>(1);
  const [size, setSize] = useState<number>(150);
  const [manualOd, setManualOd] = useState("18");
  const [slack, setSlack] = useState<number>(DEFAULT_SLACK);
  const [terminated, setTerminated] = useState(false);
  const [previewIdx, setPreviewIdx] = useState<number | null>(null); // null = auto

  const w = WIRINGS.find((x) => x.id === wiring)!;
  const type = cableType(typeId);
  const isManual = typeId === "MANUAL";
  const multicore = !isManual && cores > 1;

  // effective core count for multicore (clamp to what the type offers)
  const coreOptions = type?.cores ?? [1];
  const activeCores: CoreCount = coreOptions.includes(cores) ? cores : coreOptions[0];
  const sizes = !isManual ? sizesFor(typeId, activeCores) : [];
  const activeSize = sizes.includes(size) ? size : sizes[Math.floor(sizes.length / 2)] ?? 0;

  // cable OD
  const od = isManual ? parseFloat(manualOd) : odFor(typeId, activeCores, activeSize) ?? NaN;

  // how many CABLES pass through the ZCT
  let n: number;
  let countNote = "";
  if (multicore) {
    n = wiring === "stardelta" ? 2 : 1;
    n *= parallel ? 2 : 1;
    countNote =
      wiring === "stardelta"
        ? `Star-Delta + สายหลายแกน → ใช้ ${n} เส้น (ชุดละ ${activeCores} แกน)`
        : `สายหลายแกน ${activeCores}C หนึ่งเส้นรวมทุกตัวนำ → ลอด ${n} เส้น`;
    if (!multicoreMatchesWiring(activeCores, wiring)) {
      countNote += ` · งาน${w.label}แนะนำ ${w.cores}C — ตรวจจำนวนแกนให้ตรงงาน`;
    }
  } else {
    n = w.conductors * (parallel ? 2 : 1);
    countNote = `${w.label} (${w.sub}) → สายเดี่ยวลอด ${n} เส้น${parallel ? " (ขนาน ×2)" : ""}`;
  }

  const k = PACK_K[n] ?? 2 + n * 0.35; // fallback never hit for supported n
  const valid = !isNaN(od) && od > 0;

  // Ideal = perfect circle packing. Design = what to actually order.
  //
  // The allowance is applied per cable, not to the finished bundle, because
  // that is where the looseness comes from: each conductor keeps a bend and
  // refuses to sit flush against its neighbour, and n of those add up.
  const odEff = valid ? od * (1 + slack) : NaN;
  const idealBundle = valid ? k * od : NaN;
  const bundle = valid ? k * odEff : NaN;

  // Threading room, on top of the slack already inside `bundle`. Scales with
  // conductor count because the last two or three are the ones that have to be
  // forced in, and a terminated run is stiffer still.
  const headroom = threadingHeadroom(n) + (terminated ? TERMINATED_EXTRA_HEADROOM : 0);
  const maxFill = 1 - headroom;

  // Recommended window: smallest whose design bundle fits within that.
  const recIdx = valid ? ZCT_WINDOWS.findIndex((win) => bundle <= maxFill * win) : -1;
  const shownIdx = previewIdx ?? (recIdx >= 0 ? recIdx : ZCT_WINDOWS.length - 1);
  const win = ZCT_WINDOWS[shownIdx];
  const fill = valid ? bundle / win : NaN;
  const gapMm = valid ? (win - bundle) / 2 : NaN;

  type Fit = "ok" | "tight" | "over";
  const fit: Fit = !valid ? "ok" : fill <= maxFill ? "ok" : fill <= 1 ? "tight" : "over";
  const fitColor = { ok: "#059669", tight: "#d97706", over: "#cc1f1f" }[fit];
  const fitLabel = {
    ok: `ใส่ได้สบาย — เหลือระยะรอบมัดสาย ~${valid ? fmt(gapMm) : "?"} มม.`,
    tight: `คับ — มัดสายลอดได้ แต่ระหว่างร้อยจะไม่มีที่ให้ขยับ${
      n >= 6 ? " โดยเฉพาะ 2–3 เส้นสุดท้าย" : ""
    } (เหลือ ~${valid ? fmt(gapMm) : "?"} มม.) แนะนำขยับไปรูใหญ่ขึ้น`,
    over: "ไม่พอ — มัดสายใหญ่กว่ารู ต้องใช้รุ่นรูใหญ่กว่านี้",
  }[fit];

  // ---- SVG geometry (to scale) ----
  const svg = useMemo(() => {
    if (!valid) return null;
    const VB = 360;
    const c = VB / 2;
    const winR = 128; // px radius of the window circle
    const pxPerMm = (winR * 2) / win;
    const bodyR = winR + 34;
    // Cables are drawn at their true diameter but spaced using the inflated
    // one, so the picture shows what the allowance means: real cable, real
    // gaps between them, rather than the impossible touching-circles diagram.
    const cableR = (od / 2) * pxPerMm;
    const spreadR = (odEff / 2) * pxPerMm;
    const pos = packPositions(n).map(([x, y]) => [c + x * spreadR, c + y * spreadR] as const);
    const bundleR = (bundle / 2) * pxPerMm;
    const idealR = (idealBundle / 2) * pxPerMm;
    return { VB, c, winR, bodyR, cableR, pos, bundleR, idealR };
  }, [valid, win, od, odEff, n, bundle, idealBundle]);

  const wiringTxt = `${w.label} (${w.sub})`;
  const cableTxt = isManual
    ? `สาย OD ${manualOd} มม.`
    : `${type?.label} ${activeCores > 1 ? activeCores + "C " : ""}${activeSize} mm²`;
  const nameplateMsg = valid
    ? `ขอคำแนะนำเลือก ZCT: ${wiringTxt} · ${cableTxt} × ${n} เส้น (OD ≈ ${fmt(od)} มม./เส้น` +
      `, มัดอุดมคติ ≈ ${fmt(idealBundle)} มม., เผื่อหลวม ${Math.round(slack * 100)}% → ใช้ออกแบบ ≈ ${fmt(bundle)} มม.` +
      `, กันที่ร้อยสาย ${Math.round(headroom * 100)}% ของรู${terminated ? ", สายเข้าหัวหางปลามาแล้ว" : ""})` +
      `${
        recIdx >= 0
          ? ` คาดว่าเหมาะกับ ${zctModel(ZCT_WINDOWS[recIdx])} (รู ~Φ${ZCT_WINDOWS[recIdx]} มม.)`
          : " เกินช่วงรุ่นมาตรฐาน"
      } รบกวนยืนยันรุ่นครับ`
    : "";

  const btn = (active: boolean) =>
    `py-2 px-3 rounded text-[13.5px] font-semibold border transition-colors ${
      active ? "bg-brand text-white border-brand" : "border-gray-300 text-ink hover:border-brand"
    }`;
  const labelCls = "block text-[13px] font-semibold text-gray-600 mb-1";
  const inputCls = "w-full border border-gray-300 rounded px-3 py-2 text-[15px] focus:border-brand outline-none";

  return (
    <div className="rounded-lg border border-gray-200 border-t-[3px] border-t-brand bg-white p-6">
      {/* 1 — wiring */}
      <label className={labelCls}>1) การเดินสาย (กำหนดจำนวนสายที่ลอด ZCT)</label>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
        {WIRINGS.map((x) => (
          <button key={x.id} type="button" onClick={() => { setWiring(x.id); setPreviewIdx(null); }} className={btn(wiring === x.id)}>
            <span className="block">{x.label}</span>
            <span className={`block text-[11px] font-normal ${wiring === x.id ? "text-red-100" : "text-gray-500"}`}>{x.sub}</span>
          </button>
        ))}
      </div>
      <label className="inline-flex items-center gap-2 text-[13px] text-gray-600 mb-4 cursor-pointer">
        <input type="checkbox" checked={parallel} onChange={(e) => { setParallel(e.target.checked); setPreviewIdx(null); }} className="accent-[#cc1f1f]" />
        เดินสายขนาน ×2 ต่อเฟส
      </label>

      {/* 2 — cable */}
      <label className={labelCls}>2) สายไฟ</label>
      <div className="flex flex-wrap gap-2 mb-3">
        {CABLE_TYPES.map((t) => (
          <button key={t.id} type="button" onClick={() => { setTypeId(t.id); setPreviewIdx(null); }} className={btn(typeId === t.id)} title={t.desc}>
            {t.label}
          </button>
        ))}
        <button type="button" onClick={() => { setTypeId("MANUAL"); setPreviewIdx(null); }} className={btn(isManual)}>
          กรอก OD เอง
        </button>
      </div>

      {isManual ? (
        <div className="mb-2 max-w-xs">
          <label className={labelCls}>OD ต่อเส้น (มม.) — จากแคตตาล็อกสายที่ใช้</label>
          <input inputMode="decimal" value={manualOd} onChange={(e) => { setManualOd(e.target.value); setPreviewIdx(null); }} className={inputCls} />
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3 mb-2">
          {coreOptions.length > 1 && (
            <div>
              <label className={labelCls}>จำนวนแกน (Core)</label>
              <div className="flex gap-2">
                {coreOptions.map((cc) => (
                  <button key={cc} type="button" onClick={() => { setCores(cc); setPreviewIdx(null); }} className={btn(activeCores === cc)}>
                    {cc === 1 ? "เดี่ยว 1C" : `${cc}C`}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div>
            <label className={labelCls}>ขนาดสาย (mm²) — OD จากสเปกผู้ผลิต</label>
            <select value={activeSize} onChange={(e) => { setSize(Number(e.target.value)); setPreviewIdx(null); }} className={inputCls}>
              {sizes.map((s) => (
                <option key={s} value={s}>
                  {s} mm² — OD ≈ {fmt(odFor(typeId, activeCores, s) ?? 0)} มม.
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
      <p className="text-[12.5px] text-gray-500 mb-4">{countNote}</p>

      {/* 3 — workmanship allowance */}
      <label className={labelCls}>3) เผื่อมัดสายหลวม (ต่อสายหนึ่งเส้น)</label>
      <div className="flex flex-wrap gap-2 mb-1">
        {SLACK_OPTIONS.map((s) => (
          <button
            key={s.value}
            type="button"
            onClick={() => { setSlack(s.value); setPreviewIdx(null); }}
            className={btn(slack === s.value)}
            title={s.desc}
          >
            <span className="block">+{s.label}</span>
            <span className={`block text-[11px] font-normal ${slack === s.value ? "text-red-100" : "text-gray-500"}`}>
              {s.value === DEFAULT_SLACK ? "แนะนำ" : s.value < DEFAULT_SLACK ? "สายจัดง่าย" : "สายแข็ง/คับ"}
            </span>
          </button>
        ))}
      </div>
      <p className="text-[12.5px] text-gray-500 mb-3">
        {SLACK_OPTIONS.find((s) => s.value === slack)?.desc} — สายจริงดัดให้ตรงสนิทและมัดชิดกันแบบ
        ในทฤษฎีไม่ได้ ค่ามัดสายที่คำนวณจากการเรียงวงกลมแบบอุดมคติจึงเป็น <b>ค่าต่ำสุด</b> ไม่ใช่ค่าที่ใช้สั่งของ
      </p>

      <label className="inline-flex items-start gap-2 text-[13px] text-gray-700 mb-1 cursor-pointer">
        <input
          type="checkbox"
          checked={terminated}
          onChange={(e) => { setTerminated(e.target.checked); setPreviewIdx(null); }}
          className="accent-[#cc1f1f] mt-0.5"
        />
        <span>
          สายเข้าหัวหางปลา / มีปลอกหุ้ม (Capping) มาแล้ว — ถอดออกไม่ได้
        </span>
      </label>

      {terminated && (
        <div className="mb-4 rounded border-l-4 border-amber-400 bg-amber-50 text-amber-900 px-4 py-3 text-[13px] leading-relaxed">
          <b>ถ้าเข้าหัวมาแล้ว ตัวที่ต้องลอดรู ZCT คือหางปลา ไม่ใช่ตัวสาย</b> — หางปลาและปลอกหุ้มกว้างกว่า
          ตัวนำเสมอ และบนสายแรงสูงหรือสายกระแสสูง มักตัดหัวออกมาย้ำใหม่หน้างานไม่ได้
          <br />
          ให้ <b>วัดความกว้างที่สุดของหางปลาพร้อมปลอก</b> แล้วกดปุ่ม “กรอก OD เอง” ใส่ค่านั้นแทน OD ของสาย
          เครื่องมือนี้ไม่เดาขนาดหางปลาให้ เพราะต่างกันมากตามยี่ห้อและขนาดที่ย้ำ
          <br />
          ค่าที่ติ๊กไว้นี้เพิ่มระยะเผื่อสำหรับการร้อยให้อีก {Math.round(TERMINATED_EXTRA_HEADROOM * 100)}%
          เพราะสายที่เข้าหัวแล้วแข็งและบิดหลบไม่ได้
        </div>
      )}

      {n >= 6 && (
        <div className="mb-4 rounded border-l-4 border-blue-300 bg-blue-50 text-blue-900 px-4 py-3 text-[13px] leading-relaxed">
          ℹ️ งานนี้ต้องร้อย <b>{n} เส้น</b> การร้อยไม่ได้ยากเท่ากันทุกเส้น — เส้นแรก ๆ เข้าง่าย แต่
          <b> 2–3 เส้นสุดท้ายแทบไม่มีที่ให้ขยับ</b> เครื่องมือจึงกันพื้นที่ว่างในรูไว้{" "}
          {Math.round(threadingHeadroom(n) * 100)}% สำหรับจำนวนเส้นระดับนี้ ถ้าเลือกรูที่พอดีเป๊ะตามตัวเลข
          มัดสาย มักจบด้วยการร้อยไม่เข้าหน้างาน
        </div>
      )}

      {/* 4 — visualization */}
      {valid && svg && (
        <div className="rounded-lg bg-gray-50 border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-1">
            <button
              type="button"
              onClick={() => setPreviewIdx(Math.max(0, shownIdx - 1))}
              disabled={shownIdx === 0}
              className="px-3 py-1.5 rounded border border-gray-300 text-ink text-sm font-bold disabled:opacity-30 hover:border-brand"
              aria-label="รูเล็กลง"
            >
              ◀
            </button>
            <div className="text-center">
              <div className="font-display font-extrabold text-lg text-ink">
                {zctModel(win)} <span className="text-gray-400 font-normal">·</span> รู ~Φ{win} มม.
                {shownIdx === recIdx && (
                  <span className="ml-2 align-middle text-[10px] font-display font-bold tracking-wider uppercase text-white bg-brand rounded px-1.5 py-0.5">
                    แนะนำ
                  </span>
                )}
              </div>
              <div className="text-[12px]" style={{ color: fitColor }}>{fitLabel}</div>
            </div>
            <button
              type="button"
              onClick={() => setPreviewIdx(Math.min(ZCT_WINDOWS.length - 1, shownIdx + 1))}
              disabled={shownIdx === ZCT_WINDOWS.length - 1}
              className="px-3 py-1.5 rounded border border-gray-300 text-ink text-sm font-bold disabled:opacity-30 hover:border-brand"
              aria-label="รูใหญ่ขึ้น"
            >
              ▶
            </button>
          </div>

          <svg viewBox={`0 0 ${svg.VB} ${svg.VB}`} className="w-full max-w-[380px] mx-auto block" role="img"
            aria-label={`ภาพจำลองรู ZCT Φ${win} มม. กับสาย ${n} เส้น`}>
            {/* ZCT body */}
            <circle cx={svg.c} cy={svg.c} r={svg.bodyR} fill="#e5e7eb" stroke="#9ca3af" strokeWidth="2" />
            <circle cx={svg.c} cy={svg.c} r={svg.winR} fill="#ffffff" stroke="#6b7280" strokeWidth="2" />
            {/* ideal (touching-circles) bundle, for comparison only */}
            <circle cx={svg.c} cy={svg.c} r={svg.idealR} fill="none" stroke="#9ca3af" strokeWidth="1" strokeDasharray="2 3" />
            {/* design bundle — ideal plus the workmanship allowance */}
            <circle cx={svg.c} cy={svg.c} r={svg.bundleR} fill="none" stroke={fitColor} strokeWidth="1.5" strokeDasharray="5 4" />
            {/* cables */}
            {svg.pos.map(([x, y], i) => (
              <g key={i}>
                <circle cx={x} cy={y} r={svg.cableR} fill="#d1d5db" stroke="#1e1e1e" strokeWidth="1.5" />
                <circle cx={x} cy={y} r={Math.max(svg.cableR * 0.55, 2)} fill="#b45309" opacity="0.75" />
              </g>
            ))}
            {/* labels */}
            <text x={svg.c} y={svg.c - svg.bodyR - 8} textAnchor="middle" fontSize="13" fontWeight="700" fill="#1e1e1e">
              ZCT รู Φ{win} มม.
            </text>
            <text x={svg.c} y={svg.c + svg.bundleR + 16} textAnchor="middle" fontSize="12" fill={fitColor} fontWeight="700">
              มัดสายที่ใช้ออกแบบ ≈ Φ{fmt(bundle)} มม. ({n} เส้น)
            </text>
            <text x={svg.c} y={svg.c + svg.bundleR + 30} textAnchor="middle" fontSize="10.5" fill="#6b7280">
              (อุดมคติ Φ{fmt(idealBundle)} มม. + เผื่อ {Math.round(slack * 100)}%)
            </text>
            {/* clearance tick (right side) */}
            {fit !== "over" && (
              <g stroke={fitColor} strokeWidth="1.5">
                <line x1={svg.c + svg.bundleR} y1={svg.c} x2={svg.c + svg.winR} y2={svg.c} />
                <line x1={svg.c + svg.bundleR} y1={svg.c - 4} x2={svg.c + svg.bundleR} y2={svg.c + 4} />
                <line x1={svg.c + svg.winR} y1={svg.c - 4} x2={svg.c + svg.winR} y2={svg.c + 4} />
                <text x={(svg.c + svg.bundleR + svg.c + svg.winR) / 2} y={svg.c - 8} textAnchor="middle" fontSize="11" fill={fitColor} stroke="none">
                  {fmt(gapMm)} มม.
                </text>
              </g>
            )}
          </svg>

          <p className="text-center text-[13px] text-gray-600 mt-1">
            {cableTxt} × {n} เส้น · OD ≈ {fmt(od)} มม./เส้น · ใช้ {fmt(fill * 100, 0)}% ของรู
            <span className="text-gray-400"> (เกณฑ์ ≤ {Math.round(maxFill * 100)}%)</span>
          </p>
        </div>
      )}
      {!valid && (
        <div className="rounded bg-gray-900 text-white px-5 py-4 text-center font-display font-extrabold">
          — กรอกค่า OD ให้ถูกต้อง
        </div>
      )}

      {/* caveat */}
      <div className="mt-4 rounded border-l-4 border-amber-300 bg-amber-50 text-amber-900 px-4 py-3 text-[13px] leading-relaxed">
        ⚠️ ขนาดรู WYZR เป็น <b>ค่าประมาณตามเลขรุ่น</b> และ OD สายอ้างอิงสเปก Thai Yazaki (ต่างยี่ห้อต่างกันเล็กน้อย)
        — ยืนยันกับ Datasheet/หน้างานก่อนสั่ง · สายดิน (PE) <b>ต้องไม่ลอดผ่าน</b> ZCT · สายทุกเส้นที่มีกระแสต้องลอดครบในทิศเดียวกัน
        <br />
        ค่าเผื่อหลวมและระยะกันที่ร้อยสายเป็น <b>ค่าจากประสบการณ์หน้างาน ไม่ใช่ค่าตามมาตรฐานฉบับใด</b> —
        ถ้าเป็นงานที่เข้าหัวหางปลามาแล้ว ให้ยึดความกว้างของหางปลาเป็นตัวตั้ง ไม่ใช่ OD ของสาย
      </div>

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
          📤 ให้ SAV ยืนยันรุ่น ZCT
        </a>
        <Link
          href="/products/WYZR-N/"
          className="border border-gray-300 text-ink font-display text-xs font-bold tracking-wider uppercase px-6 py-3 rounded-sm hover:border-brand hover:text-brand transition-colors"
        >
          ดู ZCT Woonyoung
        </Link>
      </div>
      <p className="mt-2 text-[11.5px] text-gray-400">
        กดปุ่มแล้วสรุป (การเดินสาย · สาย · จำนวนเส้น · รุ่นที่คาดว่าเหมาะ) จะถูกคัดลอกอัตโนมัติ — วางใน LINE ได้เลย
      </p>
    </div>
  );
}

function multicoreMatchesWiring(cores: CoreCount, wiring: WiringId): boolean {
  if (wiring === "1p") return cores === 2;
  if (wiring === "3p3w" || wiring === "stardelta") return cores === 3;
  return cores === 4;
}
