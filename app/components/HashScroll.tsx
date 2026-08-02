"use client";

import { useEffect } from "react";

// ============================================================================
// Re-applies the #hash scroll after hydration.
//
// A deep link like
//   /learn/centrifugal-pump-motor-protection/#fm-centrifugal-pump-deadhead
// asks the browser to scroll during parse, before React has hydrated. On the
// App Router that scroll can be lost: the target may not be in the DOM yet on
// a slow first paint, and the router manages scroll position itself once it
// takes over. Re-issuing it on mount costs a no-op when the browser already
// got it right, which is the common case.
//
// NOT VERIFIED IN A REAL BROWSER. The preview pane available when this was
// written did not composite frames, so window.scrollY read 0 even for a plain
// window.scrollTo() — scroll position could not be measured at all. What was
// verified there: the target element exists, :target matches it, and the
// 96px scroll-margin and flash animation are applied. Someone with a real
// browser should confirm the landing position and delete this component if the
// browser was handling it correctly on its own.
//
// The second pass covers late reflow. Web fonts settle after first paint, and
// Thai text in Sarabun reflows enough on a long article to move a table row
// well out of position.
// ============================================================================

export default function HashScroll() {
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.length < 2) return;

    let id: string;
    try {
      id = decodeURIComponent(hash.slice(1));
    } catch {
      return; // malformed percent-encoding in a pasted link
    }

    const scroll = () => {
      const el = document.getElementById(id);
      // scrollIntoView honours the scroll-margin-top set in globals.css, which
      // is what clears the sticky header.
      //
      // "instant", not "auto": globals.css sets `scroll-behavior: smooth` on
      // <html>, and "auto" defers to that. A slow animated crawl from the top
      // of an 8,000px article on first load reads as the page being broken —
      // arriving already in position is what a browser does natively.
      if (el) el.scrollIntoView({ block: "start", behavior: "instant" });
      return Boolean(el);
    };

    if (!scroll()) return;

    const settle = window.setTimeout(scroll, 300);
    document.fonts?.ready.then(scroll).catch(() => {});

    return () => window.clearTimeout(settle);
  }, []);

  return null;
}
