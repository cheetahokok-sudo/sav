import { Fragment, type ReactNode } from "react";

// ============================================================================
// The driven-equipment dataset is written in the same voice as the article
// bodies, and its authors reach for **markdown emphasis** on the words that
// carry the engineering — "กระแส **ลดลง** เมื่อวาล์วด้านส่งปิด". Those strings
// are rendered as React text, not through MDX, so the asterisks were printing
// literally in every failure-mode table.
//
// Emphasis is not decoration in this dataset. The bolded word is usually the
// direction of the current, which is the one thing a reader must not misread.
//
// Deliberately handles **bold** only. A general markdown renderer here would
// invite links and lists into data that two different components have to lay
// out, and pure data is the reason the dataset works.
// ============================================================================

const BOLD = /\*\*(.+?)\*\*/g;

export function Emphasis({ text }: { text: string }): ReactNode {
  if (!text.includes("**")) return text;

  const parts: ReactNode[] = [];
  let last = 0;
  for (const m of text.matchAll(BOLD)) {
    const at = m.index ?? 0;
    if (at > last) parts.push(text.slice(last, at));
    parts.push(<strong key={at}>{m[1]}</strong>);
    last = at + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));

  return parts.map((p, i) => <Fragment key={i}>{p}</Fragment>);
}

/** Same rule, for places that need a plain string (clipboard text, meta tags). */
export function stripEmphasis(text: string): string {
  return text.replace(BOLD, "$1");
}
