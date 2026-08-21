// Interactive HTML mockup — horizontal tabs, no page scroll. Each screen
// explains what it shows, why it matters, and what to do, then paints a
// layout chosen for this brief.

import { getPalette } from "../lib/palette.js";
import { dashboardCopy } from "../lib/fallbacks.js";
import { logoDataUri as apexonWordmark } from "../lib/templateTheme.js";
import { platformFromRequirement } from "../lib/briefFirst.js";

function escapeHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function shortLabel(title) {
  const clean = String(title || "Use case").replace(/[\u201C\u201D]/g, '"').trim();
  const first = clean.split(/[:—–|-]/)[0].trim();
  if (first.length <= 26) return first;
  return first.slice(0, 24).replace(/\s+\S*$/, "") + "...";
}

function twoLine(text) {
  const clean = String(text || "").replace(/\s+/g, " ").trim();
  if (!clean) return "Shown for leadership walkthrough.<br/>Sample data only.";
  const parts = clean.split(/(?<=\.)\s+/).filter(Boolean);
  if (parts.length >= 2) return `${escapeHtml(parts[0])}<br/>${escapeHtml(parts[1])}`;
  if (clean.length < 90) return `${escapeHtml(clean)}<br/>Sample data — not a live company feed.`;
  return `${escapeHtml(clean.slice(0, 88).replace(/\s+\S*$/, ""))}.<br/>Sample data — not a live company feed.`;
}

const PIECES = ["kpis", "bars", "alerts", "table", "heat", "record", "actions", "flow", "compare", "timeline", "entities"];

const LEGACY = {
  live: ["kpis", "bars", "alerts"],
  profile: ["record", "actions"],
  heat: ["kpis", "heat"],
  table: ["kpis", "table"],
  flow: ["kpis", "flow"],
};

const INFER_BY_INDEX = [
  ["alerts", "table"],
  ["record", "actions"],
  ["heat", "entities"],
  ["compare", "timeline"],
  ["timeline", "flow"],
];

function inferPieces(useCase, index = 0) {
  const t = `${useCase.title} ${useCase.businessProblem} ${useCase.solutionFit || ""}`.toLowerCase();
  if (/compare|before|after|vs/.test(t)) return ["compare", "actions"];
  if (/hold|exception|queue/.test(t)) return ["alerts", "table"];
  if (/lab|release|360|customer|profile|brief|recommend/.test(t)) return ["record", "actions"];
  if (/drift|density|section|coverage|zone|plant|line/.test(t)) return ["heat", "kpis"];
  if (/inventory|demand|forecast|price|warehouse|stock/.test(t)) return ["table", "entities"];
  if (/trace|lineage|recall|audit|path|journey/.test(t)) return ["timeline", "flow"];
  return INFER_BY_INDEX[index % INFER_BY_INDEX.length];
}

function normalizePieces(useCase, index = 0) {
  let blocks = Array.isArray(useCase.blocks) ? useCase.blocks.map((b) => String(b).toLowerCase().trim()) : [];
  if (blocks.length === 1 && LEGACY[blocks[0]]) blocks = LEGACY[blocks[0]];
  blocks = blocks.filter((b) => PIECES.includes(b)).slice(0, 3);
  if (!blocks.length) blocks = inferPieces(useCase, index);
  return blocks;
}

export function assignLayouts(useCases) {
  const used = new Set();
  return (useCases || []).map((uc, i) => {
    let blocks = normalizePieces(uc, i);
    let key = blocks.join("+");
    if (used.has(key)) {
      const extra = PIECES.find((p) => !blocks.includes(p) && p !== "kpis");
      if (extra) blocks = [...blocks.slice(0, 2), extra].slice(0, 3);
      key = blocks.join("+");
    }
    used.add(key);
    return blocks;
  });
}

