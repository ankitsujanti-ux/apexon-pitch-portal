// Interactive HTML mockup — Hornets layout (horizontal tabs, no page scroll,
// one relevant visual per tab) on the Apexon Harness dark theme.

import { getPalette } from "../lib/palette.js";
import { dashboardCopy } from "../lib/fallbacks.js";
import { logoDataUri } from "../lib/logos.js";
import { logoDataUri as apexonWordmark } from "../lib/templateTheme.js";

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

function preferLayout(useCase) {
  const t = `${useCase.title} ${useCase.businessProblem} ${useCase.solutionFit || ""}`.toLowerCase();
  if (/hold|exception|live|pulse|queue|command|venue|wait/.test(t)) return "live";
  if (/lab|release|360|customer|profile|fan|brief|governed|recommend/.test(t)) return "profile";
  if (/drift|density|heat|section|coverage|zone/.test(t)) return "heat";
  if (/inventory|demand|forecast|price|ticket|pick|warehouse|stock/.test(t)) return "table";
  if (/trace|lineage|recall|audit|genealogy|flow/.test(t)) return "flow";
  return "";
}

export function assignLayouts(useCases) {
  const kinds = ["live", "profile", "heat", "table", "flow"];
  const used = new Set();
  return (useCases || []).map((uc, i) => {
    const asked = kinds.includes(uc.tabLayout) && !used.has(uc.tabLayout) ? uc.tabLayout : "";
    const want = asked || preferLayout(uc);
    const pick = want && !used.has(want) ? want : kinds.find((k) => !used.has(k)) || kinds[i % kinds.length];
    used.add(pick);
    return pick;
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

function tabWhyHtml(useCase, tabId) {
  const raw = useCase.tabWhy || `${useCase.businessProblem || ""} ${useCase.benefit || ""}`.trim();
  return `<p class="why">
    <button class="info" type="button" onclick="toggleInfo('${tabId}-why')" aria-label="Why this tab" style="position:static">i</button>
    <span id="${tabId}-why" class="pop">${twoLine(raw)}</span>
    ${twoLine(raw)}
  </p>`;
}

function layoutLive({ copy, useCase, tabId, companyName }) {
  const bars = copy.bars
    .map(
      (b) =>
        `<div class="bar-row"><span class="nm">${escapeHtml(b.label.split(" ")[0])}</span><span class="track"><span class="fill" style="width:${Math.max(8, Math.round((b.w / 210) * 100))}%;background:${b.color}"></span></span><span class="vv">${escapeHtml(b.label.replace(/^[^\d%]*/, ""))}</span></div>`
    )
    .join("");
  const alerts = copy.feed
    .slice(0, 3)
    .map(
      ([k, label, text]) =>
        `<div class="alert ${k}"><span class="pill ${k}">${escapeHtml(label)}</span><span>${escapeHtml(text)}</span></div>`
    )
    .join("");
  return `${kpiRow({ copy, useCase, tabId })}
    <div class="stage with-side">
      <article class="viz">
        <button class="info" type="button" onclick="toggleInfo('${tabId}-viz')">i</button>
        <div id="${tabId}-viz" class="pop">${twoLine("Live mix of what needs action now. Bars turn orange or red as risk rises.")}</div>
        <h3>Live status on the floor</h3>
        <div class="bars">${bars}</div>
      </article>
      <article class="side">
        <h3>Live alerts</h3>
        <div class="alerts" data-feed>${alerts}</div>
      </article>
    </div>`;
}

function layoutProfile({ copy, useCase, tabId, companyName }) {
  const initials = companyName.replace(/[^A-Za-z]/g, "").slice(0, 2).toUpperCase() || "UC";
  const record = useCase.title.split(/[—–-]/)[0].trim();
  const attrs = [
    ["Owner", "Operations lead"],
    ["Source", copy.kpis[3]?.label || "Feed healthy"],
    ["Status", copy.kpis[0]?.value || "Open"],
    ["Last hop", "2 min ago"],
    ["Data", (typeof useCase.dataPointer === "object" ? useCase.dataPointer.description : useCase.dataPointer) || "Operational feed"],
    ["Channel", "Plant + warehouse"],
  ];
  const actions = copy.feed
    .slice(0, 4)
    .map(
      ([k, label, text], i) =>
        `<li class="nba"><span class="pill ${k}">${escapeHtml(label)}</span><span>${escapeHtml(text)}</span><span class="conf">${92 - i * 7}%</span></li>`
    )
    .join("");
  return `<div class="stage with-side">
      <article class="viz">
        <button class="info" type="button" onclick="toggleInfo('${tabId}-viz')">i</button>
        <div id="${tabId}-viz" class="pop">${twoLine("One record, previously split across systems. Read the profile first, then the recommended next action.")}</div>
        <h3>Unified record</h3>
        <div class="fan">
          <div class="avatar">${escapeHtml(initials)}</div>
          <div>
            <div class="kpi-value" style="font-size:20px">${escapeHtml(record)}</div>
            <div class="meta">${escapeHtml(companyName)} · sample record, not a live feed</div>
          </div>
        </div>
        <div class="attr">${attrs
          .map(([k, v]) => `<div><span>${escapeHtml(k)}</span><b>${escapeHtml(v)}</b></div>`)
          .join("")}</div>
      </article>
      <article class="side">
        <h3>Next actions</h3>
        <ul class="nba-list" data-feed>${actions}</ul>
      </article>
    </div>`;
}

function layoutHeat({ copy, useCase, tabId }) {
  const zones = ["Line 1", "Line 2", "Line 3", "Pack", "Warehouse", "QA lab"];
  const tones = ["good", "warn", "good", "bad", "warn", "good"];
  const cells = zones
    .map(
      (z, i) =>
        `<div class="cell ${tones[i]}">${escapeHtml(z)}<small>${["Clear", "Watch", "Clear", "Act", "Watch", "Clear"][i]}</small></div>`
    )
    .join("");
  return `${kpiRow({ copy, useCase, tabId })}
    <article class="viz">
      <button class="info" type="button" onclick="toggleInfo('${tabId}-viz')">i</button>
      <div id="${tabId}-viz" class="pop">${twoLine("Each cell is a zone. Green is comfortable, amber is filling, red needs a person now.")}</div>
      <h3>Risk by area</h3>
      <div class="heat">${cells}</div>
    </article>`;
}

function layoutTable({ copy, useCase, tabId }) {
  const rows = copy.feed.slice(0, 4).map(([k, label, text], i) => {
    const item = text.split(/[—–.]/)[0].slice(0, 42);
    return `<tr>
      <td>${escapeHtml(item || `Record ${i + 1}`)}</td>
      <td><span class="pill ${k}">${escapeHtml(label)}</span></td>
      <td>${escapeHtml(["Hold", "Release", "Watch", "Ship"][i])}</td>
      <td>${escapeHtml(["Owner assigned", "Wait on lab", "Buffer OK", "Ready"][i])}</td>
    </tr>`;
  }).join("");
  return `${kpiRow({ copy, useCase, tabId })}
    <article class="viz">
      <button class="info" type="button" onclick="toggleInfo('${tabId}-viz')">i</button>
      <div id="${tabId}-viz" class="pop">${twoLine("Working list for this use case. Status first, then the recommended move.")}</div>
      <h3>What needs a decision</h3>
      <table>
        <thead><tr><th>Record</th><th>Status</th><th>Guidance</th><th>Next step</th></tr></thead>
        <tbody data-feed>${rows}</tbody>
      </table>
    </article>`;
}

function layoutFlow({ copy, useCase, tabId }) {
  const raw = typeof useCase.dataPointer === "object" ? useCase.dataPointer.description : useCase.dataPointer;
  const sources = String(raw || "ERP, MES, files")
    .split(/,| and | \+ /)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 3);
  const sourceLabel = sources.join(" · ") || "Existing systems";
  return `${kpiRow({ copy, useCase, tabId, count: 4 })}
    <article class="viz">
      <button class="info" type="button" onclick="toggleInfo('${tabId}-viz')">i</button>
      <div id="${tabId}-viz" class="pop">${twoLine("Nothing is replaced. Fabric reads what they already run and lands a live view plus AI.")}</div>
      <h3>How this use case lands</h3>
      <div class="flow">
        <div class="node keep"><div class="h">Sources they already have</div><div class="s">${escapeHtml(sourceLabel)}</div></div>
        <div class="arrow">→</div>
        <div class="node fabric"><div class="h">Microsoft Fabric</div><div class="s">OneLake · Real-Time Intelligence · AI</div></div>
        <div class="arrow">→</div>
        <div class="node out"><div class="h">What the team sees</div><div class="s">${escapeHtml(useCase.benefit || "A live operating view")}</div></div>
      </div>
      <ul class="nba-list" data-feed style="margin-top:8px">${copy.feed
        .slice(0, 2)
        .map(([k, label, text]) => `<li class="nba"><span class="pill ${k}">${escapeHtml(label)}</span><span>${escapeHtml(text)}</span></li>`)
        .join("")}</ul>
    </article>`;
}

function tabInner({ companyName, domain, useCase, tabId, index, layout }) {
  const copy = dashboardCopy(companyName, domain, useCase);
  const body =
    layout === "live"
      ? layoutLive({ copy, useCase, tabId, companyName })
      : layout === "profile"
        ? layoutProfile({ copy, useCase, tabId, companyName })
        : layout === "heat"
          ? layoutHeat({ copy, useCase, tabId })
          : layout === "table"
            ? layoutTable({ copy, useCase, tabId })
            : layoutFlow({ copy, useCase, tabId });

  return `<section class="view-body" data-live="${escapeHtml(copy.event)}" data-layout="${layout}">
    <div class="title-row">
      <div>
        <p class="kicker">Use case ${index + 1} of 5 · ${layout} view</p>
        <h2>${escapeHtml(useCase.title)}</h2>
        ${tabWhyHtml(useCase, tabId)}
      </div>
      <button class="primary" type="button">${escapeHtml(copy.button)}</button>
    </div>
    ${body}
  </section>`;
}

export async function buildMockup({ companyName, domain, topUseCases, palette, deckFileName }) {
  if (!companyName || !domain || !Array.isArray(topUseCases) || topUseCases.length === 0) {
    throw new Error("buildMockup requires companyName, domain, and a non-empty topUseCases array");
  }

  const colors = palette || getPalette(domain, companyName);
  const tabs = topUseCases.slice(0, 5);
  const layouts = assignLayouts(tabs);
  const apexonSrc = apexonWordmark() || logoDataUri("apexon");
  const fabricSrc = logoDataUri("fabric");
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
          layout: layouts[i],
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
<title>${escapeHtml(companyName)} | Apexon AI Innovation Hub</title>
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
  .brand img { height: 22px; width: auto; display: block; mix-blend-mode: screen; }
  .hub { color: var(--blue60); font-size: 12.5px; border-left: 1px solid rgba(255,255,255,.2); padding-left: 12px; line-height: 1.25; }
  .hub b { color: #fff; }
  .header-link {
    color: #fff; text-decoration: none; border: 1px solid rgba(117,162,237,.4);
    background: rgba(29,110,228,.18); padding: 6px 12px; border-radius: 999px; font-size: 12px; font-weight: 700;
  }
  nav.tabs {
    flex: 0 0 44px;
    background: #0f1830;
    display: flex; align-items: stretch;
    padding: 0 14px;
    overflow: hidden;
  }
  .tab {
    color: #b9c2d6; padding: 0 18px; font-size: 13.5px; font-weight: 700;
    cursor: pointer; border: 0; background: none; border-bottom: 3px solid transparent;
  }
  .tab:hover { color: #fff; }
  .tab.active { color: #fff; border-bottom-color: var(--accent); }
  .sample {
    flex: 0 0 28px; margin: 0; padding: 0 22px; display: flex; align-items: center; gap: 8px;
    color: var(--muted); font-size: 12px; background: #0a1220;
  }
  .sample b { color: var(--accent); }
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
  .kicker { margin: 0 0 4px; color: var(--accent); font-size: 11px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; }
  h2 { margin: 0 0 4px; font-size: 22px; line-height: 1.2; }
  .why { margin: 4px 0 0; color: var(--muted); font-size: 13.5px; line-height: 1.4; max-width: 78ch; }
  .why .info { margin-right: 6px; }
  .kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; flex: none; }
  .kpi, .viz, .side {
    background: var(--card); border: 1px solid var(--blue); border-radius: 12px;
    padding: 12px 14px; position: relative;
  }
  .kpi-value { font-size: 26px; font-weight: 800; color: var(--heading); letter-spacing: -0.4px; }
  .kpi-label { margin: 4px 0 0; color: var(--muted); font-size: 12.5px; font-weight: 700; }
  .viz h3, .side h3 { margin: 0 0 8px; padding-right: 22px; color: #d7deea; font-size: 14px; }
  .stage { flex: 1; min-height: 0; display: grid; gap: 12px; }
  .stage.with-side { grid-template-columns: 1.35fr 0.85fr; }
  .viz, .side { min-height: 0; overflow: hidden; }
  .bar-row { display: flex; align-items: center; gap: 10px; margin: 10px 0; font-size: 13px; }
  .nm { width: 72px; flex: none; color: #d7deea; }
  .track { flex: 1; height: 14px; background: #0b1220; border-radius: 8px; overflow: hidden; }
  .fill { display: block; height: 100%; border-radius: 8px; }
  .vv { width: 48px; text-align: right; font-weight: 700; color: var(--heading); }
  .feed, .nba-list { list-style: none; margin: 0; padding: 0; }
  .feed li, .nba { display: flex; gap: 10px; align-items: flex-start; padding: 8px 0; border-bottom: 1px solid #243556; font-size: 13px; }
  .feed li:last-child, .nba:last-child { border-bottom: 0; }
  .conf { margin-left: auto; font-size: 11.5px; font-weight: 700; color: var(--blue60); white-space: nowrap; }
  .fan { display: flex; gap: 12px; align-items: center; }
  .avatar {
    width: 48px; height: 48px; border-radius: 50%; flex: none;
    display: grid; place-items: center; font-weight: 800; background: #1D6EE4; color: #fff;
  }
  .meta { color: var(--muted); font-size: 12.5px; margin-top: 4px; }
  .attr { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 14px; margin-top: 12px; font-size: 12.5px; }
  .attr span { color: var(--muted); display: block; font-size: 11px; }
  .heat { display: grid; grid-template-columns: repeat(6, 1fr); gap: 6px; }
  .cell { border-radius: 7px; padding: 12px 6px; text-align: center; font-size: 12px; font-weight: 700; }
  .cell small { display: block; font-weight: 600; margin-top: 4px; opacity: .9; }
  .cell.good { background: #0e7c66; color: #fff; }
  .cell.warn { background: #b8860b; color: #fff; }
  .cell.bad { background: #E54A24; color: #fff; }
  .flow { display: flex; align-items: stretch; gap: 8px; }
  .node { flex: 1; border: 1.5px solid #243556; border-radius: 10px; padding: 12px; background: #0b1220; }
  .node .h { font-weight: 800; font-size: 13px; }
  .node .s { font-size: 12px; color: var(--muted); margin-top: 4px; }
  .node.fabric { border-color: var(--blue); background: #102a4a; }
  .node.out { border-color: #0e7c66; }
  .arrow { display: grid; place-items: center; color: var(--blue60); font-size: 22px; font-weight: 800; }
  .alert { display: flex; gap: 8px; padding: 8px; border-radius: 8px; margin-bottom: 8px; font-size: 12.5px; border-left: 4px solid; }
  .alert.good { background: #16351f; border-color: #7ddea0; }
  .alert.warn { background: #3a2a10; border-color: #ffd48a; }
  .alert.bad { background: #3a1515; border-color: #ff8d80; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th { text-align: left; color: var(--muted); font-size: 11px; text-transform: uppercase; padding: 6px 8px; border-bottom: 1px solid #243556; }
  td { padding: 8px; border-bottom: 1px solid #243556; }
  .pill { flex: none; border-radius: 999px; padding: 2px 8px; font-size: 11px; font-weight: 700; }
  .good { background: #16351f; color: #7ddea0; }
  .warn { background: #3a2a10; color: #ffd48a; }
  .bad { background: #3a1515; color: #ff8d80; }
  .primary {
    background: var(--accent); color: #fff; border: 0; padding: 9px 16px;
    border-radius: 8px; font-size: 13px; font-weight: 700; cursor: pointer; white-space: nowrap;
  }
  .info {
    position: absolute; top: 8px; right: 8px; width: 18px; height: 18px; border: 0;
    border-radius: 50%; background: var(--heading); color: var(--navy2); font-weight: 700; cursor: pointer; font-size: 11px;
  }
  .pop {
    display: none; position: absolute; right: 8px; top: 30px; z-index: 5;
    width: 230px; background: #080d18; color: #fff; font-size: 12px; line-height: 1.4;
    padding: 8px 10px; border-radius: 8px; border: 1px solid var(--blue);
  }
  .toast {
    position: fixed; right: 20px; bottom: 16px; background: #080d18; color: #fff;
    padding: 10px 14px; border-radius: 8px; z-index: 20; font-size: 13px; border: 1px solid var(--accent);
  }
  footer {
    flex: 0 0 28px; padding: 0 22px; display: flex; align-items: center; gap: 8px;
    color: var(--muted); font-size: 11.5px; max-width: 1220px; width: 100%; margin: 0 auto;
  }
  footer img { height: 16px; mix-blend-mode: screen; }
  @media (max-width: 960px) {
    .kpis, .stage.with-side { grid-template-columns: 1fr 1fr; }
    .title-row { flex-direction: column; }
  }
</style>
</head>
<body>
<header>
  <div class="brand">
    ${apexonSrc ? `<img src="${apexonSrc}" alt="Apexon" />` : "<strong>Apexon</strong>"}
    <span class="hub">AI Innovation Hub · <b>${escapeHtml(companyName)}</b></span>
  </div>
  ${deckLink}
</header>
<nav class="tabs" role="tablist">${nav}</nav>
<p class="sample">
  <span class="page-info">
    <button class="info" type="button" onclick="toggleInfo('page-i')" aria-label="About this demonstration" style="position:static">i</button>
    <span id="page-i" class="pop">Built for ${escapeHtml(companyName)} leadership to walk the five use cases.<br/>Figures are sample only — not a live system.</span>
  </span>
  <b>Sample data</b> — illustrative mock-up of how the delivered dashboards could look. Not live ${escapeHtml(companyName)} figures.
</p>
<main>${panels}</main>
<footer>${fabricSrc ? `<img src="${fabricSrc}" alt="" />` : ""} Microsoft Fabric · Real-Time Intelligence · Azure AI Foundry · Harness</footer>
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
