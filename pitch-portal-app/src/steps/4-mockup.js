// Interactive HTML mockup — Hornets layout, Harness theme.
// Horizontal tabs. One relevant visual per use case. Fits the viewport.

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

function visualKind(useCase) {
  const t = `${useCase.title} ${useCase.businessProblem}`.toLowerCase();
  if (/live|pulse|real.?time|wait|queue|venue/.test(t)) return "line";
  if (/inventory|demand|stock|cover|fill/.test(t)) return "bars";
  if (/trace|lineage|audit|lot|genealogy/.test(t)) return "table";
  if (/quality|hold|exception|defect|label|allergen/.test(t)) return "bars";
  if (/brief|governed|next.?best|recommend/.test(t)) return "list";
  return "bars";
}

function visualBlock({ copy, kind, tabId }) {
  if (kind === "line") {
    return `<article class="viz">
      <button class="info" type="button" onclick="toggleInfo('${tabId}-viz')">i</button>
      <div id="${tabId}-viz" class="pop">${twoLine(copy.trend + " This is the live signal for this use case.")}</div>
      <h3>${escapeHtml(copy.trend)}</h3>
      <svg class="live-line" viewBox="0 0 320 110" width="100%" height="110" aria-hidden="true"></svg>
    </article>`;
  }
  if (kind === "table") {
    const rows = copy.feed.slice(0, 4)
      .map(([kindName, label, text]) => `<tr><td><span class="pill ${kindName}">${escapeHtml(label)}</span></td><td>${escapeHtml(text)}</td></tr>`)
      .join("");
    return `<article class="viz">
      <button class="info" type="button" onclick="toggleInfo('${tabId}-viz')">i</button>
      <div id="${tabId}-viz" class="pop">${twoLine("Trace of the latest lots or records. Read status first, then the event.")}</div>
      <h3>Latest lineage events</h3>
      <table><thead><tr><th>Status</th><th>Event</th></tr></thead><tbody data-feed>${rows}</tbody></table>
    </article>`;
  }
  if (kind === "list") {
    const items = copy.feed.slice(0, 4)
      .map(([kindName, label, text]) => `<li class="nba"><span class="pill ${kindName}">${escapeHtml(label)}</span><span>${escapeHtml(text)}</span></li>`)
      .join("");
    return `<article class="viz">
      <button class="info" type="button" onclick="toggleInfo('${tabId}-viz')">i</button>
      <div id="${tabId}-viz" class="pop">${twoLine("Recommended next actions from governed data. Highest confidence sits at the top.")}</div>
      <h3>Next actions</h3>
      <ul class="nba-list" data-feed>${items}</ul>
    </article>`;
  }
  const bars = copy.bars
    .map(
      (b) =>
        `<div class="bar-row"><span class="nm">${escapeHtml(b.label.split(" ")[0])}</span><span class="track"><span class="fill" style="width:${Math.max(8, Math.round((b.w / 210) * 100))}%;background:${b.color}"></span></span><span class="vv">${escapeHtml(b.label.replace(/^[^\d%]*/, ""))}</span></div>`
    )
    .join("");
  return `<article class="viz">
    <button class="info" type="button" onclick="toggleInfo('${tabId}-viz')">i</button>
    <div id="${tabId}-viz" class="pop">${twoLine(copy.breakdown + " Read the labels, not color alone.")}</div>
    <h3>${escapeHtml(copy.breakdown)}</h3>
    <div class="bars">${bars}</div>
  </article>`;
}

function tabInner({ companyName, domain, useCase, tabId, index }) {
  const copy = dashboardCopy(companyName, domain, useCase);
  const kind = visualKind(useCase);
  const kpiSource = (useCase.kpis && useCase.kpis.length ? useCase.kpis : copy.kpis).slice(0, 4);
  const kpis = kpiSource
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
    .join("");
  const sideFeed = kind === "table" || kind === "list"
    ? ""
    : `<article class="side">
        <h3>What just happened</h3>
        <ul class="feed" data-feed>${copy.feed
          .slice(0, 3)
          .map(([k, label, text]) => `<li><span class="pill ${k}">${escapeHtml(label)}</span><span>${escapeHtml(text)}</span></li>`)
          .join("")}</ul>
      </article>`;

  return `<section class="view-body" data-live="${escapeHtml(copy.event)}" data-kind="${kind}">
    <div class="title-row">
      <div>
        <p class="kicker">Use case ${index + 1} of 5</p>
        <h2>${escapeHtml(useCase.title)}</h2>
        <p class="sub">${escapeHtml(useCase.benefit || useCase.businessProblem || "")}</p>
      </div>
      <button class="primary" type="button">${escapeHtml(copy.button)}</button>
    </div>
    <div class="kpis">${kpis}</div>
    <div class="stage ${sideFeed ? "with-side" : ""}">
      ${visualBlock({ copy, kind, tabId })}
      ${sideFeed}
    </div>
  </section>`;
}

