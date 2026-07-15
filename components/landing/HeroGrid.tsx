"use client";

import { useEffect, useRef } from "react";

export default function HeroGrid() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const cols = 12;
    const rows = 8;
    const rects: string[] = [];
    const w = 100 / cols;
    const h = 100 / rows;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        rects.push(
          `<rect class="grid-cell" x="${c * w}%" y="${r * h}%" width="${w}%" height="${h}%" rx="2" />`
        );
      }
    }

    el.innerHTML = `<svg viewBox="0 0 100 100" preserveAspectRatio="none">${rects.join("")}</svg>`;
  }, []);

  return <div ref={ref} className="animated-grid" />;
}
