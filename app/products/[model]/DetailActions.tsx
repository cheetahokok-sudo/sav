"use client";

import { useState } from "react";
import { COMPANY, lineLink, messagingLink } from "../../lib/company";

// CTA row for a product detail page. Shares the quote basket with the catalog
// page via the same localStorage key, so "add to quote" here shows up in the
// basket there. Copy-link is the engineer-share workflow: procurement sends
// this exact URL for project approval.

const QUOTE_KEY = "sav_quote_v1";
type QuoteItem = { model: string; qty: number };

export default function DetailActions({ model }: { model: string }) {
  const [added, setAdded] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [sending, setSending] = useState(false);

  const addToQuote = () => {
    try {
      const cur: QuoteItem[] = JSON.parse(localStorage.getItem(QUOTE_KEY) || "[]");
      const hit = cur.find((i) => i.model === model);
      const next = hit
        ? cur.map((i) => (i.model === model ? { ...i, qty: i.qty + 1 } : i))
        : [...cur, { model, qty: 1 }];
      localStorage.setItem(QUOTE_KEY, JSON.stringify(next));
      setAdded(true);
      setTimeout(() => setAdded(false), 2500);
    } catch {
      /* storage unavailable */
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2500);
    } catch {
      /* clipboard unavailable */
    }
  };

  // LINE cannot prefill a message: copy the inquiry text first, then open the
  // chat so the customer pastes it (same pattern as the quote form).
  const askViaLine = async () => {
    const msg = `สอบถามสินค้า ${model} (จากเว็บไซต์ SAV)\nขอใบเสนอราคาและระยะเวลาจัดส่งครับ`;
    if (!COMPANY.lineOfficialUrl) {
      window.open(messagingLink(msg), "_blank", "noopener");
      return;
    }
    try {
      await navigator.clipboard.writeText(msg);
    } catch {
      /* customer can type instead */
    }
    setSending(true);
    setTimeout(() => {
      setSending(false);
      window.open(lineLink(), "_blank", "noopener");
    }, 700);
  };

  return (
    <div className="flex flex-wrap gap-3">
      <button
        type="button"
        onClick={addToQuote}
        className="bg-brand text-white font-display text-xs font-bold tracking-wider uppercase px-6 py-3 rounded-sm hover:bg-brand-dark transition-colors"
      >
        {added ? "✓ เพิ่มแล้ว — เปิดตะกร้าที่หน้าสินค้า" : "🧾 เพิ่มในใบขอราคา"}
      </button>
      <button
        type="button"
        onClick={askViaLine}
        className="border-[1.5px] border-brand text-brand font-display text-xs font-bold tracking-wider uppercase px-6 py-3 rounded-sm hover:bg-brand hover:text-white transition-colors"
      >
        {sending ? "คัดลอกข้อความแล้ว เปิด LINE…" : "💬 สอบถามทาง LINE"}
      </button>
      <button
        type="button"
        onClick={copyLink}
        className="border border-gray-300 text-ink font-display text-xs font-bold tracking-wider uppercase px-6 py-3 rounded-sm hover:border-brand hover:text-brand transition-colors"
      >
        {linkCopied ? "✓ คัดลอกลิงก์แล้ว" : "📋 คัดลอกลิงก์หน้านี้"}
      </button>
    </div>
  );
}
