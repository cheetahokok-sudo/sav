// Cable overall-diameter (OD) reference data, mm — transcribed from Thai Yazaki
// official specification sheets (thaiyazaki-electricwire.co.th, downloaded 2026-07-25):
//   THW  : TYSS 5200 S-R3 (60227 IEC 01 THW) + TYSS 5801 S-R1 (YK 60227 IEC 01 THW)
//          — "overall diameter average" MAX values (conservative for hole sizing)
//   CV   : TYSS 6004 S-R4 (FD-0.6/1KV-CV) + TYSS 5803 S-R2 (YK 0.6/1KV-CV)
//          — "overall diameter approx."
//   NYY  : TYSS 6083 S-R2 (0.6/1KV-NYY) — "overall diameter approx."
//   VCT  : TYSS 6081 S-R2 (0.6/1KV-VCT) — "overall diameter approx." (1C/2C only in spec)
// Values differ slightly by manufacturer — the UI must say "โดยประมาณ" and offer manual OD.
// No value below is guessed; sizes absent from the spec sheets are simply omitted.

export type CableTypeId = "THW" | "CV" | "NYY" | "VCT" | "MANUAL";
export type CoreCount = 1 | 2 | 3 | 4;

// od[coreCount][size_mm2] = overall diameter (mm)
type OdTable = Partial<Record<CoreCount, Record<number, number>>>;

export const CABLE_TYPES: {
  id: CableTypeId;
  label: string;
  desc: string;
  cores: CoreCount[]; // constructions available in the verified data
  od: OdTable;
}[] = [
  {
    id: "THW",
    label: "THW (IEC 01)",
    desc: "สายเดี่ยว PVC 450/750V เดินในท่อ",
    cores: [1],
    od: {
      1: {
        1.5: 3.2, 2.5: 3.9, 4: 4.4, 6: 5.2, 10: 6.7, 16: 7.8, 25: 9.7, 35: 10.9,
        50: 12.8, 70: 14.6, 95: 17.1, 120: 18.8, 150: 20.9, 185: 23.3, 240: 26.6,
        300: 29.6, 400: 33.2,
      },
    },
  },
  {
    id: "CV",
    label: "CV (XLPE 0.6/1kV)",
    desc: "สายกำลังโรงงาน ฉนวน XLPE",
    cores: [1, 2, 3, 4],
    od: {
      1: {
        1.5: 6.5, 2.5: 7.0, 4: 7.5, 6: 8.1, 10: 9.0, 16: 9.7, 25: 11.0, 35: 12.0,
        50: 13.5, 70: 15.5, 95: 17.5, 120: 19.5, 150: 21, 185: 24, 240: 26,
        300: 29.0, 400: 32.5, 500: 36.5,
      },
      2: {
        1.5: 11.5, 10: 16.0, 16: 18.0, 25: 21, 35: 23, 50: 26, 70: 30, 95: 34.0,
        120: 37.5, 150: 41.5, 185: 46.0, 240: 52.0, 300: 57.0, 400: 63.5,
      },
      3: {
        1.5: 12.0, 2.5: 13.0, 4: 14.5, 6: 15.5, 10: 17.0, 16: 19.0, 25: 23, 35: 25,
        50: 28, 70: 33, 95: 36.0, 120: 40.0, 150: 44.5, 185: 49.5, 240: 55.5,
        300: 61.0, 400: 69.0,
      },
      4: {
        1.5: 12.5, 4: 15.5, 6: 17.0, 10: 19.0, 16: 21, 25: 25, 35: 27, 50: 31,
        70: 36, 95: 40.0, 120: 44.5, 150: 49.0, 185: 55.0, 240: 62.0, 300: 68.5,
        400: 76.5,
      },
    },
  },
  {
    id: "NYY",
    label: "NYY (0.6/1kV)",
    desc: "สายกำลัง PVC ฝังดิน/รางสาย",
    cores: [1, 2, 3, 4],
    od: {
      1: {
        10: 9.4, 16: 10.5, 25: 12.0, 35: 13.5, 50: 15.0, 70: 17.0, 95: 20, 120: 22,
        150: 24, 185: 26, 240: 29, 300: 32, 400: 36,
      },
      2: {
        1.5: 13.5, 2.5: 14.0, 4: 16.0, 6: 18.0, 10: 19.5, 16: 21, 25: 25, 35: 27,
        50: 31, 70: 35, 95: 40, 120: 44, 150: 48, 185: 54, 240: 61, 300: 67, 400: 75,
      },
      3: {
        1.5: 14.0, 2.5: 14.5, 4: 16.5, 6: 18.5, 10: 20, 16: 22, 25: 26, 35: 29,
        50: 33, 70: 37, 95: 43, 120: 47, 150: 51, 185: 57, 240: 65, 300: 71, 400: 80,
      },
      4: {
        1.5: 14.5, 2.5: 15.5, 4: 18.0, 6: 20, 10: 22, 16: 24, 25: 28, 35: 32,
        50: 36, 70: 41, 95: 48, 120: 52, 150: 57, 185: 64, 240: 72, 300: 80, 400: 89,
      },
    },
  },
  {
    id: "VCT",
    label: "VCT (0.6/1kV อ่อน)",
    desc: "สายอ่อนต่อเครื่องจักร",
    cores: [1, 2],
    od: {
      1: {
        10: 11.0, 16: 12.0, 25: 14.0, 35: 16.0, 50: 18.0, 70: 20.5, 95: 23.0,
        120: 25.5, 150: 27.5, 185: 30.0, 240: 34.0,
      },
      2: {
        1.5: 11.0, 2.5: 12.5, 4: 14.5, 6: 16.5, 10: 19.0, 16: 21.5, 25: 25.5,
        35: 28.5, 50: 33.5, 70: 37.5, 95: 43.0, 120: 48.0, 150: 53.0, 185: 57.5,
        240: 65.0, 300: 71.5, 400: 90.0,
      },
    },
  },
];

