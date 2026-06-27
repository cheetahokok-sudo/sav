import Link from "next/link";

const navLinks = [
  { href: "#why", label: "ABOUT US" },
  { href: "#products", label: "PRODUCTS" },
  { href: "#solutions", label: "SOLUTIONS" },
  { href: "#applications", label: "INDUSTRIES" },
  { href: "#contact", label: "CONTACT" },
];

const productCategories = [
  { icon: "⚡", name: "EOCR OVERLOAD RELAY", sub: "รีเลย์ป้องกันมอเตอร์ดิจิทัล" },
  { icon: "🔌", name: "UNDER CURRENT RELAY", sub: "ป้องกันกระแสต่ำ / Dry Running" },
  { icon: "📊", name: "DSP PANEL METER", sub: "มิเตอร์วัดค่าพร้อม Display" },
  { icon: "🛡️", name: "INSULATION MONITOR", sub: "วัดค่าความเป็นฉนวน HV Motor" },
  { icon: "🔩", name: "MOTOR ACCESSORIES", sub: "อุปกรณ์เสริมมอเตอร์" },
  { icon: "📦", name: "SPARE PARTS", sub: "อะไหล่และอุปกรณ์สำรอง" },
];

const eocrProducts = [
  {
    tag: "Samwha EOCR · Best Seller",
    name: "EOCR-SS Series",
    desc: "รีเลย์ป้องกัน Overcurrent แบบ Digital ขนาดกะทัดรัด รองรับ AC/DC (Free Voltage) ในตัวเดียว",
    specs: [
      ["กระแส (FLA)", "0.5–60A (3 รุ่น)"],
      ["ไฟเลี้ยง", "24~240VAC/DC"],
      ["ผลิต", "🇰🇷 Made in Korea"],
    ],
    features: [
      "Overcurrent + Phase Loss + Locked Rotor",
      "Free Voltage — AC/DC ในตัวเดียว",
      "ทดแทน Schneider TeSys lt47 ได้ทันที",
    ],
  },
  {
    tag: "Samwha EOCR · Advanced",
    name: "EOCR-3DE",
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
    tag: "Samwha DSP",
    name: "DSP-AOL / AOM",
    desc: "Digital Motor Protection Panel Mount แสดงผลกระแสจริง Real-time บันทึก Trip Log 8 ครั้งล่าสุด",
    specs: [
      ["Display", "Digital LED Panel"],
      ["Trip Memory", "8 trips log"],
    ],
    features: [
      "Overcurrent, Locked Rotor, Phase Loss",
      "Current Unbalance + Ground Fault",
      "บันทึก Trip 8 ครั้งล่าสุด",
    ],
  },
  {
    tag: "Samwha EOCR",
    name: "EUCR S/W",
    desc: "Under Current Relay สำหรับระบบปั๊มน้ำ ตรวจจับ Dry Running และโหลดต่ำผิดปกติ",
    specs: [
      ["กระแส", "0.5–6.5A"],
      ["ไฟเลี้ยง", "24~240VAC/DC"],
    ],
    features: ["Under Current Protection", "เหมาะสำหรับปั๊มน้ำ Dry Running"],
  },
];

const brands = [
  { name: "SIEMENS", className: "text-teal-700" },
  { name: "Schneider Electric", className: "text-green-600" },
  { name: "ABB", className: "text-red-600" },
  { name: "MITSUBISHI ELECTRIC", className: "text-red-600" },
  { name: "OMRON", className: "text-red-600" },
  { name: "EATON", className: "text-blue-900" },
  { name: "Samwha DSP", className: "text-blue-700" },
];

const solutions = [
  { icon: "🏭", name: "FACTORY AUTOMATION", sub: "ระบบอัตโนมัติในโรงงาน" },
  { icon: "⚡", name: "ENERGY & POWER", sub: "ระบบพลังงานและไฟฟ้า" },
  { icon: "🏙️", name: "INFRASTRUCTURE", sub: "ระบบสาธารณูปโภคและอาคาร" },
  { icon: "🔩", name: "OEM & MACHINE BUILDER", sub: "ผู้ผลิตเครื่องจักรและระบบ (OEM)" },
];