function kpiRow({ copy, useCase, tabId, count = 4 }) {
  const kpiSource = (useCase.kpis && useCase.kpis.length ? useCase.kpis : copy.kpis).slice(0, count);
  return `<div class="kpis">${kpiSource
    .map((k, i) => {
      const value = copy.kpis[i]?.value || ["18", "96%", "42h", "Healthy"][i] || "—";
      const label = k.name || k.label || "Metric";
      const why = k.why || copy.kpis[i]?.why || "A leadership metric for this use case.";
      return `<article class="kpi">
        <button class="info" type="button" onclick="toggleInfo('${tabId}-k${i}')" aria-label="About this metric">i</button>
        <div id="${tabId}-k${i}" class="pop">${twoLine(why)}</div>
        <div class="kpi-value" data-kpi="${i === 0 ? "a" : i === 1 ? "b" : "x"}">${escapeHtml(value)}</div>
        <div class="kpi-label">${escapeHtml(label)}</div>
      </article>`;
    })
    .join("")}</div>`;
}

// This is a product mock, not the pitch deck. The deck carries the business
// case; here we show what the working screen looks like with one short caption.
function screenCaption(useCase) {
  const raw = String(useCase.whatItShows || useCase.lookFirst || useCase.title || "").replace(/\s+/g, " ").trim();
  const first = raw.split(/(?<=\.)\s+/)[0] || raw;
  const caption = first.length > 132 ? `${first.slice(0, 130).replace(/\s+\S*$/, "")}...` : first;
  return caption ? `<p class="caption">${escapeHtml(caption)}</p>` : "";
}

function pieceBars({ copy, tabId, title }) {
  const bars = copy.bars
    .map(
      (b) =>
        `<div class="bar-row"><span class="nm">${escapeHtml(b.label.split(" ")[0])}</span><span class="track"><span class="fill" style="width:${Math.max(8, Math.round((b.w / 210) * 100))}%;background:${b.color}"></span></span><span class="vv">${escapeHtml(b.label.replace(/^[^\d%]*/, ""))}</span></div>`
    )
    .join("");
  return `<article class="viz">
    <button class="info" type="button" onclick="toggleInfo('${tabId}-bars')">i</button>
    <div id="${tabId}-bars" class="pop">${twoLine("Status mix for this job. Read the labels, not color alone.")}</div>
    <h3>${escapeHtml(title)}</h3>
    <div class="bars">${bars}</div>
  </article>`;
}

function pieceAlerts({ copy, tabId }) {
  const alerts = copy.feed
    .slice(0, 3)
    .map(
      ([k, label, text]) =>
        `<div class="alert ${k}"><span class="pill ${k}">${escapeHtml(label)}</span><span>${escapeHtml(text)}</span></div>`
    )
    .join("");
  return `<article class="side">
    <h3>Needs a person</h3>
    <div class="alerts" data-feed>${alerts}</div>
  </article>`;
}

function pieceRecord({ copy, useCase, tabId, companyName }) {
  const initials = companyName.replace(/[^A-Za-z]/g, "").slice(0, 2).toUpperCase() || "UC";
  const kind = useCase.recordKind || useCase.lookFirst || useCase.title.split(/[—–-]/)[0].trim();
  const data = typeof useCase.dataPointer === "object" ? useCase.dataPointer.description : useCase.dataPointer;
  return `<article class="viz">
    <button class="info" type="button" onclick="toggleInfo('${tabId}-rec')">i</button>
    <div id="${tabId}-rec" class="pop">${twoLine("One record, previously split across systems. Sample only.")}</div>
    <h3>${escapeHtml(kind)}</h3>
    <div class="fan">
      <div class="avatar">${escapeHtml(initials)}</div>
      <div>
        <div class="kpi-value" style="font-size:20px">${escapeHtml(kind)}</div>
        <div class="meta">${escapeHtml(companyName)} · sample record</div>
      </div>
    </div>
    <div class="attr">
      <div><span>Status</span><b>${escapeHtml(copy.kpis[0]?.value || "Open")}</b></div>
      <div><span>Feed</span><b>${escapeHtml(copy.kpis[3]?.label || "Healthy")}</b></div>
      <div><span>Data</span><b>${escapeHtml(data || "Operational")}</b></div>
      <div><span>Updated</span><b>2 min ago</b></div>
    </div>
  </article>`;
}

function pieceActions({ copy, tabId }) {
  const actions = copy.feed
    .slice(0, 4)
    .map(
      ([k, label, text], i) =>
        `<li class="nba"><span class="pill ${k}">${escapeHtml(label)}</span><span>${escapeHtml(text)}</span><span class="conf">${92 - i * 7}%</span></li>`
    )
    .join("");
  return `<article class="side">
    <h3>Next actions</h3>
    <ul class="nba-list" data-feed>${actions}</ul>
  </article>`;
}

