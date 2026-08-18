// STEP 4 - Interactive HTML mockup
// Apexon AI Innovation Hub look from the Harness template (slide 8):
// dark navy, orange active tab, Arial, KPI cards, live charts, i-buttons.
// Quality bar matches the Hornets Fabric demo: short nav, clear hierarchy,
// synthetic live data, one interactive control per tab.

import { getPalette } from "../lib/palette.js";
import { dashboardCopy } from "../lib/fallbacks.js";

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
  if (first.length <= 34) return first;
  return first.slice(0, 32).replace(/\s+\S*$/, "") + "...";
}

function apexonMark() {
  return `<span class="brand-mark" aria-hidden="true">A</span><span class="brand-name">Apexon</span>`;
}

function tabInner({ companyName, domain, useCase, tabId, index }) {
  const copy = dashboardCopy(companyName, domain, useCase);
  const kpis = copy.kpis
    .map(
      (k, i) => `<article class="kpi">
        <button class="info" type="button" onclick="toggleInfo('${tabId}-i${i}')" aria-label="About this metric">i</button>
        <div id="${tabId}-i${i}" class="pop">${escapeHtml(k.why).replace(/\n/g, "<br/>")}</div>
        <div class="kpi-value" data-kpi="${i === 0 ? "a" : i === 1 ? "b" : "x"}">${escapeHtml(k.value)}</div>
        <div class="kpi-label">${escapeHtml(k.label)}</div>
      </article>`
    )
    .join("");
  const bars = copy.bars
    .map(
      (b, i) =>
        `<div class="bar-row"><span class="bar" style="width:${Math.round((b.w / 210) * 100)}%;background:${b.color}"></span><span>${escapeHtml(b.label)}</span></div>`
    )
    .join("");
  const feed = copy.feed
    .map(
      ([kind, label, text]) =>
        `<li class="feed-item"><span class="pill ${kind}">${escapeHtml(label)}</span><span>${escapeHtml(text)}</span></li>`
    )
    .join("");

  return `<section class="panel" data-live="${escapeHtml(copy.event)}">
    <p class="kicker">Use case ${index + 1}</p>
    <h2>${escapeHtml(useCase.title)}</h2>
    <p class="lede">${escapeHtml(useCase.businessProblem)}</p>
    <div class="kpis">${kpis}</div>
    <div class="charts">
      <article class="card">
        <button class="info" type="button" onclick="toggleInfo('${tabId}-trend')">i</button>
        <div id="${tabId}-trend" class="pop">Live trend for this use case.<br/>The line moves on a synthetic stream.</div>
        <h3>${escapeHtml(copy.trend)}</h3>
        <svg class="live-line" viewBox="0 0 320 120" width="100%" height="120" aria-hidden="true">
          <path d="M0,80 L53,70 L106,74 L159,58 L212,62 L265,48 L320,52" fill="none" stroke="#75A2ED" stroke-width="3"></path>
        </svg>
      </article>
      <article class="card">
        <button class="info" type="button" onclick="toggleInfo('${tabId}-bars')">i</button>
        <div id="${tabId}-bars" class="pop">Status mix for today.<br/>Read the labels, not color alone.</div>
        <h3>${escapeHtml(copy.breakdown)}</h3>
        <div class="bars">${bars}</div>
      </article>
    </div>
    <ul class="feed" data-feed>${feed}</ul>
    <div class="actions">
      <button class="primary" type="button">${escapeHtml(copy.button)}</button>
      <p class="powered">Powered by Microsoft Fabric · Real-Time Intelligence · Azure AI Foundry</p>
    </div>
  </section>`;
}

