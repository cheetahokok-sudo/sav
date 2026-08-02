// ============================================================================
// SINGLE SOURCE OF TRUTH for how model numbers group into series.
//
// Extracted from app/products/page.tsx so the client-side catalog filter, the
// server-rendered catalog, the /products/series/<slug>/ category pages and the
// sitemap all bucket a part the same way. Adding a second copy of these regexes
// anywhere is how a product ends up in one place and not the other.
// ============================================================================

/**
 * Group cryptic model numbers into series a buyer recognizes, so the filter
 * dropdown reads like the catalog instead of like part-number soup.
 */
export function seriesOf(model: string): string {
  const m = model.toUpperCase();
  // EOCR-? so the legacy dashed spellings ("EOCR-SS2") group with the rest.
  if (/^EOCR-?(SS|SSD|SE2)/.test(m)) return "EOCR-SS / SE2";
  // EOCR-?3 so the legacy "EOCR-3E420" spelling lands here too, not in Other.
  if (/^(EOCR-?3|3DM2|3MZ2|FMZ2|FDM2)/.test(m)) return "EOCR-3D / 3E";
  if (/^EOCR(PFZ|PMZ)/.test(m)) return "EOCR-PFZ / PMZ";
  if (/^EOCR(FDE|FEZ)/.test(m)) return "EOCR-FDE / FEZ";
  if (/^EUCR/.test(m)) return "EUCR (Under Current)";
  if (/^U?DOUCR/.test(m)) return "DOUCR (Over & Under Current)";
  if (/^I3/.test(m)) return "EOCR-i3 (Digital)";
  if (/^IF/.test(m)) return "EOCR-iF (Ground Fault)";
  if (/^ISEM/.test(m)) return "iSEM (Communication)";
  if (/^(EOCR-?)?SDDR/.test(m)) return "SDDR (Auto Restart)";
  if (/^DSP-VIP/.test(m)) return "DSP-VIP Series";
  if (/^DSP/.test(m)) return "Samwha DSP";
  if (/^WYZ/.test(m)) return "Woonyoung ZCT";
  // Deesys family stems — checked after DSP so "DSP-…" can never fall in here.
  if (/^DGF(-|$)/.test(m)) return "Deesys GFR (Ground Fault Relay)";
  if (/^(DR|DS)(-|$)/.test(m)) return "Deesys CT";
  // High-voltage ZCT kept in its own bucket so a 6.6 kV part can never be
  // mistaken for the 600 V class ZCTs sitting next to it.
  if (/^(HZR|HZS)(-|$)/.test(m)) return "Deesys ZCT (High Voltage)";
  if (/^(DZR|DZS|SZR|ZR)(-|$)/.test(m)) return "Deesys ZCT";
  return "Other";
}

// Series pinned above the alphabetical groups — SAV's core stock, which
// buyers come looking for first. Order here is the order on the page.
export const PINNED_SERIES = ["EOCR-SS / SE2", "EUCR (Under Current)"];

export function seriesRank(series: string): number {
  const i = PINNED_SERIES.indexOf(series);
  return i === -1 ? PINNED_SERIES.length : i;
}

// Inside the pinned EOCR bucket, lead with SS then SSD; SE2 follows.
// (SSD is tested first because /^EOCRSS/ would also match it.)
export function modelRank(model: string): number {
  if (/^EOCRSSD/.test(model)) return 1;
  if (/^EOCRSS/.test(model)) return 0;
  if (/^EOCRSE2/.test(model)) return 2;
  return 3;
}

// ---------------------------------------------------------------------------
// Category pages
// ---------------------------------------------------------------------------

/**
 * A category page is NOT one-per-series. Some series are a single part, and a
 * page listing one product is a thin page that will not rank and dilutes the
 * ones that would. Categories therefore gather related series buckets under
 * the heading a buyer would actually search for — every category below holds
 * at least four products.
 *
 * Slugs are permanent URLs. Rename a `title` freely; never a `slug`.
 */