export async function buildMockup({ companyName, domain, topUseCases, palette, deckFileName }) {
  if (!companyName || !domain || !Array.isArray(topUseCases) || topUseCases.length === 0) {
    throw new Error("buildMockup requires companyName, domain, and a non-empty topUseCases array");
  }

  const colors = palette || getPalette(domain, companyName);
  const tabs = topUseCases.slice(0, 5);
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
    --navy2: #0f1830;
    --accent: #${colors.accent};
    --blue: #${colors.cardBorder};
    --blue60: #75A2ED;
    --bg: #eef1f7;
    --card: #ffffff;
    --line: #e5e9f3;
    --ink: #1a1f2e;
    --muted: #6b7280;
    --shadow: 0 1px 3px rgba(23,36,64,.08), 0 8px 24px rgba(23,36,64,.06);
  }
  * { box-sizing: border-box; }
  html, body { margin: 0; height: 100%; overflow: hidden; }
  body {
    font-family: Arial, Helvetica, sans-serif;
    background: var(--bg);
    color: var(--ink);
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
    background: var(--navy2);
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
    color: var(--muted); font-size: 12px;
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
  .sub { margin: 0; color: var(--muted); font-size: 13.5px; max-width: 70ch; display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
  .kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; flex: none; }
  .kpi, .viz, .side {
    background: var(--card); border: 1px solid var(--line); border-radius: 12px;
    padding: 12px 14px; position: relative; box-shadow: var(--shadow);
  }
  .kpi-value { font-size: 26px; font-weight: 800; color: var(--navy); letter-spacing: -0.4px; }
  .kpi-label { margin: 4px 0 0; color: var(--muted); font-size: 12.5px; font-weight: 700; }
  .viz h3, .side h3 { margin: 0 0 8px; padding-right: 22px; color: var(--ink); font-size: 14px; }
  .stage { flex: 1; min-height: 0; display: grid; gap: 12px; }
  .stage.with-side { grid-template-columns: 1.35fr 0.85fr; }
  .viz, .side { min-height: 0; overflow: hidden; }
  .bar-row { display: flex; align-items: center; gap: 10px; margin: 10px 0; font-size: 13px; }
  .nm { width: 72px; flex: none; color: var(--ink); }
  .track { flex: 1; height: 14px; background: #eef1f7; border-radius: 8px; overflow: hidden; }
  .fill { display: block; height: 100%; border-radius: 8px; }
  .vv { width: 48px; text-align: right; font-weight: 700; color: var(--navy); }
  .feed, .nba-list { list-style: none; margin: 0; padding: 0; }
  .feed li, .nba { display: flex; gap: 10px; align-items: flex-start; padding: 8px 0; border-bottom: 1px solid #f0f2f8; font-size: 13px; }
  .feed li:last-child, .nba:last-child { border-bottom: 0; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th { text-align: left; color: var(--muted); font-size: 11px; text-transform: uppercase; padding: 6px 8px; border-bottom: 1px solid var(--line); }
  td { padding: 8px; border-bottom: 1px solid #f0f2f8; }
  .pill { flex: none; border-radius: 999px; padding: 2px 8px; font-size: 11px; font-weight: 700; }
  .good { background: #d9f3e8; color: #1f9d6b; }
  .warn { background: #fbeecb; color: #9a7300; }
  .bad { background: #fadddd; color: #d64545; }
  .primary {
    background: var(--blue); color: #fff; border: 0; padding: 9px 16px;
    border-radius: 8px; font-size: 13px; font-weight: 700; cursor: pointer; white-space: nowrap;
  }
  .info {
    position: absolute; top: 8px; right: 8px; width: 18px; height: 18px; border: 0;
    border-radius: 50%; background: var(--navy); color: #fff; font-weight: 700; cursor: pointer; font-size: 11px;
  }
  .pop {
    display: none; position: absolute; right: 8px; top: 30px; z-index: 5;
    width: 230px; background: var(--navy); color: #fff; font-size: 12px; line-height: 1.4;
    padding: 8px 10px; border-radius: 8px; box-shadow: var(--shadow);
  }
  .toast {
    position: fixed; right: 20px; bottom: 16px; background: var(--navy); color: #fff;
    padding: 10px 14px; border-radius: 8px; z-index: 20; font-size: 13px;
  }
  footer {
    flex: 0 0 28px; padding: 0 22px; display: flex; align-items: center; gap: 8px;
    color: var(--muted); font-size: 11.5px; max-width: 1220px; width: 100%; margin: 0 auto;
  }
  footer img { height: 16px; }
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