function pieceHeat({ useCase, tabId }) {
  const zones = (useCase.zones && useCase.zones.length ? useCase.zones : ["Zone A", "Zone B", "Zone C", "Zone D", "Zone E", "Zone F"]).slice(0, 6);
  const tones = ["good", "warn", "good", "bad", "warn", "good"];
  const labels = ["Clear", "Watch", "Clear", "Act", "Watch", "Clear"];
  return `<article class="viz">
    <button class="info" type="button" onclick="toggleInfo('${tabId}-heat')">i</button>
    <div id="${tabId}-heat" class="pop">${twoLine("Each cell is an area in this operation. Green is fine, amber needs a look, red needs a person.")}</div>
    <h3>${escapeHtml(useCase.lookFirst || "Where to look")}</h3>
    <div class="heat">${zones
      .map((z, i) => `<div class="cell ${tones[i]}">${escapeHtml(z)}<small>${labels[i]}</small></div>`)
      .join("")}</div>
  </article>`;
}

function pieceTable({ copy, useCase, tabId }) {
  const cols = (useCase.columns && useCase.columns.length ? useCase.columns : ["Record", "Status", "Guidance", "Next step"]).slice(0, 4);
  while (cols.length < 4) cols.push(["Record", "Status", "Guidance", "Next"][cols.length]);
  const extra = ["Hold", "Release", "Watch", "Ship"];
  const next = ["Owner assigned", "Wait on lab", "Buffer OK", "Ready"];
  const rows = copy.feed.slice(0, 4).map(([k, label, text], i) => {
    const item = text.split(/[—–.]/)[0].slice(0, 42);
    return `<tr>
      <td>${escapeHtml(item || `Record ${i + 1}`)}</td>
      <td><span class="pill ${k}">${escapeHtml(label)}</span></td>
      <td>${escapeHtml(extra[i])}</td>
      <td>${escapeHtml(next[i])}</td>
    </tr>`;
  }).join("");
  return `<article class="viz">
    <button class="info" type="button" onclick="toggleInfo('${tabId}-tbl')">i</button>
    <div id="${tabId}-tbl" class="pop">${twoLine("Working list for this job. Status first, then the move.")}</div>
    <h3>${escapeHtml(useCase.lookFirst || "What needs a decision")}</h3>
    <table>
      <thead><tr>${cols.map((c) => `<th>${escapeHtml(c)}</th>`).join("")}</tr></thead>
      <tbody data-feed>${rows}</tbody>
    </table>
  </article>`;
}

function pieceFlow({ useCase, tabId, platformName }) {
  const raw = typeof useCase.dataPointer === "object" ? useCase.dataPointer.description : useCase.dataPointer;
  const sourceLabel = String(raw || "Existing systems");
  const mid = (useCase.techComponents && useCase.techComponents[0]) || platformName || "Operating platform";
  return `<article class="viz">
    <button class="info" type="button" onclick="toggleInfo('${tabId}-flow')">i</button>
    <div id="${tabId}-flow" class="pop">${twoLine("Work moves from systems they already run into one operating view. Sample only.")}</div>
    <h3>${escapeHtml(useCase.lookFirst || "How this lands")}</h3>
    <div class="flow">
      <div class="node keep"><div class="h">What they already run</div><div class="s">${escapeHtml(sourceLabel)}</div></div>
      <div class="arrow">→</div>
      <div class="node mid"><div class="h">${escapeHtml(mid)}</div><div class="s">${escapeHtml((useCase.techComponents || []).slice(1, 3).join(" · ") || "Governed join")}</div></div>
      <div class="arrow">→</div>
      <div class="node out"><div class="h">What they see</div><div class="s">${escapeHtml(useCase.benefit || "A live operating view")}</div></div>
    </div>
  </article>`;
}