const whyItems = [
  {
    title: "สินค้าแท้ 100% — Original Samwha Korea",
    desc: "นำเข้าโดยตรงจาก Samwha EOCR Ltd. และ Samwha DSP เกาหลี ผ่านกระบวนการตรวจสอบคุณภาพทุกชิ้น",
  },
  {
    title: "สต็อกพร้อมส่งทันที ไม่ต้องรอนำเข้า",
    desc: "สินค้ายอดนิยมมีสต็อกในไทยพร้อมส่งทันที รองรับความต้องการเร่งด่วนของโรงงาน",
  },
  {
    title: "ทีมเทคนิคให้คำปรึกษาการเลือกรุ่นฟรี",
    desc: "ผู้เชี่ยวชาญช่วยเลือกรุ่นที่เหมาะกับระบบ ตั้งค่า และแก้ปัญหาการใช้งาน",
  },
  {
    title: "รองรับทั้งในประเทศและ International Orders",
    desc: "Mr. Cheetah รองรับ International Orders โดยตรง ติดต่อ +66 85 212 0255 หรือ Kakao Talk: cheetahokok",
  },
];

function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`flex items-center gap-2 ${className}`}>
      <span className="bg-brand text-white font-display font-extrabold italic text-lg px-2.5 py-1 rounded-sm tracking-tight">
        SAV
      </span>
      <span className="hidden sm:flex flex-col leading-tight">
        <span className="font-display font-bold text-sm text-gray-700 tracking-wide">
          MECHANICAL
        </span>
        <span className="font-display font-medium text-[10px] text-gray-500 tracking-wider">
          SERVICES &amp; SUPPLIES
        </span>
      </span>
    </Link>
  );
}

