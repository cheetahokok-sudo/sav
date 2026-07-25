import Link from "next/link";
import MobileNav from "./components/MobileNav";
import ContactBar from "./components/ContactBar";
import QuoteForm from "./components/QuoteForm";
import { COMPANY, messagingLink } from "./lib/company";
import { TOOLS } from "./components/knowledge/toolsList";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || "";

const navLinks = [
  { href: "/products/", label: "PRODUCTS" },
  { href: "/learn/", label: "LEARN" },
  { href: "#eocr", label: "EOCR SERIES" },
  { href: "#solutions", label: "SOLUTIONS" },
  { href: "#why", label: "ABOUT US" },
  { href: "#how-to-order", label: "HOW TO ORDER" },
  { href: "#contact", label: "CONTACT" },
];

// Market segments SAV serves. Photos live in public/images/solutions/ — real
// stock imagery illustrating each segment (not claims about specific clients).
const solutions = [
  { icon: "🏭", name: "FACTORY AUTOMATION", sub: "ระบบอัตโนมัติในโรงงาน", image: "/images/solutions/sav_factory_automation_400x300.jpg" },
  { icon: "⚡", name: "ENERGY & POWER", sub: "ระบบพลังงานและไฟฟ้า", image: "/images/solutions/sav_energy_and_power_400x300.jpg" },
  { icon: "🏙️", name: "INFRASTRUCTURE", sub: "ระบบสาธารณูปโภคและอาคาร", image: "/images/solutions/sav_infrastructure_400x300.jpg" },
  { icon: "🔩", name: "OEM & MACHINE BUILDER", sub: "ผู้ผลิตเครื่องจักรและระบบ (OEM)", image: "/images/solutions/sav_oem_and_machine_builder_400x300.jpg" },
];

// Category cards: EOCR first and featured (it's the business), each linked to
// a prefiltered catalog search so the click actually goes somewhere useful.
const productCategories = [
  {
    icon: "⚡",
    name: "EOCR OVERLOAD RELAY",
    sub: "รีเลย์ป้องกันมอเตอร์ดิจิทัล",
    query: "EOCR",
    featured: true,
    stock: "in" as const,
  },
  {
    icon: "🔌",
    name: "EUCR UNDER CURRENT",
    sub: "ป้องกัน Dry Running ปั๊มน้ำ",
    query: "EUCR",
    featured: false,
    stock: "in" as const,
  },
  {
    icon: "📟",
    name: "EOCR-i3 DIGITAL",
    sub: "จอแสดงผล + สื่อสาร Modbus",
    query: "I3M",
    featured: false,
    stock: "in" as const,
  },
  {
    icon: "🛡️",
    name: "EOCR-iF GROUND FAULT",
    sub: "ป้องกันกระแสรั่วลงดิน",
    query: "IFM",
    featured: false,
    stock: "in" as const,
  },
  {
    icon: "📊",
    name: "DSP PANEL METER",
    sub: "มิเตอร์วัดค่าพร้อม Display",
    query: "DSP",
    featured: false,
    stock: "ask" as const,
  },
  {
    icon: "🔩",
    name: "ACCESSORIES & CT",
    sub: "อุปกรณ์เสริมและ External CT",
    query: "",
    featured: false,
    stock: "ask" as const,
  },
];

const eocrProducts = [
  {
    tag: "Samwha EOCR · Best Seller",
    name: "EOCR-SS Series",
    query: "EOCRSS",
    stock: "in" as const,
    desc: "รีเลย์ป้องกัน Overcurrent แบบ Digital ขนาดกะทัดรัด รองรับ AC/DC (Free Voltage) ในตัวเดียว",
    specs: [
      ["กระแส (FLA)", "0.5–60A (3 รุ่น)"],
      ["ไฟเลี้ยง", "24~240VAC/DC"],
      ["ผลิต", "🇰🇷 Made in Korea"],
    ],
    features: [
      "Overcurrent + Phase Loss + Locked Rotor",
      "Free Voltage — AC/DC ในตัวเดียว",
      "ทดแทน Schneider TeSys / thermal relay เดิมได้ทันที",
    ],
  },
  {
    tag: "Samwha EOCR · Advanced",
    name: "EOCR-3DE / 3EZ",
    query: "EOCR3",
    stock: "in" as const,
    desc: "รุ่น Advanced ป้องกันครบทุกความผิดปกติ รองรับ External CT สำหรับมอเตอร์กำลังสูง",
    specs: [
      ["กระแส", "0.2–70A + Ext.CT"],
      ["Ext. CT", "สูงสุด 1200A"],
      ["Inverter", "20–400Hz"],
    ],
    features: [
      "Over/Under Current, Phase Loss, Reverse Phase",
      "Ground Fault + Shock + Unbalance",
      "ติดตั้งได้ทั้ง Terminal และ Hole type",
    ],
  },
  {
    tag: "Samwha EOCR · Digital",
    name: "EOCR-i3 / iF Series",
    query: "I3M",
    stock: "in" as const,
    desc: "รุ่นจอดิจิทัล แสดงกระแสจริง Real-time พร้อมรุ่น iF ป้องกันกระแสรั่วลงดิน (Ground Fault)",
    specs: [
      ["Display", "Digital LED"],
      ["สื่อสาร", "รุ่น 420 / Modbus"],
    ],
    features: [
      "แสดงกระแสจริง + บันทึก Trip Log",
      "iF: Earth Leakage / Ground Fault ในตัว",
      "ติดตั้งแทนรุ่นอนาล็อกเดิมได้",
    ],
  },
  {
    tag: "Samwha EOCR",
    name: "EUCR Series",
    query: "EUCR",
    stock: "in" as const,
    desc: "Under Current Relay สำหรับระบบปั๊มน้ำ ตรวจจับ Dry Running และโหลดต่ำผิดปกติ",
    specs: [
      ["กระแส", "0.5–60A (3 รุ่น)"],
      ["ไฟเลี้ยง", "24~240VAC/DC"],
    ],
    features: ["Under Current Protection", "เหมาะสำหรับปั๊มน้ำ Dry Running"],
  },
];