function pieceCompare({ useCase, tabId }) {
  return `<article class="viz">
    <button class="info" type="button" onclick="toggleInfo('${tabId}-cmp')">i</button>
    <div id="${tabId}-cmp" class="pop">${twoLine("Left is how this job runs today. Right is the move this brief enables.")}</div>
    <h3>Today vs the move</h3>
    <div class="compare">
      <div class="col before"><h4>Today</h4><p>${escapeHtml(useCase.businessProblem || "Work is split across systems.")}</p></div>
      <div class="col after"><h4>The move</h4><p>${escapeHtml(useCase.benefit || useCase.action || "One view they can act on.")}</p></div>
    </div>
  </article>`;
}

function pieceTimeline({ useCase, tabId }) {
  const steps = (useCase.steps && useCase.steps.length
    ? useCase.steps
    : ["See the exception", "Assign an owner", "Act in the window", "Close the loop"]).slice(0, 4);
  return `<article class="viz">
    <button class="info" type="button" onclick="toggleInfo('${tabId}-tl')">i</button>
    <div id="${tabId}-tl" class="pop">${twoLine("The operating path for this job. Follow left to right.")}</div>
    <h3>${escapeHtml(useCase.lookFirst || "How the job runs")}</h3>
    <ol class="timeline">${steps
      .map((s, i) => `<li><span>${i + 1}</span><b>${escapeHtml(s)}</b></li>`)
      .join("")}</ol>
  </article>`;
}

function pieceEntities({ useCase, companyName, tabId }) {
  const items = (useCase.entities && useCase.entities.length
    ? useCase.entities
    : [companyName, useCase.recordKind || "Record", "Owner", "Shift"]).slice(0, 6);
  return `<article class="viz">
    <button class="info" type="button" onclick="toggleInfo('${tabId}-ent')">i</button>
    <div id="${tabId}-ent" class="pop">${twoLine("Objects this team already knows. Tiles are labels, not product logos.")}</div>
    <h3>${escapeHtml(useCase.lookFirst || "What this screen works on")}</h3>
    <div class="entities">${items
      .map((name) => {
        const initials = String(name).replace(/[^A-Za-z]/g, "").slice(0, 2).toUpperCase() || "•";
        return `<div class="entity"><span>${escapeHtml(initials)}</span><b>${escapeHtml(name)}</b></div>`;
      })
      .join("")}</div>
  </article>`;
}

function renderPiece(name, ctx) {
  if (name === "kpis") return kpiRow(ctx);
  if (name === "bars") return pieceBars({ ...ctx, title: ctx.useCase.lookFirst || "Status mix" });
  if (name === "alerts") return pieceAlerts(ctx);
  if (name === "record") return pieceRecord(ctx);
  if (name === "actions") return pieceActions(ctx);
  if (name === "heat") return pieceHeat(ctx);
  if (name === "table") return pieceTable(ctx);
  if (name === "flow") return pieceFlow(ctx);
  if (name === "compare") return pieceCompare(ctx);
  if (name === "timeline") return pieceTimeline(ctx);
  if (name === "entities") return pieceEntities(ctx);
  return "";
}

function tabInner({ companyName, domain, useCase, tabId, index, total, layout, platformName }) {
  const copy = dashboardCopy(companyName, domain, useCase);
  const blocks = Array.isArray(layout) ? layout : normalizePieces(useCase, index);
  const ctx = { copy, useCase, tabId, companyName, domain, platformName };
  const visuals = blocks.filter((b) => b !== "kpis");
  const kpis = blocks.includes("kpis") ? kpiRow(ctx) : "";
  const panels = visuals.map((name) => renderPiece(name, ctx)).join("");
  const stage =
    visuals.length >= 2
      ? `<div class="stage with-side">${panels}</div>`
      : panels;

  return `<section class="view-body" data-live="${escapeHtml(copy.event)}" data-layout="${escapeHtml(blocks.join("+"))}">
    <div class="title-row">
      <div>
        <p class="kicker">Screen ${index + 1} of ${total} · ${escapeHtml(useCase.lookFirst || domain)}</p>
        <h2>${escapeHtml(useCase.title)}</h2>
        ${useCase.subtitle ? `<p class="sub">${escapeHtml(useCase.subtitle)}</p>` : ""}
      </div>
      <button class="primary" type="button">${escapeHtml(copy.button || "Simulate an event")}</button>
    </div>
    ${screenCaption(useCase)}
    ${kpis}
    ${stage}
  </section>`;
}