export async function buildMockup({ companyName, domain, topUseCases, palette, pagesUrl, deckFileName }) {
  if (!companyName || !domain || !Array.isArray(topUseCases) || topUseCases.length === 0) {
    throw new Error("buildMockup requires companyName, domain, and a non-empty topUseCases array");
  }

  const colors = palette || getPalette(domain, companyName);
  const nav = topUseCases
    .map(
      (uc, i) =>
        `<button id="btn-tab-${i}" class="nav-btn${i === 0 ? " active" : ""}" type="button" onclick="showTab('tab-${i}')">${escapeHtml(shortLabel(uc.title))}</button>`
    )
    .join("");
  const panels = topUseCases
    .map(
      (uc, i) =>
        `<div id="tab-${i}" class="tab${i === 0 ? " active" : ""}">${tabInner({
          companyName,
          domain,
          useCase: uc,
          tabId: `tab-${i}`,
          index: i,
        })}</div>`
    )
    .join("");
  const deckLink = deckFileName
    ? `<a class="header-link" href="${escapeHtml(deckFileName)}">Download pitch deck</a>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${escapeHtml(companyName)} | Apexon AI Innovation Hub</title>
<style>
  :root {
    --navy: #${colors.dark};
    --primary: #${colors.primary};
    --card: #${colors.card};
    --accent: #${colors.accent};
    --blue: #${colors.cardBorder};
    --heading: #${colors.heading};
    --text: #FFFFFF;
    --muted: #9AA6B8;
  }
  * { box-sizing: border-box; }
  html, body { margin: 0; min-height: 100%; }
  body {
    font-family: Arial, Helvetica, sans-serif;
    background: var(--navy);
    color: var(--text);
  }
  header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 14px 28px;
    background: #080d18;
    border-bottom: 2px solid var(--accent);
  }
  .brand { display: flex; align-items: center; gap: 10px; min-width: 0; }
  .brand-mark {
    display: inline-flex; align-items: center; justify-content: center;
    width: 28px; height: 28px; border: 2px solid #fff; border-radius: 50%;
    font-size: 13px; font-weight: 700;
  }
  .brand-name { font-size: 18px; font-weight: 700; letter-spacing: 0.02em; }
  .hub { color: var(--heading); font-size: 13px; font-weight: 500; }
  .hub b { color: var(--text); }
  .header-link {
    color: var(--text); text-decoration: none; border: 1px solid var(--blue);
    padding: 8px 12px; border-radius: 8px; font-size: 13px; font-weight: 700;
  }
  .note {
    margin: 0; padding: 10px 28px; background: var(--card); color: var(--muted); font-size: 13px;
  }
  .layout { display: grid; grid-template-columns: 240px 1fr; min-height: calc(100vh - 96px); }
  nav {
    display: flex; flex-direction: column; gap: 8px;
    padding: 20px 14px; background: #0a1220;
  }
  .nav-btn {
    text-align: left; background: transparent; border: 0; color: var(--muted);
    padding: 12px 14px; border-radius: 10px; cursor: pointer; font-size: 14px; line-height: 1.35;
  }
  .nav-btn.active { background: var(--accent); color: #fff; font-weight: 700; }
  main { padding: 22px 28px 40px; }
  .tab { display: none; }
  .tab.active { display: block; }
  .kicker { margin: 0 0 6px; color: var(--accent); font-size: 11px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; }
  h2 { margin: 0 0 10px; font-size: 26px; line-height: 1.25; max-width: 920px; }
  .lede { margin: 0 0 22px; color: #d7deea; font-size: 15px; line-height: 1.55; max-width: 860px; }
  .kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 16px; }
  .kpi, .card, .feed {
    background: var(--card); border: 1px solid var(--blue); border-radius: 12px; padding: 16px 16px 14px; position: relative;
  }
  .kpi-value { font-size: 28px; font-weight: 700; color: var(--heading); }
  .kpi-label, .card h3 { margin: 6px 0 0; color: var(--muted); font-size: 13px; font-weight: 600; }
  .card h3 { margin: 0 0 10px; }
  .charts { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 16px; }
  .bar-row { display: flex; align-items: center; gap: 10px; margin: 10px 0; font-size: 13px; color: var(--heading); }
  .bar { display: block; height: 16px; border-radius: 4px; min-width: 8px; }
  .feed { list-style: none; margin: 0 0 18px; padding: 8px 16px; }
  .feed-item { display: flex; gap: 10px; align-items: flex-start; padding: 10px 0; border-bottom: 1px solid #243556; font-size: 14px; }
  .feed-item:last-child { border-bottom: 0; }
  .pill { flex: none; border-radius: 999px; padding: 2px 8px; font-size: 11px; font-weight: 700; }
  .good { background: #16351f; color: #7ddea0; }
  .warn { background: #3a2a10; color: #ffd48a; }
  .bad { background: #3a1515; color: #ff8d80; }
  .actions { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
  .primary {
    background: var(--accent); color: #fff; border: 0; padding: 12px 18px;
    border-radius: 8px; font-size: 14px; font-weight: 700; cursor: pointer;
  }
  .powered { margin: 0; color: var(--muted); font-size: 12px; }
  .info {
    position: absolute; top: 10px; right: 10px; width: 20px; height: 20px; border: 0;
    border-radius: 50%; background: var(--heading); color: var(--navy); font-weight: 700; cursor: pointer;
  }
  .pop {
    display: none; position: absolute; right: 10px; top: 34px; z-index: 5;
    width: 220px; background: #080d18; color: #fff; font-size: 12px; line-height: 1.4;
    padding: 8px 10px; border-radius: 8px;
  }
  .toast {
    position: fixed; right: 20px; bottom: 20px; background: #080d18; color: #fff;
    padding: 12px 16px; border-radius: 8px; z-index: 20; font-size: 14px;
  }
  @media (max-width: 900px) {
    .layout { grid-template-columns: 1fr; }
    nav { flex-direction: row; overflow-x: auto; }
    .nav-btn { white-space: nowrap; }
    .kpis, .charts { grid-template-columns: 1fr; }
    header { padding: 12px 16px; }
    main { padding: 16px; }
  }
</style>
</head>
<body>
<header>
  <div class="brand">${apexonMark()} <span class="hub">AI Innovation Hub · <b>${escapeHtml(companyName)}</b></span></div>
  ${deckLink}
</header>
<p class="note">Sample data only — illustrative mock-up of how a Fabric + Foundry solution could look for ${escapeHtml(companyName)}. Not connected to any live ${escapeHtml(companyName)} system.</p>
<div class="layout">
  <nav>${nav}</nav>
  <main>${panels}</main>
</div>
<script>
function showTab(id) {
  document.querySelectorAll('.tab').forEach(function(el) { el.classList.remove('active'); });
  document.querySelectorAll('.nav-btn').forEach(function(el) { el.classList.remove('active'); });
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
  var a = parseInt((aEl && aEl.textContent) || '12', 10);
  if (isNaN(a)) a = 12;
  function draw() {
    if (!svg) return;
    var w = 320, h = 120, max = Math.max.apply(null, points.concat([1]));
    var d = points.map(function(v,i) {
      var x = (i / (points.length - 1)) * w;
      var y = h - (v / max) * 100 - 10;
      return (i === 0 ? 'M' : 'L') + x + ',' + y;
    }).join(' ');
    svg.innerHTML = '<path d="' + d + '" fill="none" stroke="#75A2ED" stroke-width="3"></path>';
  }
  draw();
  setInterval(function() {
    a = Math.max(4, a + (Math.random() > 0.5 ? 1 : -1));
    points.push(a); if (points.length > 12) points.shift();
    if (aEl) aEl.textContent = String(a);
    if (bEl && String(bEl.textContent).indexOf('%') !== -1) bEl.textContent = (95 + Math.random() * 3).toFixed(1) + '%';
    draw();
  }, 2500);
  if (btn) btn.addEventListener('click', function() {
    a += 3;
    if (aEl) aEl.textContent = String(a);
    if (feed) {
      var row = document.createElement('li');
      row.className = 'feed-item';
      row.innerHTML = '<span class="pill bad">Act Alert</span><span>' + (root.getAttribute('data-live') || 'Simulated event') + '</span>';
      feed.insertBefore(row, feed.firstChild);
    }
    var toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = 'Event simulated. The dashboard updated.';
    document.body.appendChild(toast);
    setTimeout(function() { toast.remove(); }, 2500);
  });
});
</script>
</body>
</html>`;
}