// Brands: only claim what's provable. Samwha is the direct-import
// relationship; the rest are brands SAV can source on request — labelled
// exactly that, so no buyer ever asks for a distributor certificate we
// can't produce.
const sourcingBrands = ["Deesys", "WYES", "CTE TECH", "J&D", "VITZRO"];

const orderSteps = [
  {
    num: "1",
    title: "ขอใบเสนอราคา",
    desc: "เลือกรุ่นจากหน้าสินค้า แล้วส่งทาง LINE / WhatsApp / อีเมล — แจ้งรุ่น จำนวน และขนาดมอเตอร์",
  },
  {
    num: "2",
    title: "ยืนยันราคาและสต็อก",
    desc: "ทีมงานตอบกลับพร้อมราคา สถานะสต็อก และกำหนดส่ง ภายในวันทำการ",
  },
  {
    num: "3",
    title: "ชำระเงิน + ใบกำกับภาษี",
    desc: "โอนผ่านบัญชีบริษัท ออกใบกำกับภาษีเต็มรูปทุกรายการ (หจก. จดทะเบียน VAT)",
  },
  {
    num: "4",
    title: "จัดส่งทั่วประเทศ",
    desc: "สินค้าที่มีสต็อกส่งได้ทันที ขนส่งเอกชนถึงหน้างานทั่วไทย รองรับ International Orders",
  },
];

const whyItems = [
  {
    title: "สินค้าแท้ 100% — Original Samwha Korea",
    desc: "นำเข้าโดยตรงจาก Samwha EOCR Ltd. และ Samwha DSP เกาหลี ผ่านกระบวนการตรวจสอบคุณภาพทุกชิ้น",
  },
  {
    title: "สต็อกพร้อมส่งทันที ไม่ต้องรอนำเข้า",
    desc: "รุ่นยอดนิยม (EOCR-SS, EUCR, i3) มีสต็อกในไทยพร้อมส่งทันที — ดูสถานะสต็อกได้ที่หน้าสินค้าทุกรุ่น",
  },
  {
    title: "ทีมเทคนิคให้คำปรึกษาการเลือกรุ่นฟรี",
    desc: "ผู้เชี่ยวชาญช่วยเลือกรุ่นที่เหมาะกับระบบ ตั้งค่า และแก้ปัญหาการใช้งาน — บอกรุ่นรีเลย์เดิม เราหารุ่นทดแทนให้",
  },
  {
    title: "รองรับทั้งในประเทศและ International Orders",
    desc: `Mr. Cheetah รองรับ International Orders โดยตรง ติดต่อ ${COMPANY.intlPhoneDisplay} (LINE & WhatsApp)`,
  },
];

const stockBadge = {
  in: (
    <span className="inline-flex items-center gap-1 font-display text-[10px] font-bold bg-green-50 text-green-700 rounded px-2 py-0.5">
      ● พร้อมส่ง
    </span>
  ),
  ask: (
    <span className="inline-flex items-center gap-1 font-display text-[10px] font-bold bg-gray-100 text-gray-500 rounded px-2 py-0.5">
      สอบถามสต็อก
    </span>
  ),
};

// Real logo image. `dark` variant swaps in the light-text version for the
// footer. 2x-resolution PNG so it stays sharp on retina screens.
function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <Link href="/" className="flex items-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`${BASE}${dark ? "/sav-logo-footer.png" : "/sav-logo.png"}`}
        alt="SAV Mechanical Services & Supplies"
        className="h-10 w-auto"
      />
    </Link>
  );
}

