"use client";

import { useState } from "react";
import { COMPANY, whatsappLink, mailtoLink } from "../lib/company";

// Static-site quotation form: instead of a dead Formspree placeholder, this
// composes a real message and hands it to the channel SAV actually answers —
// WhatsApp/LINE first, email as fallback. No backend required. A Formspree
// endpoint can still be added later without changing this UI.

const PRODUCT_OPTIONS = [
  "EOCR-SS 05 (0.5–6A)",
  "EOCR-SS 30 (3–30A)",
  "EOCR-SS 60 (5–60A)",
  "EOCR-3DE (0.2–70A + Ext.CT 1200A)",
  "EOCR-i3 Series (Digital display)",
  "EOCR-iF Series (Ground fault)",
  "EUCR (Under Current)",
  "DSP-AOL / DSP-AOM (Panel Mount)",
  "ต้องการคำแนะนำ / ไม่แน่ใจ",
];

const inputCls =
  "bg-gray-50 border border-gray-200 rounded-sm px-3.5 py-2.5 text-sm outline-none focus:border-brand";
const labelCls =
  "font-display text-[10px] font-bold tracking-wider uppercase text-gray-600";

export default function QuoteForm() {
  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [product, setProduct] = useState("");
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);

  const buildMessage = () =>
    [
      "ขอใบเสนอราคา (จากเว็บไซต์ SAV)",
      name && `ชื่อ: ${name}`,
      companyName && `บริษัท: ${companyName}`,
      phone && `เบอร์โทร: ${phone}`,
      email && `อีเมล: ${email}`,
      product && `สินค้าที่สนใจ: ${product}`,
      message && `รายละเอียด: ${message}`,
    ]
      .filter(Boolean)
      .join("\n");

  const copyMessage = async () => {
    try {
      await navigator.clipboard.writeText(buildMessage());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable — ignore */
    }
  };

  return (
    <div className="bg-white border border-gray-200 border-t-[3px] border-t-ink rounded p-8">
      <h3 className="font-display font-extrabold text-xl text-ink mb-6 pb-4 border-b border-gray-200">
        ส่งข้อความ / Request Quotation
      </h3>

      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        <div className="flex flex-col gap-1.5">
          <label className={labelCls}>ชื่อ-นามสกุล</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="ชื่อผู้ติดต่อ"
            className={inputCls}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={labelCls}>บริษัท / หน่วยงาน</label>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="ชื่อองค์กร"
            className={inputCls}
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        <div className="flex flex-col gap-1.5">
          <label className={labelCls}>เบอร์โทร</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="08X-XXX-XXXX"
            className={inputCls}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={labelCls}>อีเมล</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@company.com"
            className={inputCls}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5 mb-4">
        <label className={labelCls}>สินค้าที่สนใจ</label>
        <select
          value={product}
          onChange={(e) => setProduct(e.target.value)}
          className={inputCls}
        >
          <option value="">— เลือกรุ่นสินค้า —</option>
          {PRODUCT_OPTIONS.map((p) => (
            <option key={p}>{p}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5 mb-5">
        <label className={labelCls}>รายละเอียด / ขนาดมอเตอร์</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="เช่น มอเตอร์ 30HP 380V 3Phase, จำนวน 5 ชุด, ต้องการป้องกัน Ground Fault..."
          className={`${inputCls} min-h-[90px] resize-y`}
        />
      </div>

      <a
        href={whatsappLink(buildMessage())}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full text-center bg-brand text-white font-display text-sm font-bold tracking-wider uppercase py-3.5 rounded-sm hover:bg-brand-dark transition-colors"
      >
        💬 ส่งทาง LINE / WhatsApp →
      </a>
      <div className="grid grid-cols-2 gap-3 mt-3">
        <a
          href={mailtoLink("ขอใบเสนอราคา (SAV Website)", buildMessage())}
          className="text-center border border-gray-300 text-ink font-display text-xs font-bold tracking-wider uppercase py-3 rounded-sm hover:border-brand hover:text-brand transition-colors"
        >
          ✉️ ส่งทางอีเมล
        </a>
        <button
          type="button"
          onClick={copyMessage}
          className="text-center border border-gray-300 text-ink font-display text-xs font-bold tracking-wider uppercase py-3 rounded-sm hover:border-brand hover:text-brand transition-colors"
        >
          {copied ? "✓ คัดลอกแล้ว" : "คัดลอกข้อความ"}
        </button>
      </div>
      <p className="text-[11px] text-gray-500 mt-3 leading-relaxed">
        ข้อความจะเปิดในแอป WhatsApp / อีเมลของคุณพร้อมรายละเอียดที่กรอกไว้ —
        ทีมงานตอบกลับภายในวันทำการ ({COMPANY.hoursTh})
      </p>
    </div>
  );
}
