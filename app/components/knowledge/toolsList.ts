// Single source of truth for the free calculator tools — rendered on both the
// /learn/ hub tools grid and the landing-page promo section.
export const TOOLS = [
  {
    href: "/learn/motor-current-calculator/",
    icon: "🧮",
    title: "คำนวณกระแสมอเตอร์ 1 / 3 เฟส",
    desc: "kW/HP, แรงดัน, PF, η → กระแสโดยประมาณ + แนวทางเลือก EOCR",
  },
  {
    href: "/learn/eocr-current-range-calculator/",
    icon: "🎯",
    title: "เลือกช่วงกระแส EOCR",
    desc: "กระแสมอเตอร์ → ช่วง EOCR-SSD / EUCR ที่ครอบคลุมและตั้งค่าได้พอดี",
  },
  {
    href: "/learn/voltage-drop-calculator/",
    icon: "📉",
    title: "คำนวณแรงดันตกในสายไฟ",
    desc: "กระแส, ระยะ, mV/A/m → แรงดันตก (V/%) เทียบเกณฑ์ วสท. 5%",
  },
  {
    href: "/learn/ct-ratio-calculator/",
    icon: "🔁",
    title: "เลือก CT Ratio",
    desc: "กระแสโหลด (หรือ kVA) → CT ratio มาตรฐานที่ให้โหลดอยู่ 60–80%",
  },
  {
    href: "/learn/zct-window-calculator/",
    icon: "⭕",
    title: "เลือกขนาดรู ZCT จาก Cable OD",
    desc: "เลือกการเดินสาย + สเปกสาย → เห็นภาพจำลองสายในรู ZCT ตามสเกล",
  },
  {
    href: "/learn/kw-kva-amp-calculator/",
    icon: "⚡",
    title: "แปลง kW ↔ kVA ↔ Amp",
    desc: "แปลงกำลังไฟฟ้า 1/3 เฟส จากแรงดันและ PF พร้อมกระแสโดยประมาณ",
  },
  {
    href: "/learn/star-delta-current-calculator/",
    icon: "🔀",
    title: "คำนวณกระแสสตาร์-เดลต้า",
    desc: "กระแส Line vs กิ่งเดลต้า (×0.58) และค่าตั้ง EOCR ทั้งสองตำแหน่ง CT",
  },
];
