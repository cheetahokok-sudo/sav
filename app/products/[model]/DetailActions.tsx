"use client";

import { useState } from "react";

// CTA row for a product detail page. Shares the quote basket with the catalog
// page via the same localStorage key, so "add to quote" here shows up in the
// basket there. Copy-link is the engineer-share workflow: procurement sends
// this exact URL for project approval.

const QUOTE_KEY = "sav_quote_v1";
type QuoteItem = { model: string; qty: number };

export default function DetailActions({ model }: { model: string }) {
  const [added, setAdded] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

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
        onClick={copyLink}
        className="border border-gray-300 text-ink font-display text-xs font-bold tracking-wider uppercase px-6 py-3 rounded-sm hover:border-brand hover:text-brand transition-colors"
      >
        {linkCopied ? "✓ คัดลอกลิงก์แล้ว" : "📋 คัดลอกลิงก์หน้านี้"}
      </button>
    </div>
  );
}
