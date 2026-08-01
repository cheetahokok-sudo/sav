import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const DIR = path.join(process.cwd(), "content", "knowledge");

export type Ref = { name: string; detail?: string; url?: string };
export type Faq = { q: string; a: string };
export type ProductLink = { model?: string; href?: string; label: string };

export type ArticleMeta = {
  slug: string;
  title: string; // Thai title + EN keyword (root layout adds the "| SAV…" suffix)
  description: string;
  cluster: ClusterId;
  summary: string; // 40–80 word answer summary (Featured-snippet / AI ready)
  updated: string; // ISO date
  basis: string; // authority line — the standard(s)/source the article rests on (full citations at the bottom)
  keywords?: string[];
  faq?: Faq[];
  references?: Ref[];
  products?: ProductLink[];
  pillar?: boolean;
  order?: number;
  hero?: string;
};

export type ClusterId =
  | "motor-protection"
  | "installation"
  | "zct-ground-fault"
  | "motor-current"
  | "cable-protection"
  | "standards"
  | "power-monitoring"
  | "procurement"
  | "troubleshooting"
  | "tools";

export const CLUSTERS: Record<ClusterId, { label: string; blurb: string }> = {
  "motor-protection": {
    label: "การป้องกันมอเตอร์ · EOCR",
    blurb: "เลือก ตั้งค่า และแก้ปัญหารีเลย์ป้องกันมอเตอร์",
  },
  installation: {
    label: "ติดตั้ง & สตาร์ทมอเตอร์",
    blurb: "ต่อสาย ตั้งค่า EOCR/ZCT ครั้งแรก และเลือกวิธีสตาร์ทมอเตอร์ให้ถูกตั้งแต่วันแรก",
  },
  "zct-ground-fault": {
    label: "ZCT & Ground Fault",
    blurb: "การตรวจจับไฟรั่วและการเลือก ZCT ในโรงงาน",
  },
  "motor-current": {
    label: "คำนวณกระแสมอเตอร์",
    blurb: "สูตร ตาราง และเครื่องคำนวณกระแสมอเตอร์",
  },
  "cable-protection": {
    label: "สายไฟ & อุปกรณ์ป้องกันวงจร",
    blurb: "เลือกขนาดสาย แรงดันตก การประสานการป้องกัน และการเลือก CT/ZCT",
  },
  standards: {
    label: "มาตรฐานไฟฟ้าไทย",
    blurb: "วสท. มอก. MEA/PEA และ IEC — ใครกำหนดอะไร ต้องอ้างตัวไหนเมื่อไร",
  },
  "power-monitoring": {
    label: "Power Monitoring",
    blurb: "วัดและเฝ้าดูพลังงานไฟฟ้า มิเตอร์ดิจิทัล และรีเลย์ที่มีมิเตอร์ในตัว",
  },
  procurement: {
    label: "การจัดซื้อ & เทียบรุ่น",
    blurb: "เทียบรุ่น เปลี่ยนรุ่นที่เลิกผลิต และข้อมูลที่ต้องส่งเพื่อขอใบเสนอราคา",
  },
  troubleshooting: {
    label: "วิเคราะห์อาการ Trip",
    blurb: "หาสาเหตุที่มอเตอร์และ EOCR ทริป พร้อมวิธีตรวจและแก้",
  },
  tools: { label: "เครื่องมือคำนวณ", blurb: "" },
};

// Anchor-id from heading text (keeps Thai letters; used by both the <h2>
// renderer and the TOC builder so anchors always match).
export function headingId(text: string): string {
  return text
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\p{L}\p{N}-]/gu, "")
    .toLowerCase();
}

export function tocFromBody(body: string): { id: string; label: string }[] {
  const out: { id: string; label: string }[] = [];
  const re = /^##\s+(.+?)\s*$/gm;
  let m: RegExpExecArray | null;
  while ((m = re.exec(body))) out.push({ id: headingId(m[1]), label: m[1] });
  return out;
}

export function articleSlugs(): string[] {
  if (!fs.existsSync(DIR)) return [];
  return fs
    .readdirSync(DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""));
}

export function getArticle(slug: string): { meta: ArticleMeta; body: string } {
  const raw = fs.readFileSync(path.join(DIR, `${slug}.mdx`), "utf-8");
  const { content, data } = matter(raw);
  return { meta: { slug, ...(data as Omit<ArticleMeta, "slug">) }, body: content };
}

export function allArticles(): ArticleMeta[] {
  return articleSlugs()
    .map((slug) => getArticle(slug).meta)
    .sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
}