export function cableType(id: CableTypeId) {
  return CABLE_TYPES.find((t) => t.id === id);
}

export function sizesFor(id: CableTypeId, cores: CoreCount): number[] {
  const table = cableType(id)?.od[cores];
  return table ? Object.keys(table).map(Number).sort((a, b) => a - b) : [];
}

export function odFor(id: CableTypeId, cores: CoreCount, size: number): number | undefined {
  return cableType(id)?.od[cores]?.[size];
}

// Minimal enclosing-circle ratio D/d for n equal circles (established circle-packing
// results — exact/known constants, not estimates).
export const PACK_K: Record<number, number> = {
  1: 1, 2: 2, 3: 2.1547, 4: 2.4142, 6: 3.0, 8: 3.3048, 12: 4.0296,
};

// ---------------------------------------------------------------------------
// Bundle slack.
//
// PACK_K above is the mathematical optimum: every cable perfectly straight,
// perfectly parallel, each one touching its neighbours with zero gap. No cable
// pulled through a ZCT window on site is any of those things. Conductors keep
// a bend radius from the drum, stiff large-section cable resists being dressed
// flat, lugged tails splay, and nobody compresses a bundle to its theoretical
// minimum while threading it through a core.
//
// So the ideal figure is a floor, not a working number. Each cable's diameter
// is inflated by this factor before the bundle is computed — an allowance per
// conductor, which is how the looseness actually accumulates.
//
// This is a workmanship allowance, not a published figure from any standard.
// It is offered as a choice rather than baked in because the honest answer
// depends on the cable and the panel, and the user can see what it costs them.
// ---------------------------------------------------------------------------
export const SLACK_OPTIONS: { value: number; label: string; desc: string }[] = [
  { value: 0.1, label: "10%", desc: "สายอ่อน จัดเรียงเรียบร้อย รัดมัดแน่น" },
  { value: 0.15, label: "15%", desc: "งานทั่วไป — ค่าที่แนะนำ" },
  { value: 0.2, label: "20%", desc: "สายใหญ่/แข็ง ดัดยาก หรือพื้นที่คับ" },
];
export const DEFAULT_SLACK = 0.15;

// ---------------------------------------------------------------------------
// Threading headroom — the fraction of the window that must stay empty.
//
// Separate from slack, and for a separate reason. Slack says the finished
// bundle is bigger than the ideal. This says the bundle has to be BUILT inside
// the window, one conductor at a time, and threading is not symmetric: the
// first cable goes in freely, and the last two or three have nowhere left to
// move. On a six-conductor star-delta run that final pair is what decides
// whether the ZCT goes on at all — a window that the finished bundle would sit
// in quite happily can still be impossible to actually thread.
//
// Judgment values from installation practice, not from any published standard.
// Sized so a six-conductor run is given noticeably more room than a three.
// ---------------------------------------------------------------------------
export function threadingHeadroom(n: number): number {
  if (n >= 6) return 0.3; // last 2–3 of six have no room to manoeuvre
  if (n >= 4) return 0.25;
  return 0.2;
}

// Extra headroom when the cables arrive with lugs already crimped on.
//
// The lug palm and the capping over it are wider than the conductor, so on a
// pre-terminated run the widest thing passing through the core is not the
// cable at all. On HV and high-current cable the lug usually cannot simply be
// cut off and redone on site, so the ZCT has to clear it. The calculator
// cannot know the lug size — that is why it asks the user to measure it rather
// than inventing a multiplier — but a terminated run is harder to thread even
// once the right diameter is used, and this covers that part.
export const TERMINATED_EXTRA_HEADROOM = 0.05;

// Positions of n equal circles (unit = cable radius) inside their minimal enclosing
// circle — offsets of each cable center from the bundle center, in cable radii.
export function packPositions(n: number): [number, number][] {
  const ring = (count: number, dist: number, startDeg = -90): [number, number][] =>
    Array.from({ length: count }, (_, i) => {
      const a = ((startDeg + (360 / count) * i) * Math.PI) / 180;
      return [dist * Math.cos(a), dist * Math.sin(a)] as [number, number];
    });
  switch (n) {
    case 1: return [[0, 0]];
    case 2: return [[-1, 0], [1, 0]];
    case 3: return ring(3, 2 / Math.sqrt(3));
    case 4: return ring(4, Math.SQRT2, -45);
    case 6: return [[0, 0], ...ring(5, 2)];
    case 8: return [[0, 0], ...ring(7, 2.3048)];
    case 12: return [...ring(3, 2 / Math.sqrt(3)), ...ring(9, 3.0296, -70)];
    default: return ring(n, 2);
  }
}

// Woonyoung WYZR round-ZCT nominal window diameters (mm) — model number tracks the
// nominal window size; exact usable dimensions must be confirmed with the datasheet.
export const ZCT_WINDOWS = [30, 50, 65, 80, 100, 120, 150, 200];
export const zctModel = (w: number) => `WYZR-${String(w).padStart(3, "0")}N`;