export async function buildMockup({ companyName, domain, requirement = "", topUseCases, palette, deckFileName, evidenceNote = "" }) {
  if (!companyName || !domain || !Array.isArray(topUseCases) || topUseCases.length === 0) {
    throw new Error("buildMockup requires companyName, domain, and a non-empty topUseCases array");
  }

  const colors = palette || getPalette(domain, companyName);
  const tabs = topUseCases.slice(0, 5);
  const layouts = assignLayouts(tabs);
  const apexonSrc = apexonWordmark();
  const platform = platformFromRequirement(requirement, domain);
  const platformName = platform.name === "Target platform" ? "" : platform.name;
  const footerLine = platformName
    ? `${platform.name} · ${platform.components.slice(0, 2).join(" · ")}`
    : "Apexon walkthrough · sample data";
  const nav = tabs
    .map(
      (uc, i) =>
        `<button id="btn-tab-${i}" class="tab${i === 0 ? " active" : ""}" type="button" onclick="showTab('tab-${i}')">${escapeHtml(shortLabel(uc.title))}</button>`
    )
    .join("");
  const panels = tabs
    .map(
      (uc, i) =>
        `<div id="tab-${i}" class="view${i === 0 ? " active" : ""}">${tabInner({
          companyName,
          domain,
          useCase: uc,
          tabId: `tab-${i}`,
          index: i,
          total: tabs.length,
          layout: layouts[i],
          platformName,
        })}</div>`
    )
    .join("");
  const deckLink = deckFileName
    ? `<a class="header-link" href="${escapeHtml(deckFileName)}">Download presentation</a>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${escapeHtml(companyName)} | ${escapeHtml(domain)} walkthrough</title>
<style>
  :root {
    --navy: #${colors.primary};
    --navy2: #${colors.dark};
    --card: #${colors.card};
    --accent: #${colors.accent};
    --blue: #${colors.cardBorder};
    --blue60: #75A2ED;
    --heading: #${colors.heading};
    --muted: #9AA6B8;
    /* One type scale for the whole page — no ad-hoc font sizes. */
    --fs-h2: 20px;
    --fs-h3: 13.5px;
    --fs-body: 13px;
    --fs-small: 12px;
    --fs-kicker: 10.5px;
    --fs-micro: 11px;
    --fs-value: 26px;
  }
  * { box-sizing: border-box; }
  html, body { margin: 0; height: 100%; overflow: hidden; }
  body {
    font-family: Arial, Helvetica, sans-serif;
    background: var(--navy2);
    color: #fff;
    height: 100vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  header {
    flex: 0 0 52px;
    display: flex; align-items: center; justify-content: space-between; gap: 16px;
    padding: 0 22px; background: linear-gradient(90deg, var(--navy), var(--navy2));
    color: #fff;
  }
  .brand { display: flex; align-items: center; gap: 12px; min-width: 0; }
  .brand img { height: 22px; width: auto; display: block; }
  .hub { color: var(--blue60); font-size: var(--fs-small); border-left: 1px solid rgba(255,255,255,.2); padding-left: 12px; line-height: 1.25; }
  .hub b { color: #fff; }
  .header-link {
    color: #fff; text-decoration: none; border: 1px solid rgba(117,162,237,.4);
    background: rgba(29,110,228,.18); padding: 6px 12px; border-radius: 999px; font-size: var(--fs-small); font-weight: 700;
  }
  nav.tabs {
    flex: 0 0 46px;
    background: #0f1830;
    display: flex; align-items: stretch;
    padding: 0 14px;
    overflow: hidden;
  }
  .tab {
    color: #b9c2d6; padding: 0 16px; font-size: var(--fs-h3); font-weight: 700;
    cursor: pointer; border: 0; background: none; border-bottom: 3px solid transparent;
    /* Tabs share the bar and ellipsis instead of clipping mid-word. */
    flex: 1 1 0; min-width: 0; max-width: 240px;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-align: center;
  }
  .tab:hover { color: #fff; }
  .tab.active { color: #fff; border-bottom-color: var(--accent); }
  .sample {
    flex: 0 0 28px; margin: 0; padding: 0 22px; display: flex; align-items: center; gap: 8px;
    color: var(--muted); font-size: var(--fs-small); background: #0a1220;
  }
  .sample b { color: var(--accent); }
  .ev-note { color: #7d8ba3; border-left: 1px solid #2d3f63; padding-left: 8px; margin-left: 4px; }
  .page-info { position: relative; }
  main {
    flex: 1; min-height: 0; overflow: hidden;
    padding: 10px 22px 8px;
    display: flex; flex-direction: column;
    max-width: 1220px; width: 100%; margin: 0 auto;
  }
  .view { display: none; flex: 1; min-height: 0; overflow: hidden; }
  .view.active { display: flex; flex-direction: column; }
  .view-body { flex: 1; min-height: 0; display: flex; flex-direction: column; overflow: hidden; gap: 10px; }
  .title-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; flex: none; }
  .kicker { margin: 0 0 4px; color: var(--accent); font-size: var(--fs-micro); font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; }
  h2 { margin: 0; font-size: var(--fs-h2); line-height: 1.25; font-weight: 700; }
  .sub { margin: 3px 0 0; color: var(--accent); font-size: var(--fs-body); font-weight: 700; }
  .caption { margin: 0; color: var(--muted); font-size: var(--fs-body); line-height: 1.45; max-width: 96ch; flex: none; }
  .kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; flex: none; }
  .kpi, .viz, .side {
    background: var(--card); border: 1px solid var(--blue); border-radius: 12px;
    padding: 12px 14px; position: relative;
  }
  .kpi-value { font-size: var(--fs-value); font-weight: 800; color: var(--heading); letter-spacing: -0.4px; }
  .kpi-label { margin: 4px 0 0; color: var(--muted); font-size: var(--fs-small); font-weight: 700; }
  .viz h3, .side h3 { margin: 0 0 8px; padding-right: 22px; color: #d7deea; font-size: var(--fs-h3); font-weight: 700; }
  .stage { flex: 1; min-height: 0; display: grid; gap: 12px; }
  .stage.with-side { grid-template-columns: 1.35fr 0.85fr; }
  .viz, .side { min-height: 0; overflow: hidden; }
  .bar-row { display: flex; align-items: center; gap: 10px; margin: 10px 0; font-size: var(--fs-body); }
  .nm { width: 72px; flex: none; color: #d7deea; }
  .track { flex: 1; height: 14px; background: #0b1220; border-radius: 8px; overflow: hidden; }
  .fill { display: block; height: 100%; border-radius: 8px; }
  .vv { width: 48px; text-align: right; font-weight: 700; color: var(--heading); }
  .feed, .nba-list { list-style: none; margin: 0; padding: 0; }
  .feed li, .nba { display: flex; gap: 10px; align-items: flex-start; padding: 8px 0; border-bottom: 1px solid #243556; font-size: var(--fs-body); }
  .feed li:last-child, .nba:last-child { border-bottom: 0; }
  .conf { margin-left: auto; font-size: var(--fs-micro); font-weight: 700; color: var(--blue60); white-space: nowrap; }
  .fan { display: flex; gap: 12px; align-items: center; }
  .avatar {
    width: 48px; height: 48px; border-radius: 50%; flex: none;
    display: grid; place-items: center; font-weight: 800; background: #1D6EE4; color: #fff;
  }
  .meta { color: var(--muted); font-size: var(--fs-small); margin-top: 4px; }
  .attr { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 14px; margin-top: 12px; font-size: var(--fs-small); }
  .attr span { color: var(--muted); display: block; font-size: var(--fs-micro); }
  .heat { display: grid; grid-template-columns: repeat(6, 1fr); gap: 6px; }
  .cell { border-radius: 7px; padding: 12px 6px; text-align: center; font-size: var(--fs-small); font-weight: 700; }
  .cell small { display: block; font-weight: 600; margin-top: 4px; opacity: .9; }
  .cell.good { background: #0e7c66; color: #fff; }
  .cell.warn { background: #b8860b; color: #fff; }
  .cell.bad { background: #E54A24; color: #fff; }
  .flow { display: flex; align-items: stretch; gap: 8px; }
  .node { flex: 1; border: 1.5px solid #243556; border-radius: 10px; padding: 12px; background: #0b1220; }
  .node .h { font-weight: 800; font-size: var(--fs-body); }
  .node .s { font-size: var(--fs-small); color: var(--muted); margin-top: 4px; }
  .node.mid { border-color: var(--blue); background: #102a4a; }
  .node.out { border-color: #0e7c66; }
  .arrow { display: grid; place-items: center; color: var(--blue60); font-size: var(--fs-h2); font-weight: 800; }
  .compare { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; height: calc(100% - 28px); }
  .compare .col { background: #0b1220; border-radius: 10px; padding: 12px; border: 1px solid #243556; }
  .compare h4 { margin: 0 0 8px; font-size: var(--fs-small); letter-spacing: .08em; text-transform: uppercase; }
  .compare .before h4 { color: #ffd48a; }
  .compare .after h4 { color: #7ddea0; }
  .compare p { margin: 0; color: #d7deea; font-size: var(--fs-body); line-height: 1.4; }
  .timeline { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
  .timeline li { background: #0b1220; border-radius: 10px; padding: 12px; min-height: 0; }
  .timeline span { display: grid; place-items: center; width: 22px; height: 22px; border-radius: 50%; background: var(--accent); font-size: var(--fs-small); font-weight: 800; margin-bottom: 8px; }
  .entities { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
  .entity { display: flex; gap: 10px; align-items: center; background: #0b1220; border-radius: 10px; padding: 10px; }
  .entity span { width: 32px; height: 32px; border-radius: 8px; display: grid; place-items: center; background: #1D6EE4; font-weight: 800; font-size: var(--fs-small); flex: none; }
  .alert { display: flex; gap: 8px; padding: 8px; border-radius: 8px; margin-bottom: 8px; font-size: var(--fs-small); border-left: 4px solid; }
  .alert.good { background: #16351f; border-color: #7ddea0; }
  .alert.warn { background: #3a2a10; border-color: #ffd48a; }
  .alert.bad { background: #3a1515; border-color: #ff8d80; }
  table { width: 100%; border-collapse: collapse; font-size: var(--fs-body); }
  th { text-align: left; color: var(--muted); font-size: var(--fs-micro); text-transform: uppercase; padding: 6px 8px; border-bottom: 1px solid #243556; }
  td { padding: 8px; border-bottom: 1px solid #243556; }
  .pill { flex: none; border-radius: 999px; padding: 2px 8px; font-size: var(--fs-micro); font-weight: 700; }
  .good { background: #16351f; color: #7ddea0; }
  .warn { background: #3a2a10; color: #ffd48a; }
  .bad { background: #3a1515; color: #ff8d80; }
  .primary {
    background: var(--accent); color: #fff; border: 0; padding: 9px 16px;
    border-radius: 8px; font-size: var(--fs-body); font-weight: 700; cursor: pointer; white-space: nowrap;
  }
  .info {
    position: absolute; top: 8px; right: 8px; width: 18px; height: 18px; border: 0;
    border-radius: 50%; background: var(--heading); color: var(--navy2); font-weight: 700; cursor: pointer; font-size: var(--fs-micro);
  }
  .pop {
    display: none; position: absolute; right: 8px; top: 30px; z-index: 5;
    width: 230px; background: #080d18; color: #fff; font-size: var(--fs-small); line-height: 1.4;
    padding: 8px 10px; border-radius: 8px; border: 1px solid var(--blue);
  }
  .toast {
    position: fixed; right: 20px; bottom: 16px; background: #080d18; color: #fff;
    padding: 10px 14px; border-radius: 8px; z-index: 20; font-size: var(--fs-body); border: 1px solid var(--accent);
  }
  footer {
    flex: 0 0 28px; padding: 0 22px; display: flex; align-items: center; gap: 8px;
    color: var(--muted); font-size: var(--fs-micro); max-width: 1220px; width: 100%; margin: 0 auto;
  }
  footer img { height: 16px; width: auto; }
  @media (max-width: 1100px) {
    .kpis, .stage.with-side { grid-template-columns: 1fr 1fr; }
    .split { grid-template-columns: 1fr; }
    .title-row { flex-direction: column; }
  }
</style>
</head>
<body>
<header>
  <div class="brand">
    ${apexonSrc ? `<img src="${apexonSrc}" alt="Apexon" />` : "<strong>Apexon</strong>"}
    <span class="hub">${escapeHtml(domain)} walkthrough · <b>${escapeHtml(companyName)}</b></span>
  </div>
  ${deckLink}
</header>
<nav class="tabs" role="tablist">${nav}</nav>
<p class="sample">
  <span class="page-info">
    <button class="info" type="button" onclick="toggleInfo('page-i')" aria-label="About this demonstration" style="position:static">i</button>
    <span id="page-i" class="pop">Each tab is one job from this brief: what the screen shows, why it matters, and what to do next.<br/>Figures are sample only — not a live system.</span>
  </span>
  <b>Sample data</b> — walkthrough for ${escapeHtml(companyName)}. Not live company figures.${
    evidenceNote ? ` <span class="ev-note">${escapeHtml(evidenceNote)}</span>` : ""
  }
</p>
<main>${panels}</main>
<footer>${apexonSrc ? `<img src="${apexonSrc}" alt="" />` : ""} ${escapeHtml(footerLine)}</footer>
<script>
function showTab(id) {
  document.querySelectorAll('.view').forEach(function(el) { el.classList.remove('active'); });
  document.querySelectorAll('.tab').forEach(function(el) { el.classList.remove('active'); });
  var panel = document.getElementById(id);
  var btn = document.getElementById('btn-' + id);
  if (panel) panel.classList.add('active');
  if (btn) btn.classList.add('active');
}
function toggleInfo(id) {
  var el = document.getElementById(id);
  if (!el) return;
  var open = el.style.display === 'block';
  document.querySelectorAll('.pop').forEach(function(p) { p.style.display = 'none'; });
  el.style.display = open ? 'none' : 'block';
}
document.addEventListener('click', function(e) {
  if (!e.target.classList.contains('info')) {
    document.querySelectorAll('.pop').forEach(function(p) { p.style.display = 'none'; });
  }
});
document.querySelectorAll('[data-live]').forEach(function(root) {
  var points = [12,14,13,16,15,18,17];
  var aEl = root.querySelector('[data-kpi="a"]');
  var bEl = root.querySelector('[data-kpi="b"]');
  var svg = root.querySelector('.live-line');
  var feed = root.querySelector('[data-feed]');
  var btn = root.querySelector('.primary');
  var a = parseInt(String((aEl && aEl.textContent) || '12').replace(/[^0-9]/g, ''), 10);
  if (isNaN(a)) a = 12;
  function draw() {
    if (!svg) return;
    var w = 320, h = 110, max = Math.max.apply(null, points.concat([1]));
    var d = points.map(function(v,i) {
      var x = (i / (points.length - 1)) * w;
      var y = h - (v / max) * 88 - 8;
      return (i === 0 ? 'M' : 'L') + x + ',' + y;
    }).join(' ');
    svg.innerHTML = '<path d="' + d + '" fill="none" stroke="#75A2ED" stroke-width="3"></path>';
  }
  draw();
  setInterval(function() {
    a = Math.max(4, a + (Math.random() > 0.5 ? 1 : -1));
    points.push(a); if (points.length > 12) points.shift();
    if (aEl && /[0-9]/.test(aEl.textContent) && aEl.textContent.indexOf('%') === -1) aEl.textContent = String(a);
    if (bEl && String(bEl.textContent).indexOf('%') !== -1) bEl.textContent = (95 + Math.random() * 3).toFixed(1) + '%';
    draw();
  }, 2500);
  if (btn) btn.addEventListener('click', function() {
    a += 3;
    if (aEl && aEl.textContent.indexOf('%') === -1) aEl.textContent = String(a);
    if (feed) {
      var row = document.createElement(feed.tagName === 'TBODY' ? 'tr' : 'li');
      if (feed.tagName === 'TBODY') {
        row.innerHTML = '<td><span class="pill bad">Act Alert</span></td><td>' + (root.getAttribute('data-live') || 'Simulated event') + '</td>';
      } else {
        row.innerHTML = '<span class="pill bad">Act Alert</span><span>' + (root.getAttribute('data-live') || 'Simulated event') + '</span>';
      }
      feed.insertBefore(row, feed.firstChild);
    }
    var toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = 'Event simulated. The view updated.';
    document.body.appendChild(toast);
    setTimeout(function() { toast.remove(); }, 2200);
  });
});
</script>
</body>
</html>`;
}