export default function Home() {
  const consultLine = messagingLink(
    "สวัสดีครับ ต้องการคำแนะนำเลือกรุ่น EOCR ครับ"
  );

  return (
    <main>
      {/* TOPBAR — contact channels visible from the very first pixel */}
      <div className="bg-ink flex justify-between items-center gap-3 px-6 py-1.5 text-xs text-gray-400 font-display">
        <div className="hidden sm:flex items-center gap-4">
          <a href={COMPANY.intlPhoneHref} className="hover:text-white transition-colors">
            📞 {COMPANY.intlPhoneDisplay}
          </a>
          <span className="text-gray-600">LINE &amp; WhatsApp เบอร์เดียวกัน</span>
          <span className="hidden md:inline text-gray-600">{COMPANY.hoursTh}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-white">TH</span>
          <span className="text-gray-700">|</span>
          <Link href="#" className="hover:text-white transition-colors">
            EN
          </Link>
        </div>
      </div>

      {/* NAV */}
      <nav className="sticky top-0 z-50 bg-white shadow-md flex items-center justify-between px-6 h-16 relative">
        <Logo />
        <ul className="hidden lg:flex items-center font-display text-xs font-semibold tracking-wider uppercase">
          {navLinks.map((l) => {
            const linkClass =
              "px-4 h-16 flex items-center text-gray-700 border-b-[3px] border-transparent hover:text-brand hover:border-brand transition-colors";
            return (
              <li key={l.href}>
                {l.href.startsWith("/") ? (
                  <Link href={l.href} className={linkClass}>
                    {l.label}
                  </Link>
                ) : (
                  <a href={l.href} className={linkClass}>
                    {l.label}
                  </a>
                )}
              </li>
            );
          })}
          <li>
            <Link
              href="/products/"
              className="ml-2 px-5 h-16 flex items-center bg-brand text-white font-bold hover:bg-brand-dark transition-colors"
            >
              REQUEST QUOTATION
            </Link>
          </li>
        </ul>
        <MobileNav navLinks={navLinks} />
      </nav>

      {/* HERO — Thai-first, EOCR-first. The keyword buyers actually search
          ("EOCR", "รีเลย์ป้องกันมอเตอร์") now leads the H1. */}
      <div className="relative bg-ink overflow-hidden">
        {/* TODO: replace with a REAL photo — stocked shelves / packed EOCR
            boxes / a panel install. Real beats stock imagery for B2B trust. */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20 grayscale-[70%]"
          style={{
            backgroundImage: `url('${BASE}/images/solutions/sav_factory_automation_400x300.jpg')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black via-neutral-900/80 to-neutral-800/60" />
        <div className="relative z-10 flex flex-col lg:flex-row items-center gap-10 px-6 lg:px-16 py-14 lg:py-20 max-w-7xl mx-auto">
          <div className="flex-1 max-w-xl">
            <p className="font-display text-xs font-bold tracking-[0.2em] uppercase text-brand mb-5">
              ตัวแทนนำเข้าตรง · Schneider Electric EOCR · Samwha DSP
            </p>
            <h1 className="font-extrabold text-white text-3xl sm:text-[2.6rem] leading-[1.25] mb-3">
              EOCR รีเลย์ป้องกันมอเตอร์
              <br />
              สต็อกในไทย พร้อมส่งทันที
            </h1>
            <p className="font-display font-semibold text-white/80 text-base mb-4">
              EOCR motor protection relays — direct import from Korea, in-stock
              in Thailand
            </p>
            <p className="text-white/60 text-sm leading-relaxed mb-3 max-w-md">
              ทดแทน Thermal Overload Relay และ Schneider TeSys เดิมได้ทันที —
              บอกรุ่นเดิมของคุณ ทีมวิศวกรหารุ่น EOCR ทดแทนให้ฟรี
            </p>
            <p className="font-display text-[11px] text-white/40 tracking-wide mb-8">
              จดทะเบียน พ.ศ. {COMPANY.registeredYearBE} ({COMPANY.registeredYearAD}) ·
              Tax ID {COMPANY.taxId}
            </p>
            <div className="flex flex-wrap gap-3 font-display text-sm font-bold tracking-wider uppercase">
              <Link
                href="/products/"
                className="inline-flex items-center gap-2 bg-brand text-white px-7 py-3 hover:bg-brand-dark transition-colors"
              >
                ดูสินค้าทั้งหมด →
              </Link>
              <a
                href={consultLine}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 border border-white/30 text-white px-7 py-3 hover:border-white hover:bg-white/5 transition-colors"
              >
                💬 ปรึกษาวิศวกรทาง LINE
              </a>
              <Link
                href="/learn/"
                className="inline-flex items-center gap-2 border border-white/30 text-white px-7 py-3 hover:border-white hover:bg-white/5 transition-colors"
              >
                🧮 เครื่องมือคำนวณฟรี
              </Link>
            </div>
          </div>

          {/* Contact rail — one number that answers every channel */}
          <div className="hidden lg:flex flex-col gap-3 bg-black/45 border border-white/10 rounded p-5 min-w-[200px] backdrop-blur-sm">
            <a
              href={COMPANY.intlPhoneHref}
              className="flex items-center gap-3 px-3 py-2.5 rounded bg-white/5 hover:bg-brand/20 transition-colors"
            >
              <span className="w-8 h-8 bg-brand rounded-full flex items-center justify-center text-sm flex-shrink-0">
                📞
              </span>
              <span className="font-display">
                <span className="block text-[10px] font-bold tracking-wider uppercase text-white/50">
                  Call · LINE · WhatsApp
                </span>
                <span className="block text-sm font-bold text-white">
                  {COMPANY.intlPhoneDisplay}
                </span>
              </span>
            </a>
            <a
              href={COMPANY.officePhoneHref}
              className="flex items-center gap-3 px-3 py-2.5 rounded bg-white/5 hover:bg-brand/20 transition-colors"
            >
              <span className="w-8 h-8 bg-brand rounded-full flex items-center justify-center text-sm flex-shrink-0">
                🏢
              </span>
              <span className="font-display">
                <span className="block text-[10px] font-bold tracking-wider uppercase text-white/50">
                  Office
                </span>
                <span className="block text-sm font-bold text-white">
                  {COMPANY.officePhoneDisplay}
                </span>
              </span>
            </a>
            <a
              href={`mailto:${COMPANY.email}`}
              className="flex items-center gap-3 px-3 py-2.5 rounded bg-white/5 hover:bg-brand/20 transition-colors"
            >
              <span className="w-8 h-8 bg-brand rounded-full flex items-center justify-center text-sm flex-shrink-0">
                ✉️
              </span>
              <span className="font-display">
                <span className="block text-[10px] font-bold tracking-wider uppercase text-white/50">
                  Email Us
                </span>
                <span className="block text-sm font-bold text-white">{COMPANY.email}</span>
              </span>
            </a>
          </div>
        </div>
      </div>

      {/* TRUST STRIP — every claim here is verifiable, no vague slogans */}
      <div className="bg-neutral-800 grid grid-cols-2 lg:grid-cols-4">
        {[
          ["🇰🇷", "นำเข้าตรงจากเกาหลี", "Samwha EOCR Ltd. / Samwha DSP"],
          ["📦", "สต็อกในไทย พร้อมส่ง", "รุ่นยอดนิยมส่งได้ทันที ทั่วประเทศ"],
          ["🧾", "ใบกำกับภาษีเต็มรูป", `หจก. จดทะเบียน · Tax ID ${COMPANY.taxId}`],
          ["🔧", "วิศวกรช่วยเลือกรุ่นฟรี", "โทร / LINE / WhatsApp เบอร์เดียว"],
        ].map(([icon, title, sub]) => (
          <div
            key={title}
            className="flex items-center gap-4 px-5 py-6 border-r border-white/5 last:border-r-0"
          >
            <div className="w-10 h-10 flex-shrink-0 border border-white/15 rounded-full flex items-center justify-center text-lg">
              {icon}
            </div>
            <div>
              <p className="font-display text-sm font-bold text-white">{title}</p>
              <p className="text-xs text-gray-400">{sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* FREE TOOLS — engineers' hook right after the hero: 5 free calculators
          that route into /learn/ and ultimately into product pages. */}
      <section id="tools" className="bg-gray-50 py-16 px-6 border-b border-gray-200">
        <p className="text-center font-display text-[11px] font-extrabold tracking-[0.2em] uppercase text-brand mb-2">
          FREE ENGINEERING TOOLS
        </p>
        <h2 className="text-center font-display font-extrabold text-3xl lg:text-4xl text-ink">
          เครื่องมือคำนวณฟรี สำหรับวิศวกร
        </h2>
        <div className="w-10 h-[3px] bg-brand rounded mx-auto mt-4 mb-10" />
        <div className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-5 gap-4">
          {TOOLS.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className="block rounded-lg border border-gray-200 border-t-[3px] border-t-brand bg-white p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all"
            >
              <div className="text-2xl mb-2">{t.icon}</div>
              <h3 className="font-display font-extrabold text-[15px] text-ink leading-snug mb-1">
                {t.title}
              </h3>
              <p className="text-[12.5px] text-gray-600 leading-relaxed">{t.desc}</p>
            </Link>
          ))}
        </div>
        <p className="text-center text-[14px] text-gray-600 mt-8">
          ใช้ฟรี ไม่ต้องลงทะเบียน · ดูบทความและคู่มือทั้งหมดที่{" "}
          <Link href="/learn/" className="text-brand font-semibold hover:underline">
            คลังความรู้วิศวกรรมไฟฟ้า →
          </Link>
        </p>
      </section>

      {/* BRANDS — placed BEFORE the product categories so buyers recognize
          the official brands first. Both are direct-import relationships. */}
      <section className="bg-white py-16 px-6">
        <p className="text-center font-display text-[11px] font-extrabold tracking-[0.2em] uppercase text-brand mb-2">
          OUR BRANDS
        </p>
        <h2 className="text-center font-display font-extrabold text-3xl sm:text-4xl text-ink mb-4">
          แบรนด์ที่เราจัดจำหน่าย
        </h2>
        <div className="w-10 h-[3px] bg-brand rounded mx-auto mb-10" />

        <div className="max-w-4xl mx-auto">
          <div className="border-[1.5px] border-brand rounded p-6 sm:p-8 mb-8">
            <p className="text-center font-display text-[10px] font-extrabold tracking-widest uppercase text-brand mb-6">
              Direct Import · ตัวแทนนำเข้าโดยตรง
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-14 mb-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${BASE}/images/brands/schneider-eocr.png`}
                alt="Schneider Electric EOCR"
                className="h-14 sm:h-16 w-auto"
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${BASE}/images/brands/samwha-dsp.png`}
                alt="Samwha DSP Ltd."
                className="h-12 sm:h-14 w-auto"
              />
            </div>
            <p className="text-center text-sm text-gray-600 leading-relaxed mb-6 max-w-xl mx-auto">
              นำเข้าตรงจากประเทศเกาหลี — สินค้าแท้ 100% จากโรงงาน
              รับประกัน 1 ปีทุกชิ้น พร้อมเอกสารกำกับสินค้า
            </p>
            <div className="text-center">
              <Link
                href="/products/"
                className="inline-block bg-brand text-white font-display text-xs font-bold tracking-wider uppercase px-7 py-3 hover:bg-brand-dark transition-colors"
              >
                ดูสินค้าทั้งหมด →
              </Link>
            </div>
          </div>

          <p className="text-center font-display text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-4">
            แบรนด์อื่น ๆ จัดหาให้ได้ตามสั่ง — Sourcing on request
          </p>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-3">
            {sourcingBrands.map((b) => (
              <span
                key={b}
                className="font-display font-bold text-sm text-gray-400"
              >
                {b}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* PRODUCT CATEGORIES — EOCR first + stock badges + real links */}
      <section id="products" className="bg-white py-20 px-6">
        <p className="text-center font-display text-[11px] font-extrabold tracking-[0.2em] uppercase text-brand mb-2">
          OUR PRODUCTS
        </p>
        <h2 className="text-center font-display font-extrabold text-3xl sm:text-4xl text-ink mb-4">
          หมวดสินค้า EOCR
        </h2>
        <div className="w-10 h-[3px] bg-brand rounded mx-auto mb-12" />

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5 max-w-6xl mx-auto mb-10">
          {productCategories.map((c) => (
            <Link
              href={c.query ? `/products/?q=${c.query}` : "/products/"}
              key={c.name}
              className={`group bg-white border rounded p-5 text-center hover:shadow-lg hover:-translate-y-0.5 transition-all ${
                c.featured
                  ? "border-brand border-[1.5px]"
                  : "border-gray-200 hover:border-brand"
              }`}
            >
              {c.featured && (
                <p className="font-display text-[9px] font-extrabold tracking-widest uppercase text-brand mb-1">
                  Best Seller
                </p>
              )}
              <div className="w-16 h-14 mx-auto mb-3 bg-gray-50 rounded flex items-center justify-center text-3xl">
                {c.icon}
              </div>
              <p className="font-display text-xs font-bold text-ink leading-tight mb-1">
                {c.name}
              </p>
              <p className="text-[11px] text-gray-500 leading-snug mb-2">{c.sub}</p>
              <div className="mb-2">{stockBadge[c.stock]}</div>
              <span className="inline-flex w-6 h-6 border-[1.5px] border-brand rounded-full items-center justify-center text-brand text-[10px] group-hover:bg-brand group-hover:text-white transition-colors">
                →
              </span>
            </Link>
          ))}
        </div>

        <div className="text-center">
          <Link
            href="/products/"
            className="inline-flex items-center gap-2 border-[1.5px] border-brand text-brand font-display text-xs font-bold tracking-wider uppercase px-7 py-2.5 hover:bg-brand hover:text-white transition-colors"
          >
            ดูสินค้าทั้งหมด →
          </Link>
        </div>
      </section>

      {/* EOCR SERIES DETAIL */}
      <section id="eocr" className="bg-gray-100 py-20 px-6">
        <p className="text-center font-display text-[11px] font-extrabold tracking-[0.2em] uppercase text-brand mb-2">
          SAMWHA EOCR &amp; DSP
        </p>
        <h2 className="text-center font-display font-extrabold text-3xl sm:text-4xl text-ink mb-4">
          ซีรีส์ที่จำหน่าย
        </h2>
        <div className="w-10 h-[3px] bg-brand rounded mx-auto mb-4" />
        <p className="text-center text-gray-600 max-w-xl mx-auto mb-12 leading-relaxed">
          อุปกรณ์ป้องกันมอเตอร์ Digital คุณภาพสูงจากเกาหลี —
          ออกแบบมาเพื่อแทนที่รีเลย์ Thermal แบบเดิม
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
          {eocrProducts.map((p, i) => (
            <div
              key={p.name}
              className={`bg-white border border-gray-200 border-t-[3px] rounded p-7 flex flex-col hover:shadow-lg hover:-translate-y-0.5 transition-all ${
                i === 0 ? "border-t-brand" : "border-t-gray-300 hover:border-t-brand"
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <p className="font-display text-[10px] font-extrabold tracking-widest uppercase text-brand">
                  {p.tag}
                </p>
                {stockBadge[p.stock]}
              </div>
              <h3 className="font-display font-extrabold text-2xl text-ink mb-2.5 leading-none">
                {p.name}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-5">{p.desc}</p>
              <div className="border-t border-gray-100 pt-4 mb-4">
                {p.specs.map(([k, v]) => (
                  <div
                    key={k}
                    className="flex justify-between text-xs py-1.5 border-b border-gray-100 last:border-b-0"
                  >
                    <span className="text-gray-500">{k}</span>
                    <span className="font-display font-semibold text-ink">{v}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-1.5 mb-5">
                {p.features.map((f) => (
                  <p key={f} className="text-xs text-gray-700 flex gap-2">
                    <span className="text-brand text-[8px] mt-1 flex-shrink-0">▶</span>
                    {f}
                  </p>
                ))}
              </div>
              <Link
                href={`/products/?q=${p.query}`}
                className="mt-auto text-center border border-gray-300 text-ink font-display text-xs font-bold tracking-wider uppercase py-2.5 rounded-sm hover:border-brand hover:text-brand transition-colors"
              >
                ดูรุ่นทั้งหมด + ขอราคา →
              </Link>
            </div>
          ))}

          {/* Not sure card */}
          <div className="border-2 border-dashed border-gray-300 rounded p-7 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 bg-brand rounded-full flex items-center justify-center text-white text-xl mb-4">
              ?
            </div>
            <h3 className="font-display font-extrabold text-lg text-ink mb-2">
              มีรีเลย์เดิมอยู่แล้ว?
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-5">
              ส่งรูปหรือรุ่นรีเลย์เดิม (Schneider TeSys, Thermal ฯลฯ) มาทาง LINE —
              ทีมงานหารุ่น EOCR ทดแทนให้ฟรี
            </p>
            <a
              href={messagingLink(
                "สวัสดีครับ ต้องการหารุ่น EOCR ทดแทนรีเลย์เดิม รุ่นเดิมคือ: "
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="border-[1.5px] border-brand text-brand font-display text-xs font-bold tracking-wider uppercase px-5 py-2 hover:bg-brand hover:text-white transition-colors"
            >
              💬 ส่งรุ่นเดิมทาง LINE →
            </a>
          </div>
        </div>
      </section>

      {/* INDUSTRY SOLUTIONS — market segments SAV serves. Illustrative stock
          photos per segment; no claims about specific clients. */}
      <section id="solutions" className="bg-white py-20 px-6">
        <h2 className="text-center font-display font-extrabold text-3xl sm:text-4xl text-ink mb-4">
          INDUSTRY SOLUTIONS
        </h2>
        <div className="w-10 h-[3px] bg-brand rounded mx-auto mb-12" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto">
          {solutions.map((s) => (
            <div
              key={s.name}
              className="relative aspect-[4/3] rounded overflow-hidden bg-neutral-900 group"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${BASE}${s.image}`}
                alt={s.name}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/10" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <div className="w-9 h-9 bg-brand rounded-full flex items-center justify-center text-sm mb-2">
                  {s.icon}
                </div>
                <p className="font-display font-bold text-white text-sm uppercase tracking-wide">
                  {s.name}
                </p>
                <p className="text-xs text-white/65">{s.sub}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link
            href="/products/"
            className="inline-flex items-center gap-2 border border-brand text-brand font-display text-xs font-bold tracking-wider uppercase px-6 py-3 hover:bg-brand hover:text-white transition-colors"
          >
            VIEW ALL SOLUTIONS →
          </Link>
        </div>
      </section>

      {/* LATEST PROJECT — example installation (real motor-protection panel
          photo). Stats shown per the owner's request; swap for figures from a
          named/consented job when available. */}
      <section id="applications" className="bg-gray-100 py-20 px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          <div>
            <p className="font-display text-[11px] font-extrabold tracking-[0.2em] uppercase text-brand mb-2">
              LATEST PROJECT
            </p>
            <h3 className="font-display font-extrabold text-2xl text-ink mb-4 leading-snug">
              ติดตั้งระบบป้องกันมอเตอร์ด้วย Smart Motor Protection Relay
              <br />
              โรงงานอุตสาหกรรมแห่งหนึ่ง
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-6">
              ออกแบบและติดตั้งระบบป้องกันมอเตอร์ครบวงจรด้วย Smart Motor Protection Relay
              ป้องกันความเสียหายจากโหลดเกิน กระแสไม่สมดุล และกราวด์ฟอลต์
              ช่วยลดการหยุดเดินเครื่องและยืดอายุการใช้งานมอเตอร์
            </p>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 border border-brand text-brand font-display text-xs font-bold tracking-wider uppercase px-6 py-2.5 hover:bg-brand hover:text-white transition-colors"
            >
              VIEW CASE STUDY →
            </a>
          </div>
          <div className="grid grid-cols-[1fr_0.62fr] bg-neutral-900 rounded overflow-hidden min-h-[240px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${BASE}/images/projects/sav_motor_protection_panel.jpg`}
              alt="ตู้ควบคุมและระบบป้องกันมอเตอร์ Smart Motor Protection Relay"
              className="w-full h-full object-cover"
            />
            <div className="flex flex-col gap-5 justify-center p-6 bg-ink">
              {[
                ["ENERGY SAVING", "18%", "ลดการใช้พลังงาน"],
                ["SYSTEM UPTIME", "99.9%", "ความเสถียรของระบบ"],
                ["TRIP PROTECTION", "24/7", "ตัดวงจรทันทีเมื่อผิดปกติ"],
              ].map(([label, num, unit]) => (
                <div key={label}>
                  <p className="font-display text-[9px] font-bold tracking-wider uppercase text-brand">
                    {label}
                  </p>
                  <p className="font-display font-extrabold text-2xl text-white">{num}</p>
                  <p className="text-xs text-gray-400">{unit}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* HOW TO ORDER — answers the questions Thai B2B buyers actually ask
          before ordering: quote channel, VAT invoice (ใบกำกับภาษี), payment,
          delivery. */}
      <section id="how-to-order" className="bg-gray-100 py-20 px-6">
        <p className="text-center font-display text-[11px] font-extrabold tracking-[0.2em] uppercase text-brand mb-2">
          HOW TO ORDER
        </p>
        <h2 className="text-center font-display font-extrabold text-3xl sm:text-4xl text-ink mb-4">
          ขั้นตอนการสั่งซื้อ
        </h2>
        <div className="w-10 h-[3px] bg-brand rounded mx-auto mb-12" />

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto">
          {orderSteps.map((s) => (
            <div
              key={s.num}
              className="bg-white border border-gray-200 rounded p-6 relative"
            >
              <span className="absolute -top-4 left-6 w-8 h-8 bg-brand text-white font-display font-extrabold rounded-full flex items-center justify-center text-sm">
                {s.num}
              </span>
              <p className="font-display font-bold text-sm text-ink mt-3 mb-2">
                {s.title}
              </p>
              <p className="text-sm text-gray-600 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA BANNER — ink background; exactly ONE red CTA in view */}
      <div className="bg-ink px-6 py-8 flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <span className="text-3xl text-white/60">💡</span>
          <div>
            <p className="font-display font-bold text-white text-lg">
              ไม่แน่ใจว่าใช้รุ่นไหน?
            </p>
            <p className="text-sm text-white/60">
              ส่งรุ่นรีเลย์เดิมหรือขนาดมอเตอร์มา — วิศวกรตอบกลับภายในวันทำการ
            </p>
          </div>
        </div>
        <div className="flex gap-3 font-display text-xs font-bold tracking-wider uppercase">
          <a
            href={consultLine}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-brand text-white px-6 py-3 hover:bg-brand-dark transition-colors"
          >
            💬 ปรึกษาทาง LINE
          </a>
          <a
            href={COMPANY.intlPhoneHref}
            className="border border-white/50 text-white px-6 py-3 hover:bg-white/10 hover:border-white transition-colors"
          >
            📞 {COMPANY.intlPhoneDisplay}
          </a>
        </div>
      </div>

      {/* WHY SAV */}
      <section id="why" className="bg-white py-20 px-6">
        <p className="text-center font-display text-[11px] font-extrabold tracking-[0.2em] uppercase text-brand mb-2">
          WHY CHOOSE SAV
        </p>
        <h2 className="text-center font-display font-extrabold text-3xl sm:text-4xl text-ink mb-4">
          ทำไมต้องเลือก SAV
        </h2>
        <div className="w-10 h-[3px] bg-brand rounded mx-auto mb-12" />

        <div className="grid lg:grid-cols-2 gap-12 max-w-5xl mx-auto items-start">
          <div className="flex flex-col">
            {whyItems.map((item, i) => (
              <div
                key={item.title}
                className={`flex gap-5 py-6 border-b border-gray-200 ${
                  i === 0 ? "border-t" : ""
                } hover:pl-1 transition-[padding]`}
              >
                <span className="font-display font-extrabold text-4xl text-gray-200 w-12 text-right flex-shrink-0">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <p className="font-display font-bold text-sm text-ink mb-1">
                    {item.title}
                  </p>
                  <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Quick contact panel */}
          <div className="bg-neutral-900 rounded overflow-hidden">
            <div className="bg-brand px-7 py-6">
              <h3 className="font-display font-extrabold text-xl text-white">
                ติดต่อด่วน
              </h3>
              <p className="text-xs text-white/70 mt-1">
                Ready to assist — โทร LINE WhatsApp เบอร์เดียวกัน
              </p>
            </div>
            <div className="p-7 flex flex-col gap-4">
              <div className="flex gap-3.5 items-start">
                <span className="w-9 h-9 flex-shrink-0 bg-white/5 rounded flex items-center justify-center text-sm">
                  🌏
                </span>
                <div>
                  <p className="font-display text-[10px] font-bold tracking-wider uppercase text-gray-500">
                    Mr. Cheetah — Call · LINE · WhatsApp
                  </p>
                  <a
                    href={COMPANY.intlPhoneHref}
                    className="font-display font-semibold text-white hover:text-brand"
                  >
                    {COMPANY.intlPhoneDisplay}
                  </a>
                  <p className="text-xs text-gray-500 mt-0.5">
                    รองรับ International Orders
                  </p>
                </div>
              </div>
              <div className="flex gap-3.5 items-start">
                <span className="w-9 h-9 flex-shrink-0 bg-white/5 rounded flex items-center justify-center text-sm">
                  📞
                </span>
                <div>
                  <p className="font-display text-[10px] font-bold tracking-wider uppercase text-gray-500">
                    สำนักงาน
                  </p>
                  <p className="font-display font-semibold text-white">
                    <a href={COMPANY.officePhoneHref} className="hover:text-brand">
                      {COMPANY.officePhoneDisplay}
                    </a>{" "}
                    ·{" "}
                    <a href={COMPANY.mobilePhoneHref} className="hover:text-brand">
                      {COMPANY.mobilePhoneDisplay}
                    </a>
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">Fax: {COMPANY.fax}</p>
                </div>
              </div>
              <div className="flex gap-3.5 items-start">
                <span className="w-9 h-9 flex-shrink-0 bg-white/5 rounded flex items-center justify-center text-sm">
                  📍
                </span>
                <div>
                  <p className="font-display text-[10px] font-bold tracking-wider uppercase text-gray-500">
                    ที่อยู่
                  </p>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    {COMPANY.addressLines[0]}
                    <br />
                    {COMPANY.addressLines[1]}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Tax ID: {COMPANY.taxId}
                  </p>
                </div>
              </div>
            </div>
            <div className="px-7 pb-7 flex gap-3">
              <a
                href={consultLine}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-brand text-white font-display text-xs font-bold tracking-wider uppercase px-5 py-2.5 hover:bg-brand-dark transition-colors"
              >
                💬 LINE →
              </a>
              <a
                href="#contact"
                className="border border-white/30 text-white font-display text-xs font-bold tracking-wider uppercase px-5 py-2.5 hover:border-white hover:bg-white/5 transition-colors"
              >
                ส่งข้อความ
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="bg-gray-100 py-20 px-6">
        <p className="text-center font-display text-[11px] font-extrabold tracking-[0.2em] uppercase text-brand mb-2">
          CONTACT US
        </p>
        <h2 className="text-center font-display font-extrabold text-3xl sm:text-4xl text-ink mb-4">
          ติดต่อ / ขอใบเสนอราคา
        </h2>
        <div className="w-10 h-[3px] bg-brand rounded mx-auto mb-4" />
        <p className="text-center text-gray-600 max-w-xl mx-auto mb-12 leading-relaxed">
          ระบุรุ่นสินค้า ขนาดมอเตอร์ และจำนวน — ทีมงานจะตอบกลับพร้อมราคาโดยเร็วที่สุด
        </p>

        <div className="grid lg:grid-cols-2 gap-10 max-w-5xl mx-auto">
          <QuoteForm />

          <div className="flex flex-col gap-6">
            <div className="bg-white border border-gray-200 border-t-[3px] border-t-brand rounded p-7">
              <h3 className="font-display font-extrabold text-base text-ink mb-5 pb-3 border-b border-gray-200">
                Contact Information
              </h3>
              <div className="flex flex-col gap-4">
                <div className="flex gap-3 items-start">
                  <span className="w-9 h-9 flex-shrink-0 bg-red-50 text-brand rounded flex items-center justify-center text-sm">
                    📍
                  </span>
                  <div>
                    <p className="font-display text-[10px] font-bold tracking-wider uppercase text-gray-500">
                      ที่อยู่
                    </p>
                    <p className="font-display font-semibold text-sm text-ink leading-relaxed">
                      {COMPANY.addressLines[0]}
                      <br />
                      {COMPANY.addressLines[1]}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 items-start">
                  <span className="w-9 h-9 flex-shrink-0 bg-red-50 text-brand rounded flex items-center justify-center text-sm">
                    🌏
                  </span>
                  <div>
                    <p className="font-display text-[10px] font-bold tracking-wider uppercase text-gray-500">
                      Call · LINE · WhatsApp (Mr. Cheetah)
                    </p>
                    <a
                      href={COMPANY.intlPhoneHref}
                      className="font-display font-semibold text-ink hover:text-brand"
                    >
                      {COMPANY.intlPhoneDisplay}
                    </a>
                  </div>
                </div>
                <div className="flex gap-3 items-start">
                  <span className="w-9 h-9 flex-shrink-0 bg-red-50 text-brand rounded flex items-center justify-center text-sm">
                    📞
                  </span>
                  <div>
                    <p className="font-display text-[10px] font-bold tracking-wider uppercase text-gray-500">
                      โทรศัพท์ / Fax
                    </p>
                    <p className="font-display font-semibold text-ink">
                      <a href={COMPANY.officePhoneHref} className="hover:text-brand">
                        {COMPANY.officePhoneDisplay}
                      </a>{" "}
                      ·{" "}
                      <a href={COMPANY.mobilePhoneHref} className="hover:text-brand">
                        {COMPANY.mobilePhoneDisplay}
                      </a>
                    </p>
                    <p className="text-xs text-gray-500">Fax: {COMPANY.fax}</p>
                  </div>
                </div>
                <div className="flex gap-3 items-start">
                  <span className="w-9 h-9 flex-shrink-0 bg-red-50 text-brand rounded flex items-center justify-center text-sm">
                    ✉️
                  </span>
                  <div>
                    <p className="font-display text-[10px] font-bold tracking-wider uppercase text-gray-500">
                      Email
                    </p>
                    <a
                      href={`mailto:${COMPANY.email}`}
                      className="font-display font-semibold text-ink hover:text-brand"
                    >
                      {COMPANY.email}
                    </a>
                    <p className="text-xs text-gray-500">{COMPANY.hoursEn}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="rounded overflow-hidden h-48 bg-gray-200">
              <iframe
                src={COMPANY.mapsEmbed}
                className="w-full h-full border-0"
                loading="lazy"
                title="SAV Mechanical Services & Supplies map"
              />
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-neutral-900">
        <div className="max-w-6xl mx-auto px-6 pt-16 pb-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <Logo dark />
            <p className="text-sm text-gray-500 leading-relaxed mt-4">
              {COMPANY.nameTh}
              <br />
              ผู้นำเข้าและจัดจำหน่าย EOCR Overload Relay และ Samwha DSP
              จากเกาหลีโดยตรง
            </p>
            <p className="font-display text-[10px] tracking-wider text-gray-600 mt-3">
              Tax ID: {COMPANY.taxId} · จดทะเบียน พ.ศ. {COMPANY.registeredYearBE}
            </p>
          </div>
          <div>
            <h4 className="font-display text-[11px] font-extrabold tracking-[0.18em] uppercase text-white mb-4">
              Quick Links
            </h4>
            <ul className="flex flex-col gap-2.5 text-sm">
              {navLinks.map((l) => (
                <li key={l.href}>
                  {l.href.startsWith("/") ? (
                    <Link href={l.href} className="text-gray-500 hover:text-brand transition-colors">
                      {l.label}
                    </Link>
                  ) : (
                    <a href={l.href} className="text-gray-500 hover:text-brand transition-colors">
                      {l.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-display text-[11px] font-extrabold tracking-[0.18em] uppercase text-white mb-4">
              สินค้า
            </h4>
            <ul className="flex flex-col gap-2.5 text-sm">
              {[
                ["EOCR-SS Series", "EOCRSS"],
                ["EOCR-3DE / 3EZ", "EOCR3"],
                ["EOCR-i3 Series", "I3M"],
                ["EOCR-iF Series", "IFM"],
                ["EUCR Series", "EUCR"],
              ].map(([label, q]) => (
                <li key={q}>
                  <Link
                    href={`/products/?q=${q}`}
                    className="text-gray-500 hover:text-brand transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-display text-[11px] font-extrabold tracking-[0.18em] uppercase text-white mb-4">
              Contact Info
            </h4>
            <p className="text-sm text-gray-500 leading-relaxed">
              {COMPANY.addressLines[0]}
              <br />
              {COMPANY.addressLines[1]}
            </p>
            <p className="text-sm mt-3 flex flex-col gap-1.5">
              <a href={COMPANY.intlPhoneHref} className="text-gray-400 hover:text-brand transition-colors">
                📞 {COMPANY.intlPhoneDisplay} (LINE &amp; WA)
              </a>
              <a href={COMPANY.officePhoneHref} className="text-gray-400 hover:text-brand transition-colors">
                🏢 {COMPANY.officePhoneDisplay}
              </a>
              <a href={`mailto:${COMPANY.email}`} className="text-gray-400 hover:text-brand transition-colors">
                ✉️ {COMPANY.email}
              </a>
            </p>
            <p className="font-display text-xs text-gray-600 mt-3">{COMPANY.hoursEn}</p>
          </div>
        </div>
        <div className="border-t border-white/5">
          <div className="max-w-6xl mx-auto px-6 py-5 flex flex-col sm:flex-row justify-between items-center gap-2 font-display text-xs text-gray-600">
            <span>
              © {new Date().getFullYear()} {COMPANY.nameEn} All Rights Reserved.
            </span>
            <span className="flex gap-4">
              <a href="#" className="hover:text-brand transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-brand transition-colors">
                Terms of Use
              </a>
            </span>
          </div>
        </div>
      </footer>

      <ContactBar />
    </main>
  );
}