export type Category = {
  slug: string;
  /** Heading and <title> stem. */
  title: string;
  /** One-line summary under the H1, and the meta description stem. */
  lede: string;
  /** Two or three sentences of genuinely category-specific Thai prose. */
  intro: string[];
  /** seriesOf() values gathered onto this page. */
  series: string[];
  /** Knowledge Center slugs worth reading alongside — real internal links. */
  articles: string[];
};

export const CATEGORIES: Category[] = [
  {
    slug: "eocr-ss-se2",
    title: "EOCR-SS / SSD / SE2 — Overload Relay แบบอนาล็อก",
    lede: "รีเลย์ป้องกันมอเตอร์อิเล็กทรอนิกส์แบบตั้งค่าด้วยลูกบิด รุ่นที่ขายดีที่สุดของ EOCR",
    intro: [
      "EOCR-SS คือรุ่นพื้นฐานที่โรงงานไทยใช้ทดแทนโอเวอร์โหลดรีเลย์แบบความร้อน (Thermal Overload) มากที่สุด ป้องกันกระแสเกิน ขาดเฟส และมอเตอร์ค้าง (Locked Rotor) โดยมี CT ในตัว ไม่ต้องต่อ CT ภายนอกเมื่อใช้ในช่วงกระแสที่กำหนด",
      "ตั้งค่าด้วยลูกบิดบนหน้าปัด ไม่มีหน้าจอดิจิทัล จึงติดตั้งและส่งมอบงานได้เร็ว เหมาะกับตู้ควบคุมที่ต้องการความเรียบง่ายและความทนทานมากกว่าการเก็บข้อมูล",
      "รุ่น SSD เพิ่มฟังก์ชันเทียบกับ SS ส่วน SE2 เป็นรุ่นที่ปรับปรุงใหม่กว่า หากกำลังหาของทดแทนรุ่นที่เลิกผลิต ให้เทียบช่วงกระแสและแรงดันคอยล์ก่อนเสมอ",
    ],
    series: ["EOCR-SS / SE2"],
    articles: [
      "how-to-select-eocr",
      "overload-relay-vs-motor-protection-relay",
      "eocr-first-time-setup",
    ],
  },
  {
    slug: "eocr-3d-3e",
    title: "EOCR-3D / 3E — Overload Relay 3 ฟังก์ชัน",
    lede: "รีเลย์ป้องกันมอเตอร์ตระกูล 3D/3E พร้อมการป้องกันกระแสไม่สมดุลและไฟรั่วลงดิน",
    intro: [
      "ตระกูล 3D/3E ขยายจากการป้องกันโหลดเกินพื้นฐานไปสู่การตรวจจับกระแสไม่สมดุล (Current Unbalance) และในบางรุ่นรวมถึงไฟรั่วลงดิน (Ground Fault) ซึ่งเป็นสองสาเหตุที่ทำให้ขดลวดมอเตอร์เสียหายโดยที่กระแสรวมยังไม่เกินพิกัด",
      "เหมาะกับมอเตอร์ที่มีค่าซ่อมสูงหรือหยุดสายการผลิตไม่ได้ เพราะจับอาการผิดปกติได้ก่อนที่โอเวอร์โหลดรีเลย์ธรรมดาจะทำงาน",
      "รุ่นที่ลงท้ายด้วย 420 รองรับสัญญาณ 4–20 mA สำหรับส่งค่ากระแสเข้าระบบควบคุม",
    ],
    series: ["EOCR-3D / 3E"],
    articles: [
      "overload-vs-phase-loss-trip",
      "ground-fault-trip-causes",
      "why-motor-eocr-trips",
    ],
  },
  {
    slug: "eocr-i3-digital",
    title: "EOCR-i3 — Digital Motor Protection Relay",
    lede: "รีเลย์ป้องกันมอเตอร์ดิจิทัลพร้อมหน้าจอ แสดงกระแสจริงและสาเหตุการทริป",
    intro: [
      "ซีรีส์ i3 เป็นรุ่นดิจิทัลที่มีหน้าจอแสดงกระแสจริงและบันทึกสาเหตุการทริป (Trip Cause) ซึ่งย่นเวลาไล่ปัญหาหน้างานอย่างมาก — ช่างเห็นทันทีว่าทริปเพราะโหลดเกิน ขาดเฟส หรือไฟรั่วลงดิน แทนที่จะต้องเดา",
      "ตั้งค่าเป็นตัวเลขได้ละเอียดกว่าการหมุนลูกบิด จึงตั้งใกล้กระแสใช้งานจริงได้โดยไม่เสี่ยงทริปหลอก และรุ่นที่มีพอร์ตสื่อสารส่งค่าขึ้นระบบ SCADA ได้",
      "รหัสรุ่นบอกช่วงกระแส แรงดันควบคุม และรูปแบบเอาต์พุต หากไม่แน่ใจว่ารหัสไหนตรงกับงาน ให้ส่งพิกัดบน Nameplate มาให้ทีมวิศวกรรมช่วยเทียบ",
    ],
    series: ["EOCR-i3 (Digital)"],
    articles: [
      "what-is-motor-protection-relay",
      "motor-relay-with-metering",
      "eocr-series-comparison",
    ],
  },
  {
    slug: "eocr-if-ground-fault",
    title: "EOCR-iF — Ground Fault Relay ดิจิทัล",
    lede: "รีเลย์ป้องกันไฟรั่วลงดินสำหรับมอเตอร์ ใช้คู่กับ ZCT",
    intro: [
      "ซีรีส์ iF เน้นการป้องกันไฟรั่วลงดิน (Ground Fault) ซึ่งเป็นอาการที่มาจากฉนวนเสื่อมหรือความชื้น และมักเกิดก่อนที่มอเตอร์จะไหม้จริง การตรวจจับได้เร็วจึงเป็นการป้องกันทั้งมอเตอร์และคนที่เข้าไปทำงาน",
      "รุ่นในกลุ่มนี้ทำงานร่วมกับ ZCT (Zero-phase Current Transformer) ที่ต้องเลือกขนาดรูให้สายเคเบิลทั้งชุดร้อยผ่านได้พอดี ขนาดรูผิดคือสาเหตุอันดับต้น ๆ ที่ระบบตรวจไฟรั่วทำงานผิดพลาด",
      "หลายรุ่นรวมการป้องกันโหลดเกินและขาดเฟสไว้ในตัวเดียวกัน จึงใช้แทนการติดตั้งรีเลย์สองตัวได้",
    ],
    series: ["EOCR-iF (Ground Fault)"],
    articles: [
      "ground-fault-trip-causes",
      "what-is-zct",
      "zct-installation-guide",
      "how-to-select-zct",
    ],
  },
  {
    slug: "eocr-phase-voltage",
    title: "EOCR-PFZ / PMZ / FDE / FEZ — ป้องกันเฟสและแรงดัน",
    lede: "รีเลย์ตรวจลำดับเฟส เฟสหาย แรงดันผิดปกติ และไฟรั่วลงดินเฉพาะทาง",
    intro: [
      "กลุ่มนี้ป้องกันปัญหาที่มาจากระบบไฟ ไม่ใช่จากตัวมอเตอร์ — ลำดับเฟสสลับ เฟสหาย แรงดันตกหรือเกิน ซึ่งทำให้มอเตอร์กินกระแสสูงผิดปกติหรือหมุนกลับทาง",
      "มักติดตั้งที่ต้นทางของตู้ควบคุมเพื่อป้องกันมอเตอร์ทุกตัวในตู้พร้อมกัน แทนที่จะป้องกันทีละตัว",
      "ใช้ร่วมกับ EOCR ที่ป้องกันโหลดเกินได้ โดยแบ่งหน้าที่กันชัดเจนระหว่างปัญหาฝั่งไฟเข้าและปัญหาฝั่งโหลด",
    ],
    series: ["EOCR-PFZ / PMZ", "EOCR-FDE / FEZ"],
    articles: [
      "overload-vs-phase-loss-trip",
      "why-motor-eocr-trips",
      "circuit-protection-coordination",
    ],
  },
  {
    slug: "eucr-under-current",
    title: "EUCR / DOUCR — Under Current Relay",
    lede: "รีเลย์ป้องกันกระแสต่ำ สำหรับปั๊มเดินแห้ง สายพานหลุด และใบพัดหัก",
    intro: [
      "EUCR ตรวจจับกระแส 'ต่ำเกินไป' ไม่ใช่สูงเกินไป ซึ่งเป็นสัญญาณว่ามอเตอร์หมุนอยู่แต่ไม่ได้ทำงาน — ปั๊มเดินแห้งเพราะน้ำหมด สายพานหลุด ใบพัดหัก หรือเพลาขาด อาการเหล่านี้โอเวอร์โหลดรีเลย์ธรรมดาจับไม่ได้เลยเพราะกระแสไม่เกินพิกัด",
      "ใช้มากกับปั๊มน้ำ พัดลม และคอมเพรสเซอร์ ที่ความเสียหายเกิดจากการเดินตัวเปล่ามากกว่าการเดินหนัก",
      "DOUCR รวมการป้องกันทั้งกระแสเกินและกระแสต่ำไว้ในตัวเดียว เหมาะกับงานที่ต้องคุมทั้งสองด้าน",
    ],
    series: ["EUCR (Under Current)", "DOUCR (Over & Under Current)"],
    articles: ["why-motor-eocr-trips", "how-to-select-eocr", "motor-protection"],
  },
  {
    slug: "isem-communication",
    title: "iSEM — Motor Protection พร้อมระบบสื่อสาร",
    lede: "รีเลย์ป้องกันมอเตอร์ที่ส่งค่าขึ้นระบบควบคุมผ่าน RS-485 / Modbus",
    intro: [
      "iSEM ออกแบบมาสำหรับโรงงานที่ต้องการเห็นสถานะมอเตอร์จากห้องควบคุม ไม่ใช่จากหน้าตู้ ส่งค่ากระแส สถานะ และสาเหตุการทริปขึ้นระบบ SCADA หรือ PLC ผ่านพอร์ตสื่อสาร",
      "ประโยชน์จริงคือการซ่อมบำรุงเชิงป้องกัน — เห็นแนวโน้มกระแสค่อย ๆ สูงขึ้นก่อนที่แบริ่งจะพัง แทนที่จะรู้ตอนที่มอเตอร์หยุดแล้ว",
      "ต้องกำหนด Address และพารามิเตอร์การสื่อสารให้ตรงกับระบบเดิม จึงควรระบุโปรโตคอลที่ใช้มาพร้อมกับการขอราคา",
    ],
    series: ["iSEM (Communication)"],
    articles: [
      "motor-relay-with-metering",
      "power-monitoring-guide",
      "what-is-motor-protection-relay",
    ],
  },
  {
    slug: "samwha-dsp",
    title: "Samwha DSP — Digital Panel Meter และ Transducer",
    lede: "มิเตอร์วัดไฟฟ้าดิจิทัลติดหน้าตู้ และตัวแปลงสัญญาณจากเกาหลี",
    intro: [
      "Samwha DSP เป็นกลุ่มมิเตอร์และทรานสดิวเซอร์สำหรับติดหน้าตู้ควบคุม วัดกระแส แรงดัน กำลังไฟฟ้า และค่าตัวประกอบกำลัง (Power Factor) แสดงผลเป็นตัวเลขแทนเข็ม",
      "รุ่นทรานสดิวเซอร์แปลงค่าที่วัดได้เป็นสัญญาณ 4–20 mA หรือ RS-485 เพื่อส่งเข้าระบบควบคุม ใช้คู่กับ CT ที่ต้องเลือกอัตราส่วนให้ตรงกับพิกัดของโหลด",
      "รหัสรุ่นระบุสิ่งที่วัด รูปแบบเอาต์พุต และแรงดันที่ใช้เลี้ยงวงจร ควรระบุทั้งสามอย่างเมื่อขอราคา",
    ],
    series: ["Samwha DSP"],
    articles: [
      "what-is-digital-power-meter",
      "how-to-select-power-meter",
      "why-monitor-power-factor",
      "what-is-ct-and-ct-ratio",
    ],
  },
  {
    slug: "dsp-vip",
    title: "Samwha DSP-VIP — Multi-function Power Meter",
    lede: "มิเตอร์รวมหลายค่าในตัวเดียว วัดกระแส แรงดัน และกำลังไฟฟ้าพร้อมกัน",
    intro: [
      "DSP-VIP คือรุ่นรวมฟังก์ชัน — วัดกระแส (I) แรงดัน (V) และกำลังไฟฟ้า (P) ในเครื่องเดียว แทนที่จะติดมิเตอร์แยกสามตัวบนหน้าตู้ ประหยัดทั้งพื้นที่หน้าตู้และการเดินสาย",
      "รุ่นที่มี RTM หรือ CM ในรหัสรองรับการอ่านค่าระยะไกลและการสื่อสารเข้าระบบ ทำให้ใช้เป็นจุดเก็บข้อมูลพลังงานของแต่ละตู้ได้",
      "การเลือกต้องดูทั้งระบบไฟ (1 เฟส หรือ 3 เฟส) อัตราส่วน CT และแรงดันที่วัด ถ้าส่งรูปหน้าตู้เดิมมาให้ ทีมวิศวกรรมช่วยเทียบรุ่นให้ได้",
    ],
    series: ["DSP-VIP Series"],
    articles: [
      "how-to-select-power-meter",
      "what-is-digital-power-meter",
      "power-monitoring-guide",
      "what-is-ct-and-ct-ratio",
    ],
  },
  {
    slug: "zct-ct",
    title: "ZCT และ CT — หม้อแปลงกระแสสำหรับป้องกันและวัดค่า",
    lede: "Zero-phase CT สำหรับตรวจไฟรั่วลงดิน และ CT สำหรับวัดกระแส",
    intro: [
      "ZCT (Zero-phase Current Transformer) คือหม้อแปลงกระแสที่ร้อยสายทั้งสามเฟส (และนิวทรัลถ้ามี) ผ่านรูเดียวกัน เมื่อระบบปกติผลรวมกระแสเป็นศูนย์ ถ้ามีไฟรั่วลงดินผลรวมจะไม่เป็นศูนย์และรีเลย์จะตรวจจับได้",
      "สิ่งที่ต้องเลือกให้ถูกคือขนาดรู ต้องใหญ่พอให้สายทั้งชุดร้อยผ่านได้โดยไม่บีบ และต้องร้อยครบทุกเส้น — ลืมร้อยนิวทรัลหรือร้อยสายกราวด์เข้าไปด้วยคือสาเหตุที่พบบ่อยที่สุดของการทริปหลอก",
      "CT ทั่วไปในกลุ่มนี้ใช้สำหรับวัดกระแสเข้ามิเตอร์หรือรีเลย์ ต้องเลือกอัตราส่วน (CT Ratio) ให้ตรงกับพิกัดของโหลดและกับค่าที่ตั้งไว้ในอุปกรณ์ปลายทาง",
      "รุ่นแรงดันสูง (High Voltage) แยกไว้ต่างหาก ห้ามใช้สลับกับรุ่นแรงดันต่ำ",
    ],
    series: [
      "Woonyoung ZCT",
      "Deesys ZCT",
      "Deesys ZCT (High Voltage)",
      "Deesys CT",
    ],
    articles: [
      "what-is-zct",
      "how-to-select-zct",
      "zct-installation-guide",
      "what-is-ct-and-ct-ratio",
    ],
  },
];

const CATEGORY_BY_SERIES = new Map<string, Category>();
for (const c of CATEGORIES) {
  for (const s of c.series) CATEGORY_BY_SERIES.set(s, c);
}

/** The category page a model belongs on, or null if it only lives on /products/. */
export function categoryOf(model: string): Category | null {
  return CATEGORY_BY_SERIES.get(seriesOf(model)) ?? null;
}

export function categoryBySlug(slug: string): Category | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}