export default function Home() {
  return (
    <main>
      {/* TOPBAR */}
      <div className="bg-ink flex justify-end items-center gap-3 px-6 py-1.5 text-xs text-gray-400 font-display">
        <span className="text-white">TH</span>
        <span className="text-gray-700">|</span>
        <Link href="#" className="hover:text-white transition-colors">
          EN
        </Link>
      </div>

      {/* NAV */}
      <nav className="sticky top-0 z-50 bg-white shadow-md flex items-center justify-between px-6 h-16">
        <Logo />
        <ul className="hidden lg:flex items-center font-display text-xs font-semibold tracking-wider uppercase">
          {navLinks.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="px-4 h-16 flex items-center text-gray-700 border-b-[3px] border-transparent hover:text-brand hover:border-brand transition-colors"
              >
                {l.label}
              </a>
            </li>
          ))}
          <li>
            <a
              href="#contact"
              className="ml-2 px-5 h-16 flex items-center bg-brand text-white font-bold hover:bg-brand-dark transition-colors"
            >
              REQUEST QUOTATION
            </a>
          </li>
        </ul>
      </nav>

      {/* HERO */}
      <div className="relative bg-ink overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20 grayscale-[70%]"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1563990308267-cd6d3cc09318?w=1400&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black via-neutral-900/80 to-neutral-800/60" />
        <div className="relative z-10 flex flex-col lg:flex-row items-center gap-10 px-6 lg:px-16 py-16 lg:py-24 max-w-7xl mx-auto">
          <div className="flex-1 max-w-xl">
            <p className="font-display text-xs font-bold tracking-[0.2em] uppercase text-brand mb-5">
              Motor Protection Specialist · Samwha Korea
            </p>
            <h1 className="font-display font-extrabold text-white text-4xl sm:text-5xl leading-[1.08] mb-4">
              Powering Industry.
              <br />
              Protecting Motors.
            </h1>
            <p className="text-white/65 leading-relaxed mb-8 max-w-md">
              ผู้นำเข้าและจัดจำหน่าย EOCR Overload Relay และ Samwha DSP จากเกาหลีโดยตรง
              เพื่อความปลอดภัยและประสิทธิภาพของระบบมอเตอร์ในอุตสาหกรรม
            </p>
            <div className="flex flex-wrap gap-3 font-display text-sm font-bold tracking-wider uppercase">
              <a
                href="#products"
                className="inline-flex items-center gap-2 bg-brand text-white px-7 py-3 hover:bg-brand-dark transition-colors"
              >
                VIEW PRODUCTS →
              </a>
              <a
                href="#contact"
                className="inline-flex items-center gap-2 border border-white/30 text-white px-7 py-3 hover:border-white hover:bg-white/5 transition-colors"
              >
                REQUEST QUOTATION →
              </a>
            </div>
          </div>

          <div className="hidden lg:flex flex-col gap-3 bg-black/45 border border-white/10 rounded p-5 min-w-[180px] backdrop-blur-sm">
            <a
              href="tel:027028801"
              className="flex items-center gap-3 px-3 py-2.5 rounded bg-white/5 hover:bg-brand/20 transition-colors"
            >
              <span className="w-8 h-8 bg-brand rounded-full flex items-center justify-center text-sm flex-shrink-0">
                📞
              </span>
              <span className="font-display">
                <span className="block text-[10px] font-bold tracking-wider uppercase text-white/50">
                  Call Now
                </span>
                <span className="block text-sm font-bold text-white">02-702-8801</span>
              </span>
            </a>
            <Link
              href="#contact"
              className="flex items-center gap-3 px-3 py-2.5 rounded bg-white/5 hover:bg-brand/20 transition-colors"
            >
              <span className="w-8 h-8 bg-brand rounded-full flex items-center justify-center text-sm flex-shrink-0">
                💬
              </span>
              <span className="font-display">
                <span className="block text-[10px] font-bold tracking-wider uppercase text-white/50">
                  LINE Official
                </span>
                <span className="block text-sm font-bold text-white">cheetahok</span>
              </span>
            </Link>
            <a
              href="mailto:sales@savthai.com"
              className="flex items-center gap-3 px-3 py-2.5 rounded bg-white/5 hover:bg-brand/20 transition-colors"
            >
              <span className="w-8 h-8 bg-brand rounded-full flex items-center justify-center text-sm flex-shrink-0">
                ✉️
              </span>
              <span className="font-display">
                <span className="block text-[10px] font-bold tracking-wider uppercase text-white/50">
                  Email Us
                </span>
                <span className="block text-sm font-bold text-white">sales@savthai.com</span>
              </span>
            </a>
          </div>
        </div>
      </div>

      {/* STATS BAR */}
      <div className="bg-neutral-800 grid grid-cols-2 lg:grid-cols-4">
        {[
          ["🛡️", "Trusted Quality", "สินค้าคุณภาพมาตรฐานสากล"],
          ["📅", "30+ Years Experience", "ประสบการณ์นำเข้ากว่า 30 ปี"],
          ["🔧", "Engineering Support", "ทีมวิศวกรพร้อมให้คำแนะนำ"],
          ["🚚", "Fast Delivery", "จัดส่งรวดเร็ว ทั่วประเทศ"],
        ].map(([icon, title, sub]) => (
          <div key={title} className="flex items-center gap-4 px-5 py-6 border-r border-white/5 last:border-r-0">
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

      {/* PRODUCT CATEGORIES */}
      <section id="products" className="bg-white py-20 px-6">
        <p className="text-center font-display text-[11px] font-extrabold tracking-[0.2em] uppercase text-brand mb-2">
          OUR PRODUCTS
        </p>
        <h2 className="text-center font-display font-extrabold text-3xl sm:text-4xl text-ink mb-4">
          PRODUCT CATEGORIES
        </h2>
        <div className="w-10 h-[3px] bg-brand rounded mx-auto mb-12" />

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5 max-w-6xl mx-auto mb-10">
          {productCategories.map((c) => (
            <a
              href="#eocr"
              key={c.name}
              className="group bg-white border border-gray-200 rounded p-6 text-center hover:shadow-lg hover:border-brand hover:-translate-y-1 transition-all"
            >
              <div className="w-16 h-14 mx-auto mb-3 bg-gray-50 rounded flex items-center justify-center text-3xl">
                {c.icon}
              </div>
              <p className="font-display text-xs font-bold text-ink mb-1 leading-tight">{c.name}</p>
              <p className="text-[11px] text-gray-500 mb-3 leading-tight">{c.sub}</p>
              <span className="inline-flex w-6 h-6 border border-brand text-brand rounded-full items-center justify-center text-[10px] group-hover:bg-brand group-hover:text-white transition-colors">
                →
              </span>
            </a>
          ))}
        </div>
        <div className="text-center">
          <a
            href="#eocr"
            className="inline-flex items-center gap-2 border border-brand text-brand font-display text-xs font-bold tracking-wider uppercase px-7 py-3 hover:bg-brand hover:text-white transition-colors"
          >
            VIEW ALL PRODUCTS →
          </a>
        </div>
      </section>

      {/* EOCR PRODUCT DETAIL */}
      <section id="eocr" className="bg-gray-100 py-20 px-6">
        <p className="text-center font-display text-[11px] font-extrabold tracking-[0.2em] uppercase text-brand mb-2">
          SAMWHA EOCR &amp; DSP
        </p>
        <h2 className="text-center font-display font-extrabold text-3xl sm:text-4xl text-ink mb-4">
          สินค้าของเรา
        </h2>
        <div className="w-10 h-[3px] bg-brand rounded mx-auto mb-4" />
        <p className="text-center text-gray-600 max-w-xl mx-auto mb-12 leading-relaxed">
          อุปกรณ์ป้องกันมอเตอร์ Digital คุณภาพสูงจากเกาหลี — ออกแบบมาเพื่อแทนที่รีเลย์ Thermal แบบเดิม
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
          {eocrProducts.map((p, i) => (
            <div
              key={p.name}
              className={`bg-white border border-gray-200 rounded p-7 hover:shadow-lg hover:-translate-y-0.5 transition-all ${
                i === 0 ? "border-t-[3px] border-t-brand" : "border-t-[3px] border-t-gray-300 hover:border-t-brand"
              }`}
            >
              <p className="font-display text-[10px] font-extrabold tracking-wider uppercase text-brand mb-1">
                {p.tag}
              </p>
              <h3 className="font-display font-extrabold text-2xl text-ink mb-3">{p.name}</h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-5">{p.desc}</p>
              <div className="border-t border-gray-100 pt-3 mb-4">
                {p.specs.map(([k, v]) => (
                  <div key={k} className="flex justify-between text-xs py-1.5 border-b border-gray-100 last:border-b-0">
                    <span className="text-gray-500">{k}</span>
                    <span className="font-display font-semibold text-ink">{v}</span>
                  </div>
                ))}
              </div>
              <ul className="space-y-1.5">
                {p.features.map((f) => (
                  <li key={f} className="flex gap-2 text-xs text-gray-700">
                    <span className="text-brand text-[7px] mt-1.5">▶</span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="border-2 border-dashed border-gray-300 rounded p-7 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 bg-brand text-white rounded-full flex items-center justify-center text-xl mb-4">
              ?
            </div>
            <h3 className="font-display font-extrabold text-lg text-ink mb-2">ไม่แน่ใจ?</h3>
            <p className="text-sm text-gray-600 mb-5">
              ติดต่อทีมงาน SAV — เรามีผู้เชี่ยวชาญพร้อมแนะนำรุ่นที่เหมาะสมกับระบบของท่าน
            </p>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 border border-brand text-brand font-display text-xs font-bold tracking-wider uppercase px-5 py-2.5 hover:bg-brand hover:text-white transition-colors"
            >
              ปรึกษาผู้เชี่ยวชาญ →
            </a>
          </div>
        </div>
      </section>

      {/* BRANDS */}
      <section className="bg-white py-20 px-6">
        <p className="text-center font-display text-[11px] font-extrabold tracking-[0.2em] uppercase text-brand mb-2">
          OUR GLOBAL BRANDS
        </p>
        <h2 className="text-center font-display font-extrabold text-3xl sm:text-4xl text-ink mb-4">
          แบรนด์ที่เราจัดจำหน่าย
        </h2>
        <div className="w-10 h-[3px] bg-brand rounded mx-auto mb-10" />
        <div className="flex flex-wrap justify-center bg-white border border-gray-200 rounded overflow-hidden max-w-4xl mx-auto">
          {brands.map((b) => (
            <div
              key={b.name}
              className="flex-1 min-w-[140px] flex items-center justify-center px-5 py-7 border-r border-b border-gray-200 last:border-r-0 hover:bg-gray-50 transition-colors"
            >
              <span className={`font-display font-extrabold text-sm text-center ${b.className}`}>{b.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* INDUSTRY SOLUTIONS */}
      <section id="solutions" className="bg-gray-100 py-20 px-6">
        <h2 className="text-center font-display font-extrabold text-3xl sm:text-4xl text-ink mb-4">
          INDUSTRY SOLUTIONS
        </h2>
        <div className="w-10 h-[3px] bg-brand rounded mx-auto mb-12" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto">
          {solutions.map((s) => (
            <div
              key={s.name}
              className="relative aspect-[4/3] rounded overflow-hidden bg-gradient-to-br from-neutral-900 to-neutral-700 group cursor-pointer"
            >
              <div className="absolute inset-0 flex items-center justify-center text-7xl opacity-10 grayscale group-hover:scale-110 transition-transform">
                {s.icon}
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <div className="w-9 h-9 bg-brand rounded-full flex items-center justify-center text-sm mb-2">
                  {s.icon}
                </div>
                <p className="font-display font-bold text-white text-sm uppercase tracking-wide">{s.name}</p>
                <p className="text-xs text-white/65">{s.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* LATEST PROJECT */}
      <section id="applications" className="bg-white py-20 px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          <div>
            <p className="font-display text-[11px] font-extrabold tracking-[0.2em] uppercase text-brand mb-2">
              LATEST PROJECT
            </p>
            <h3 className="font-display font-extrabold text-2xl text-ink mb-4 leading-snug">
              ติดตั้งระบบควบคุมและตรวจสอบพลังงาน
              <br />
              โรงงานอุตสาหกรรมแห่งหนึ่ง
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-6">
              ออกแบบและติดตั้งระบบ Motor Protection System พร้อมอุปกรณ์ EOCR ครบวงจร
              เพื่อเพิ่มประสิทธิภาพการใช้พลังงานและลดความเสี่ยงของระบบไฟฟ้า
            </p>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 border border-brand text-brand font-display text-xs font-bold tracking-wider uppercase px-6 py-2.5 hover:bg-brand hover:text-white transition-colors"
            >
              VIEW CASE STUDY →
            </a>
          </div>
          <div className="grid grid-cols-[1fr_0.7fr] bg-neutral-900 rounded overflow-hidden">
            <div className="flex items-center justify-center text-7xl opacity-40 bg-gradient-to-br from-neutral-800 to-neutral-900 min-h-[220px]">
              ⚙️
            </div>
            <div className="flex flex-col gap-5 justify-center p-5">
              {[
                ["ENERGY SAVING", "18%", "ลดการใช้พลังงาน"],
                ["AVAILABILITY", "99.9%", "ความเสถียรของระบบ"],
                ["ROI", "1.2", "Years คืนทุน"],
              ].map(([label, num, unit]) => (
                <div key={label}>
                  <p className="font-display text-[9px] font-bold tracking-wider uppercase text-brand">{label}</p>
                  <p className="font-display font-extrabold text-2xl text-white">{num}</p>
                  <p className="text-xs text-gray-400">{unit}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <div className="bg-brand px-6 py-7 flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <span className="text-3xl text-white/70">💡</span>
          <div>
            <p className="font-display font-bold text-white text-lg">Need Expert Advice?</p>
            <p className="text-sm text-white/75">
              ทีมวิศวกรของเราพร้อมให้คำปรึกษาและออกแบบโซลูชันที่เหมาะสำหรับคุณ
            </p>
          </div>
        </div>
        <div className="flex gap-3 font-display text-xs font-bold tracking-wider uppercase">
          <a href="tel:027028801" className="bg-white text-brand px-6 py-3 hover:bg-gray-100 transition-colors">
            📞 02-702-8801
          </a>
          <a
            href="#contact"
            className="border border-white/60 text-white px-6 py-3 hover:bg-white/10 hover:border-white transition-colors"
          >
            💬 LINE Official
          </a>
        </div>
      </div>

      {/* WHY SAV */}
      <section id="why" className="bg-gray-100 py-20 px-6">
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
                className={`flex gap-5 py-6 border-b border-gray-200 ${i === 0 ? "border-t" : ""} hover:pl-1 transition-[padding]`}
              >
                <span className="font-display font-extrabold text-4xl text-gray-200 w-12 text-right flex-shrink-0">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <p className="font-display font-bold text-sm text-ink mb-1">{item.title}</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-neutral-900 rounded overflow-hidden">
            <div className="bg-brand px-7 py-6">
              <h3 className="font-display font-extrabold text-xl text-white">ติดต่อด่วน</h3>
              <p className="text-xs text-white/70 mt-1">Ready to assist — All channels available</p>
            </div>
            <div className="p-7 flex flex-col gap-4">
              <div className="flex gap-3">
                <span className="w-9 h-9 bg-white/10 rounded flex items-center justify-center flex-shrink-0">📞</span>
                <div>
                  <p className="font-display text-[10px] font-bold tracking-wider uppercase text-gray-500">โทรศัพท์</p>
                  <p className="font-display font-semibold text-white text-sm">
                    <a href="tel:027028801" className="hover:text-brand">02-702-8801</a> ·{" "}
                    <a href="tel:0847702261" className="hover:text-brand">084-770-2261</a>
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">Fax: 02-395-1002</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="w-9 h-9 bg-white/10 rounded flex items-center justify-center flex-shrink-0">🌏</span>
                <div>
                  <p className="font-display text-[10px] font-bold tracking-wider uppercase text-gray-500">
                    International — Mr. Cheetah
                  </p>
                  <a href="tel:+66852120255" className="font-display font-semibold text-white text-sm hover:text-brand">
                    +66 85 212 0255
                  </a>
                  <p className="text-xs text-gray-500 mt-0.5">Kakao Talk: cheetahokok</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="w-9 h-9 bg-white/10 rounded flex items-center justify-center flex-shrink-0">📍</span>
                <div>
                  <p className="font-display text-[10px] font-bold tracking-wider uppercase text-gray-500">ที่อยู่</p>
                  <p className="text-sm text-gray-300">
                    107/58 หมู่ 8 ต.บางเมือง อ.เมือง
                    <br />
                    จ.สมุทรปราการ 10270
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">Tax ID: 0113530000263</p>
                </div>
              </div>
            </div>
            <div className="px-7 py-5 border-t border-white/5 flex gap-3 font-display text-xs font-bold tracking-wider uppercase">
              <a href="tel:027028801" className="bg-brand text-white px-5 py-2.5 hover:bg-brand-dark transition-colors">
                โทรเลย →
              </a>
              <a
                href="#contact"
                className="border border-white/30 text-white px-5 py-2.5 hover:border-white transition-colors"
              >
                ส่งข้อความ
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="bg-white py-20 px-6">
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
          {/* NOTE: this is a static site (no PHP backend). Hook this form up to a
              free service like Formspree (formspree.io) — create an account, get
              your form endpoint, and replace the action="" below. Until then it
              just shows contact details to the user. */}
          <form
            className="bg-white border border-gray-200 border-t-[3px] border-t-ink rounded p-8"
            action="https://formspree.io/f/YOUR_FORM_ID"
            method="POST"
          >
            <h3 className="font-display font-extrabold text-xl text-ink mb-6 pb-4 border-b border-gray-200">
              ส่งข้อความ / Request Quotation
            </h3>
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-display text-[10px] font-bold tracking-wider uppercase text-gray-600">
                  ชื่อ-นามสกุล
                </label>
                <input name="name" type="text" placeholder="ชื่อผู้ติดต่อ" className="bg-gray-50 border border-gray-200 rounded-sm px-3.5 py-2.5 text-sm outline-none focus:border-brand" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-display text-[10px] font-bold tracking-wider uppercase text-gray-600">
                  บริษัท / หน่วยงาน
                </label>
                <input name="company" type="text" placeholder="ชื่อองค์กร" className="bg-gray-50 border border-gray-200 rounded-sm px-3.5 py-2.5 text-sm outline-none focus:border-brand" />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-display text-[10px] font-bold tracking-wider uppercase text-gray-600">เบอร์โทร</label>
                <input name="phone" type="tel" placeholder="08X-XXX-XXXX" className="bg-gray-50 border border-gray-200 rounded-sm px-3.5 py-2.5 text-sm outline-none focus:border-brand" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-display text-[10px] font-bold tracking-wider uppercase text-gray-600">อีเมล</label>
                <input name="email" type="email" placeholder="email@company.com" className="bg-gray-50 border border-gray-200 rounded-sm px-3.5 py-2.5 text-sm outline-none focus:border-brand" />
              </div>
            </div>
            <div className="flex flex-col gap-1.5 mb-4">
              <label className="font-display text-[10px] font-bold tracking-wider uppercase text-gray-600">สินค้าที่สนใจ</label>
              <select name="product" className="bg-gray-50 border border-gray-200 rounded-sm px-3.5 py-2.5 text-sm outline-none focus:border-brand">
                <option value="">— เลือกรุ่นสินค้า —</option>
                <option>EOCR-SS 05 (0.5–6A)</option>
                <option>EOCR-SS 30 (3–30A)</option>
                <option>EOCR-SS 60 (5–60A)</option>
                <option>EOCR-3DE (0.2–70A + Ext.CT 1200A)</option>
                <option>EUCR S/W (Under Current)</option>
                <option>DSP-AOL / DSP-AOM (Panel Mount)</option>
                <option>ต้องการคำแนะนำ / ไม่แน่ใจ</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5 mb-5">
              <label className="font-display text-[10px] font-bold tracking-wider uppercase text-gray-600">
                รายละเอียด / ขนาดมอเตอร์
              </label>
              <textarea
                name="message"
                placeholder="เช่น มอเตอร์ 30HP 380V 3Phase, จำนวน 5 ชุด, ต้องการป้องกัน Ground Fault..."
                className="bg-gray-50 border border-gray-200 rounded-sm px-3.5 py-2.5 text-sm outline-none focus:border-brand min-h-[90px] resize-y"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-brand text-white font-display text-sm font-bold tracking-wider uppercase py-3.5 rounded-sm hover:bg-brand-dark transition-colors"
            >
              ส่งข้อความ / ขอใบเสนอราคา →
            </button>
          </form>

          <div className="flex flex-col gap-6">
            <div className="bg-white border border-gray-200 border-t-[3px] border-t-brand rounded p-7">
              <h3 className="font-display font-extrabold text-base text-ink mb-5 pb-3 border-b border-gray-200">
                Contact Information
              </h3>
              <div className="flex flex-col gap-4 text-sm">
                <div className="flex gap-3">
                  <span className="w-8 h-8 bg-red-50 text-brand rounded flex items-center justify-center flex-shrink-0">📍</span>
                  <div>
                    <p className="font-display text-[10px] font-bold tracking-wider uppercase text-gray-500">ที่อยู่</p>
                    <p className="font-display font-semibold text-ink">
                      107/58 หมู่ 8 ต.บางเมือง อ.เมือง
                      <br />
                      จ.สมุทรปราการ 10270
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="w-8 h-8 bg-red-50 text-brand rounded flex items-center justify-center flex-shrink-0">📞</span>
                  <div>
                    <p className="font-display text-[10px] font-bold tracking-wider uppercase text-gray-500">โทรศัพท์ / Fax</p>
                    <p className="font-display font-semibold text-ink">
                      <a href="tel:027028801" className="hover:text-brand">02-702-8801</a> ·{" "}
                      <a href="tel:0847702261" className="hover:text-brand">084-770-2261</a>
                    </p>
                    <p className="text-xs text-gray-500">Fax: 02-395-1002</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="w-8 h-8 bg-red-50 text-brand rounded flex items-center justify-center flex-shrink-0">🌏</span>
                  <div>
                    <p className="font-display text-[10px] font-bold tracking-wider uppercase text-gray-500">International (Mr. Cheetah)</p>
                    <a href="tel:+66852120255" className="font-display font-semibold text-ink hover:text-brand">
                      +66 85 212 0255
                    </a>
                    <p className="text-xs text-gray-500">Kakao Talk: cheetahokok</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="w-8 h-8 bg-red-50 text-brand rounded flex items-center justify-center flex-shrink-0">✉️</span>
                  <div>
                    <p className="font-display text-[10px] font-bold tracking-wider uppercase text-gray-500">Email</p>
                    <a href="mailto:sales@savthai.com" className="font-display font-semibold text-ink hover:text-brand">
                      sales@savthai.com
                    </a>
                    <p className="text-xs text-gray-500">Mon–Fri: 8.30 AM – 5.30 PM</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="rounded overflow-hidden h-[180px] bg-gray-200">
              <iframe
                src="https://maps.google.com/maps?q=13.5987,100.5969&hl=th&z=15&output=embed"
                className="w-full h-full border-0"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-neutral-900">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 max-w-6xl mx-auto px-6 py-16">
          <div>
            <Logo className="mb-4 [&_span]:text-white" />
            <p className="text-sm text-gray-500 leading-relaxed">
              หจก. เอส เอ วี เมคคานิคคอล เซอร์วิสส์ แอนด์ ซัพพลายส์
              <br />
              ผู้นำเข้าและจัดจำหน่ายอุปกรณ์ไฟฟ้าและระบบอัตโนมัติ จากแบรนด์ชั้นนำระดับโลก
            </p>
            <p className="font-display text-[11px] tracking-wider text-gray-600 mt-3">
              Tax ID: 0113530000263
            </p>
          </div>
          <div>
            <h4 className="font-display text-[11px] font-extrabold tracking-[0.18em] uppercase text-white mb-4">
              Quick Links
            </h4>
            <ul className="flex flex-col gap-2.5 text-sm text-gray-500">
              {navLinks.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="hover:text-brand transition-colors">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-display text-[11px] font-extrabold tracking-[0.18em] uppercase text-white mb-4">
              สินค้า
            </h4>
            <ul className="flex flex-col gap-2.5 text-sm text-gray-500">
              {eocrProducts.map((p) => (
                <li key={p.name}>
                  <a href="#eocr" className="hover:text-brand transition-colors">
                    {p.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-display text-[11px] font-extrabold tracking-[0.18em] uppercase text-white mb-4">
              Contact Info
            </h4>
            <p className="text-sm text-gray-500 leading-relaxed">
              107/58 หมู่ 8 ต.บางเมือง อ.เมือง
              <br />
              จ.สมุทรปราการ 10270
              <br />
              <br />
              <a href="tel:027028801" className="hover:text-brand transition-colors">
                📞 02-702-8801-4
              </a>
              <br />
              <a href="mailto:sales@savthai.com" className="hover:text-brand transition-colors">
                ✉️ sales@savthai.com
              </a>
            </p>
            <p className="font-display text-xs text-gray-600 mt-3">Mon–Fri: 8.30 AM – 5.30 PM</p>
          </div>
        </div>
        <div className="border-t border-white/10 px-6 py-5 flex flex-wrap justify-between gap-2 max-w-6xl mx-auto font-display text-xs text-gray-600">
          <span>© {new Date().getFullYear()} SAV Mechanical Services &amp; Supplies Ltd., Part. All Rights Reserved.</span>
          <span className="flex gap-3">
            <a href="#" className="hover:text-brand transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-brand transition-colors">Terms of Use</a>
          </span>
        </div>
      </footer>
    </main>
  );
}
