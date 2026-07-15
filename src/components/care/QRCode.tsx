import type { JSX } from "react";

// Deterministic decorative QR-style placeholder (not a real scanable QR).
export function QRPlaceholder({ value, size = 160 }: { value: string; size?: number }) {
  const cells = 21;
  let h = 0;
  for (let i = 0; i < value.length; i++) h = (h * 31 + value.charCodeAt(i)) >>> 0;
  const filled: boolean[] = [];
  for (let i = 0; i < cells * cells; i++) {
    h = (h * 1103515245 + 12345) >>> 0;
    filled.push(((h >> 8) & 1) === 1);
  }
  const isFinder = (r: number, c: number) => {
    const inBox = (br: number, bc: number) =>
      r >= br && r < br + 7 && c >= bc && c < bc + 7 &&
      (r === br || r === br + 6 || c === bc || c === bc + 6 ||
        (r >= br + 2 && r <= br + 4 && c >= bc + 2 && c <= bc + 4));
    return inBox(0, 0) || inBox(0, cells - 7) || inBox(cells - 7, 0);
  };
  const isFinderArea = (r: number, c: number) =>
    (r < 8 && c < 8) || (r < 8 && c >= cells - 8) || (r >= cells - 8 && c < 8);

  const cell = size / cells;
  const rects: JSX.Element[] = [];
  for (let r = 0; r < cells; r++) {
    for (let c = 0; c < cells; c++) {
      const idx = r * cells + c;
      const finder = isFinder(r, c);
      const inFinderArea = isFinderArea(r, c);
      const on = finder || (!inFinderArea && filled[idx]);
      if (on) {
        rects.push(
          <rect key={idx} x={c * cell} y={r * cell} width={cell} height={cell} rx={cell * 0.15} fill="currentColor" />,
        );
      }
    }
  }
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="text-foreground">
      <rect width={size} height={size} rx={12} fill="white" />
      <g>{rects}</g>
    </svg>
  );
}