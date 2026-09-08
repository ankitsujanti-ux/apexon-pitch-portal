import fs from "fs";
import path from "path";
import { sanitizeScreen } from "../lib/sanitizeScreen.js";
import { toSentences } from "../lib/text.js";

const src = process.argv[2];
const dest = process.argv[3];
if (!src || !dest) {
  console.error("usage: node compile-saved-mockup.mjs <in.html> <out.html>");
  process.exit(1);
}

function extractInner(html, openIndex, openLen) {
  let i = openIndex + openLen;
  let depth = 1;
  const start = i;
  while (i < html.length && depth > 0) {
    const next = html.slice(i).match(/<\/?div\b[^>]*>/i);
    if (!next) break;
    i += html.slice(i).indexOf(next[0]);
    if (/^<\/div/i.test(next[0])) depth -= 1;
    else depth += 1;
    if (depth > 0) i += next[0].length;
  }
  return { inner: html.slice(start, i), end: i };
}

let html = fs.readFileSync(src, "utf8");
const re = /<div class="screen">/g;
const replacements = [];
let m;
while ((m = re.exec(html))) {
  const { inner, end } = extractInner(html, m.index, m[0].length);
  const cleaned = sanitizeScreen(inner.trim(), { tabId: `tab${replacements.length}` });
  if (!cleaned.ok) {
    console.error(`screen ${replacements.length} rejected: ${cleaned.reason}`);
    process.exit(1);
  }
  replacements.push({ start: m.index + m[0].length, end, html: cleaned.html, ok: /workspace-hero/.test(cleaned.html) });
}

for (let i = replacements.length - 1; i >= 0; i--) {
  const r = replacements[i];
  html = html.slice(0, r.start) + r.html + html.slice(r.end);
}

html = html.replace(/<span class="ev-note">[\s\S]*?<\/span>/, (full) => {
  const text = full.replace(/<[^>]+>/g, "");
  return `<span class="ev-note">${toSentences(text, 160)}</span>`;
});

const extraCss = `
  .stage.custom { display: flex; flex-direction: column; position: relative; min-height: 0; }
  .stage.custom > .screen { flex: 1; min-height: 0; display: flex; flex-direction: column; overflow: hidden; }
  .workspace { flex: 1; min-height: 0; display: grid; grid-template-rows: auto 1fr; gap: 12px; }
  .workspace-metrics { flex: none; }
  .workspace-metrics .kpis { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; }
  .workspace-metrics .kpi h4 { margin: 0 0 4px; }
  .workspace-metrics .kpi p { margin: 0; color: var(--muted); font-size: var(--fs-small); line-height: 1.35; }
  .workspace-metrics .kpi b { display: block; font-size: var(--fs-value); font-weight: 800; color: var(--heading); letter-spacing: -0.4px; line-height: 1.1; }
  .workspace-body { min-height: 0; display: grid; grid-template-columns: minmax(0, 1.4fr) minmax(260px, 0.9fr); gap: 12px; }
  .workspace-body.solo { grid-template-columns: 1fr; }
  .workspace-hero, .workspace-rail { min-height: 0; overflow: auto; display: flex; flex-direction: column; gap: 10px; }
  .workspace-hero > h3, .workspace-rail > h3 { margin: 0; font-size: var(--fs-h3); color: #d7deea; }
  .workspace-hero > .viz, .workspace-hero > article { flex: 1; min-height: 0; overflow: auto; }
  .workspace-rail > * { flex: none; min-height: 0; }
  .workspace td .cell, .workspace th .cell, .workspace td .heat, .workspace th .heat { display: inline-flex; padding: 3px 8px; min-height: 0; font-size: var(--fs-micro); }
  .workspace button { background: var(--accent); color: #fff; border: 0; padding: 8px 12px; border-radius: 8px; font-size: var(--fs-small); font-weight: 700; cursor: pointer; align-self: flex-start; }
  .row { display: grid; grid-template-columns: minmax(0, 1.3fr) minmax(0, 0.9fr); gap: 12px; min-height: 0; align-content: start; }
  .row > :nth-child(n+3) { grid-column: 1 / -1; }
  .board { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 8px; min-height: 0; align-content: start; }
  .board > * { background: #0b1220; border-radius: 10px; padding: 10px; display: flex; flex-direction: column; gap: 8px; min-height: 0; border: 1px solid #243556; }
  .queue > * { display: flex; gap: 10px; align-items: center; background: #0b1220; border-radius: 8px; padding: 10px; }
  .workspace .queue { height: auto; }
  .matrix { display: block; min-height: 0; }
`;

html = html.replace("</style>", `${extraCss}\n</style>`);

fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.writeFileSync(dest, html);
console.log(`wrote ${dest}`);
replacements.forEach((r, i) => console.log(`tab ${i}: workspace=${r.ok} chars=${r.html.length}`));
