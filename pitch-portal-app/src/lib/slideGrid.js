// Packs agent-described slide regions onto a 12-column grid. The agent names
// kinds and spans; this module decides x/y/w/h so two regions cannot overlap
// and nothing sits outside the body band.

import { DEFAULT_SPAN, REGION_KINDS } from "./designContract.js";

export const BODY = { x: 0.36, y: 1.62, w: 12.48, h: 4.86 };
const GAP = 0.2;

function spanOf(region) {
  const kind = String(region.kind || "").toLowerCase();
  const asked = Number(region.span);
  const fallback = DEFAULT_SPAN[kind] || 6;
  const n = Number.isFinite(asked) && asked >= 3 ? asked : fallback;
  return Math.min(12, Math.max(3, Math.round(n)));
}

function kindOf(region) {
  const kind = String(region.kind || "").toLowerCase();
  return REGION_KINDS.includes(kind) ? kind : "pair";
}

export function packRegions(regions) {
  const list = (Array.isArray(regions) ? regions : [])
    .filter(Boolean)
    .slice(0, 6)
    .map((r) => ({ ...r, kind: kindOf(r), span: spanOf(r) }));
  if (!list.length) return [];

  const rows = [];
  let current = [];
  let used = 0;
  for (const region of list) {
    if (current.length && used + region.span > 12) {
      rows.push(current);
      current = [];
      used = 0;
    }
    current.push(region);
    used += region.span;
  }
  if (current.length) rows.push(current);

  const rowH = (BODY.h - (rows.length - 1) * GAP) / rows.length;
  const placed = [];
  rows.forEach((row, ri) => {
    const y = BODY.y + ri * (rowH + GAP);
    const totalSpan = row.reduce((s, r) => s + r.span, 0) || 12;
    const inner = BODY.w - (row.length - 1) * GAP;
    let x = BODY.x;
    row.forEach((region) => {
      const w = (region.span / totalSpan) * inner;
      placed.push({ x, y, w, h: rowH, region });
      x += w + GAP;
    });
  });
  return placed;
}

export function regionsOverlap(placed) {
  for (let i = 0; i < placed.length; i += 1) {
    for (let j = i + 1; j < placed.length; j += 1) {
      const a = placed[i];
      const b = placed[j];
      if (a.x < b.x + b.w - 0.02 && a.x + a.w > b.x + 0.02 && a.y < b.y + b.h - 0.02 && a.y + a.h > b.y + 0.02) {
        return true;
      }
    }
  }
  return false;
}

export function outsideBody(placed) {
  return placed.some(
    (p) =>
      p.x < BODY.x - 0.02 ||
      p.y < BODY.y - 0.02 ||
      p.x + p.w > BODY.x + BODY.w + 0.02 ||
      p.y + p.h > BODY.y + BODY.h + 0.02
  );
}
