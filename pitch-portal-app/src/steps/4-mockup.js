// Interactive HTML mockup — one leadership screen, no page scroll. KPIs come
// from the use cases on the slides. The working view is invented for this brief.

import { getPalette } from "../lib/palette.js";
import { dashboardCopy } from "../lib/fallbacks.js";
import { logoDataUri as apexonWordmark } from "../lib/templateTheme.js";
import { platformFromRequirement } from "../lib/briefFirst.js";
import { toChars, toLabel, toSentences, squash } from "../lib/text.js";
import { sanitizeScreen, screenFingerprint } from "../lib/sanitizeScreen.js";
import { composeHubVisual } from "../lib/composeVisuals.js";

function escapeHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function paintHubVisual(visual, useCases) {
  const seeded =
    visual && (visual.rows?.length || visual.cells?.length || visual.actions?.length)
      ? visual
      : {
          kind: "table",
          heading: "What needs a person this morning",
          columns: ["Job", "Watch this", "Owner"],
          rows: (useCases || []).slice(0, 4).map((uc) => [
            uc.title,
            uc.kpis?.[0]?.name || "",
            uc.persona || "Owner",
          ]),
          actions: (useCases || []).slice(0, 3).map((uc) => uc.action || uc.title).filter(Boolean),
        };
  visual = seeded;
  const heading = escapeHtml(visual?.heading || "What needs a person this morning");
  const actions = (visual?.actions || []).slice(0, 3);
  const rail = actions.length
    ? `<article class="side"><h3>Next move</h3><ul class="queue">${actions
        .map((text, i) => `<li><span class="n">${i + 1}</span><span>${escapeHtml(text)}</span></li>`)
        .join("")}</ul></article>`
    : "";

  let vizInner = "";
  const kind = visual?.kind || "table";
  if (kind === "heat" && visual.cells?.length) {
    vizInner = `<div class="heat">${visual.cells
      .map(
        (c) =>
          `<div class="cell ${c.state || "warn"}">${escapeHtml(c.label)}${
            c.note ? `<small>${escapeHtml(c.note)}</small>` : ""
          }</div>`
      )
      .join("")}</div>`;
  } else if (kind === "compare") {
    vizInner = `<div class="compare"><div class="col before"><h4>Today</h4><p>${escapeHtml(
      visual.before || ""
    )}</p></div><div class="col after"><h4>After</h4><p>${escapeHtml(
      visual.after || ""
    )}</p></div></div>`;
  } else if (kind === "board" && visual.lanes?.length) {
    vizInner = `<div class="board">${visual.lanes
      .map((l) => `<div class="col"><h4>${escapeHtml(l.title)}</h4><p>${escapeHtml(l.body || "")}</p></div>`)
      .join("")}</div>`;
  } else if (kind === "flow" && visual.steps?.length) {
    vizInner = `<div class="flow">${visual.steps
      .map((step, i) =>
        i
          ? `<span class="arrow">→</span><div class="node"><div class="h">${escapeHtml(step)}</div></div>`
          : `<div class="node keep"><div class="h">${escapeHtml(step)}</div></div>`
      )
      .join("")}</div>`;
  } else {
    const cols = visual?.columns?.length ? visual.columns : ["Where", "What to notice", "Owner"];
    const rows = visual?.rows?.length ? visual.rows : [];
    vizInner = `<table><thead><tr>${cols.map((c) => `<th>${escapeHtml(c)}</th>`).join("")}</tr></thead><tbody>${
      rows
        .map(
          (row) =>
            `<tr>${cols
              .map((_, i) => `<td>${escapeHtml(row[i] || "—")}</td>`)
              .join("")}</tr>`
        )
        .join("")
    }</tbody></table>`;
  }

  return `<div class="row"><article class="viz"><h3>${heading}</h3>${vizInner}</article>${rail}</div>`;
}

function shortLabel(title) {
  return toLabel(String(title || "Use case").replace(/[\u201C\u201D"]/g, '"'), 4);
}

// Panel headings are labels, not sentences. The model writes lookFirst as an
// instruction ("Start with the newest defect spike that is spreading"), so it
// gets reduced to the noun phrase rather than chopped mid-clause.
function vizHeading(useCase, fallback) {
  const label = toLabel(useCase.lookFirst || "", 5);
  return label || fallback;
}

function twoLine(text) {
  const clean = squash(text);
  if (!clean) return "Shown for leadership walkthrough.<br/>Sample data only.";
  const parts = clean.split(/(?<=[.!?])\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${escapeHtml(parts[0])}<br/>${escapeHtml(toChars(parts[1], 140))}`;
  }
  if (clean.length <= 140) return `${escapeHtml(clean)}<br/>Sample data — not a live company feed.`;
  return `${escapeHtml(toChars(clean, 140))}<br/>Sample data — not a live company feed.`;
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
  const caption = toSentences(useCase.whatItShows || useCase.title || "", 150);
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
    .slice(0, 5)
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
  const kind = useCase.recordKind || vizHeading(useCase, toLabel(useCase.title, 4));
  const data = typeof useCase.dataPointer === "object" ? useCase.dataPointer.description : useCase.dataPointer;
  return `<article class="viz">
    <button class="info" type="button" onclick="toggleInfo('${tabId}-rec')">i</button>
    <div id="${tabId}-rec" class="pop">${twoLine("One record, previously split across systems. Sample only.")}</div>
    <h3>${escapeHtml(kind)}</h3>
    <div class="rec-body">
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
    <h3>${escapeHtml(vizHeading(useCase, "Where to look"))}</h3>
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
  // A working list with four rows reads like a placeholder. Cycle the sample
  // feed so the table looks like a real queue and fills its panel.
  const feed = copy.feed.length ? Array.from({ length: 7 }, (_, i) => copy.feed[i % copy.feed.length]) : [];
  const rows = feed.map(([k, label, text], i) => {
    const item = toChars(text.split(/[—–.]/)[0], 44, { ellipsis: false });
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
    <h3>${escapeHtml(vizHeading(useCase, "What needs a decision"))}</h3>
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
    <h3>${escapeHtml(vizHeading(useCase, "How this lands"))}</h3>
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
    <h3>${escapeHtml(vizHeading(useCase, "How the job runs"))}</h3>
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
    <h3>${escapeHtml(vizHeading(useCase, "What this screen works on"))}</h3>
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
  if (name === "bars") return pieceBars({ ...ctx, title: vizHeading(ctx.useCase, "Status mix") });
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

function stripLiftedMetrics(html) {
  return String(html || "").replace(/<div class="workspace-metrics">[\s\S]*?<\/div>/, "");
}

function resolveHub(hub, useCases, companyName, domain) {
  const SAMPLE = ["18", "96%", "4.2h", "3", "12", "99%"];
  const kpis = (Array.isArray(hub?.kpis) && hub.kpis.length
    ? hub.kpis
    : (useCases || []).map((uc, i) => ({
        name: uc.kpis?.[0]?.name || uc.title,
        value: SAMPLE[i] || "—",
        why: uc.kpis?.[0]?.why || `If this number moves the wrong way, this job misses its window.`,
        from: uc.title,
      }))
  ).slice(0, 6);
  return {
    title: hub?.title || `${companyName} operating picture`,
    subtitle: hub?.subtitle || hub?.visualConcept || `What ${toLabel(domain, 4)} leadership would watch`,
    whatItShows:
      hub?.whatItShows ||
      "The numbers from each job on the slides, and the next exception that still needs a person.",
    screenHtml: "",
    visual: hub?.visual || null,
    kpis,
  };
}

function hubKpiRow(hub, tabId) {
  return `<div class="kpis">${hub.kpis
    .map((k, i) => {
      const why = k.why || "A leadership metric for this mandate.";
      return `<article class="kpi">
        <button class="info" type="button" onclick="toggleInfo('${tabId}-k${i}')" aria-label="About this metric">i</button>
        <div id="${tabId}-k${i}" class="pop">${twoLine(why)}</div>
        <div class="kpi-value" data-kpi="${i === 0 ? "a" : i === 1 ? "b" : "x"}">${escapeHtml(k.value || "—")}</div>
        <div class="kpi-label">${escapeHtml(k.name || "Metric")}</div>
      </article>`;
    })
    .join("")}</div>`;
}

function hubView({ companyName, domain, useCases, hub, platformName }) {
  const resolved = resolveHub(hub, useCases, companyName, domain);
  const copy = dashboardCopy(companyName, domain, useCases[0] || { title: resolved.title, businessProblem: domain });
  const tabId = "hub";
  const visual = composeHubVisual(resolved.visual, useCases);
  const painted = paintHubVisual(visual, useCases);
  const custom = sanitizeScreen(painted, { tabId });
  const html = custom.ok ? custom.html : painted;
  const layoutKey = screenFingerprint(html) || visual.kind || "hub";
  const stage = `<div class="stage custom"><button class="info" type="button" onclick="toggleInfo('${tabId}-scr')" aria-label="About this screen">i</button><div id="${tabId}-scr" class="pop">${twoLine(resolved.whatItShows)}</div><div class="screen">${stripLiftedMetrics(html)}</div></div>`;

  return `<section class="view-body" data-live="${escapeHtml(copy.event)}" data-layout="${escapeHtml(layoutKey)}">
    <div class="title-row">
      <div>
        <p class="kicker">Leadership view · ${escapeHtml(toLabel(domain, 4))}</p>
        <h2>${escapeHtml(resolved.title)}</h2>
        ${resolved.subtitle ? `<p class="sub">${escapeHtml(resolved.subtitle)}</p>` : ""}
      </div>
      <button class="primary" type="button">Show the next action</button>
    </div>
    <p class="caption">${escapeHtml(toSentences(resolved.whatItShows, 140))}</p>
    ${hubKpiRow(resolved, tabId)}
    ${stage}
  </section>`;
}

export async function buildMockup({ companyName, domain, requirement = "", topUseCases, hub, palette, deckFileName, evidenceNote = "" }) {
  if (!companyName || !domain || !Array.isArray(topUseCases) || topUseCases.length === 0) {
    throw new Error("buildMockup requires companyName, domain, and a non-empty topUseCases array");
  }

  const colors = palette || getPalette(domain, companyName);
  const useCases = topUseCases.slice(0, 7);
  const apexonSrc = apexonWordmark();
  const platform = platformFromRequirement(requirement, domain);
  const platformName = platform.name === "Target platform" || platform.name === "Operating platform" ? "" : platform.name;
  const footerLine = platformName
    ? `${platform.name} · ${platform.components.slice(0, 2).join(" · ")}`
    : "Apexon walkthrough · sample data";
  const body = `<div id="hub" class="view active">${hubView({
    companyName,
    domain,
    useCases,
    hub,
    platformName,
  })}</div>`;
  const deckLink = deckFileName
    ? `<a class="header-link" href="${escapeHtml(deckFileName)}">Download presentation</a>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${escapeHtml(companyName)} | ${escapeHtml(domain)} leadership view</title>
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
    overflow-wrap: break-word;
  }
  header {
    flex: 0 0 52px;
    display: flex; align-items: center; justify-content: space-between; gap: 16px;
    padding: 0 22px; background: linear-gradient(90deg, var(--navy), var(--navy2));
    color: #fff;
  }
  .brand { display: flex; align-items: center; gap: 12px; min-width: 0; }
  .brand img { height: 22px; width: auto; display: block; }
  .hub {
    color: var(--blue60); font-size: var(--fs-small); border-left: 1px solid rgba(255,255,255,.2);
    padding-left: 12px; line-height: 1.25; min-width: 0;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .hub b { color: #fff; }
  .header-link {
    color: #fff; text-decoration: none; border: 1px solid rgba(117,162,237,.4);
    background: rgba(29,110,228,.18); padding: 6px 12px; border-radius: 999px; font-size: var(--fs-small); font-weight: 700;
  }
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
  .view { display: flex; flex: 1; min-height: 0; overflow: hidden; flex-direction: column; }
  .view-body { flex: 1; min-height: 0; display: flex; flex-direction: column; overflow: hidden; gap: 10px; }
  .title-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; flex: none; }
  .title-row > div { min-width: 0; flex: 1; }
  .kicker { margin: 0 0 4px; color: var(--accent); font-size: var(--fs-micro); font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; }
  h2 { margin: 0; font-size: var(--fs-h2); line-height: 1.25; font-weight: 700; overflow-wrap: anywhere; }
  .sub { margin: 3px 0 0; color: var(--accent); font-size: var(--fs-body); font-weight: 700; overflow-wrap: anywhere; }
  .caption { margin: 0; color: var(--muted); font-size: var(--fs-body); line-height: 1.45; max-width: 96ch; flex: none; overflow-wrap: anywhere; }
  .kpis { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; flex: none; }
  .kpi, .viz, .side {
    background: var(--card); border: 1px solid var(--blue); border-radius: 12px;
    padding: 12px 14px; position: relative; min-width: 0;
  }
  .kpi { padding-right: 28px; }
  .kpi-value { font-size: var(--fs-value); font-weight: 800; color: var(--heading); letter-spacing: -0.4px; line-height: 1.1; overflow-wrap: anywhere; }
  .kpi-label { margin: 4px 0 0; color: var(--muted); font-size: var(--fs-small); font-weight: 700; line-height: 1.3; overflow-wrap: anywhere; }
  .viz h3, .side h3 { margin: 0 0 10px; padding-right: 22px; color: #d7deea; font-size: var(--fs-h3); font-weight: 700; flex: none; }
  .stage { flex: 1; min-height: 0; display: grid; gap: 12px; }
  .stage.with-side { grid-template-columns: 1.35fr 0.85fr; }
  /* Panels are columns so their content can claim the leftover height instead
     of sitting at the top of an over-tall box. */
  .viz, .side { min-height: 0; overflow: hidden; display: flex; flex-direction: column; }
  .viz > *:last-child, .side > *:last-child { flex: 1; min-height: 0; overflow: auto; }
  .viz > table, .side > table, .viz > .tablewrap, .side > .queue, .viz > .queue {
    flex: 1; min-height: 0; overflow: auto; height: auto;
  }
  .heat, .entities, .timeline, .flow, .compare, .bars, .feed, .tablewrap { min-height: 0; min-width: 0; }
  .bars { display: flex; flex-direction: column; justify-content: flex-start; gap: 8px; }
  .bar-row { display: flex; align-items: center; gap: 10px; margin: 0; font-size: var(--fs-body); min-width: 0; }
  .nm { width: 72px; flex: none; color: #d7deea; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .track { flex: 1; height: 14px; background: #0b1220; border-radius: 8px; overflow: hidden; min-width: 0; }
  .fill { display: block; height: 100%; border-radius: 8px; }
  .vv { width: 48px; text-align: right; font-weight: 700; color: var(--heading); flex: none; }
  .feed, .nba-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; justify-content: flex-start; }
  .alerts { display: flex; flex-direction: column; gap: 8px; justify-content: flex-start; }
  .rec-body { display: flex; flex-direction: column; gap: 8px; justify-content: flex-start; }
  .tablewrap { display: block; overflow: auto; min-height: 0; }
  table tbody tr { height: auto; }
  th, td { vertical-align: top; white-space: normal; word-break: break-word; line-height: 1.4; }
  td p, td span, td small, td b { display: block; line-height: 1.35; }
  .feed li, .nba { display: flex; gap: 10px; align-items: flex-start; padding: 8px 0; border-bottom: 1px solid #243556; font-size: var(--fs-body); min-width: 0; }
  .feed li:last-child, .nba:last-child { border-bottom: 0; }
  .conf { margin-left: auto; font-size: var(--fs-micro); font-weight: 700; color: var(--blue60); white-space: nowrap; flex: none; }
  .fan { display: flex; gap: 12px; align-items: center; }
  .avatar {
    width: 48px; height: 48px; border-radius: 50%; flex: none;
    display: grid; place-items: center; font-weight: 800; background: #1D6EE4; color: #fff;
  }
  .meta { color: var(--muted); font-size: var(--fs-small); margin-top: 4px; }
  .attr { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 14px; margin-top: 12px; font-size: var(--fs-small); }
  .attr span { color: var(--muted); display: block; font-size: var(--fs-micro); }
  .heat { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; align-content: stretch; }
  .cell { border-radius: 7px; padding: 12px 6px; text-align: center; font-size: var(--fs-small); font-weight: 700; display: flex; flex-direction: column; justify-content: center; min-width: 0; overflow-wrap: anywhere; line-height: 1.3; }
  .cell small { display: block; font-weight: 600; margin-top: 4px; opacity: .9; }
  .cell.good { background: #0e7c66; color: #fff; }
  .cell.warn { background: #b8860b; color: #fff; }
  .cell.bad { background: #E54A24; color: #fff; }
  /* Nodes keep their own height and the group centres. Stretching them to the
     full panel left three tall boxes with text stranded at the top. */
  .flow { display: flex; align-items: stretch; justify-content: center; gap: 8px; min-width: 0; }
  .flow .node { display: flex; flex-direction: column; justify-content: center; }
  .node { flex: 1; min-width: 0; border: 1.5px solid #243556; border-radius: 10px; padding: 12px; background: #0b1220; overflow-wrap: anywhere; }
  .node .h { font-weight: 800; font-size: var(--fs-body); }
  .node .s { font-size: var(--fs-small); color: var(--muted); margin-top: 4px; }
  .node.mid { border-color: var(--blue); background: #102a4a; }
  .node.out { border-color: #0e7c66; }
  .arrow { display: grid; place-items: center; color: var(--blue60); font-size: var(--fs-h2); font-weight: 800; }
  .compare { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 12px; }
  .compare .col { background: #0b1220; border-radius: 10px; padding: 12px; border: 1px solid #243556; display: flex; flex-direction: column; min-width: 0; }
  .compare h4 { margin: 0 0 8px; font-size: var(--fs-small); letter-spacing: .08em; text-transform: uppercase; }
  .compare .before h4 { color: #ffd48a; }
  .compare .after h4 { color: #7ddea0; }
  .compare p { margin: 0; color: #d7deea; font-size: var(--fs-body); line-height: 1.4; overflow-wrap: anywhere; }
  /* A vertical path. As four columns in a narrow side panel these became tall,
     mostly-empty slivers; as rows they fill the panel and read in order. */
  .timeline { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: 1fr; gap: 8px; align-content: stretch; }
  .timeline li {
    background: #0b1220; border-radius: 10px; padding: 10px 12px; min-height: 0; min-width: 0;
    display: flex; align-items: flex-start; gap: 11px;
  }
  .timeline span { display: grid; place-items: center; width: 24px; height: 24px; border-radius: 50%; background: var(--accent); font-size: var(--fs-small); font-weight: 800; margin: 0; flex: none; }
  .timeline b, .timeline p { min-width: 0; overflow-wrap: anywhere; line-height: 1.35; }
  .entities { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; align-content: stretch; }
  .entity { display: flex; gap: 10px; align-items: flex-start; background: #0b1220; border-radius: 10px; padding: 10px; min-width: 0; }
  .entity span { width: 32px; height: 32px; border-radius: 8px; display: grid; place-items: center; background: #1D6EE4; font-weight: 800; font-size: var(--fs-small); flex: none; }
  .entity b { min-width: 0; overflow-wrap: anywhere; line-height: 1.3; }
  .alert { display: flex; gap: 8px; padding: 9px 10px; border-radius: 8px; margin: 0; font-size: var(--fs-small); border-left: 4px solid; align-items: flex-start; min-width: 0; overflow-wrap: anywhere; line-height: 1.35; }
  .alert.good { background: #16351f; border-color: #7ddea0; }
  .alert.warn { background: #3a2a10; border-color: #ffd48a; }
  .alert.bad { background: #3a1515; border-color: #ff8d80; }
  table { width: 100%; border-collapse: collapse; font-size: var(--fs-body); table-layout: fixed; }
  th { text-align: left; color: var(--muted); font-size: var(--fs-micro); text-transform: uppercase; padding: 6px 8px; border-bottom: 1px solid #243556; }
  td { padding: 8px; border-bottom: 1px solid #243556; }
  .stage.custom { display: flex; flex-direction: column; position: relative; min-height: 0; }
  .stage.custom > .screen { flex: 1; min-height: 0; display: flex; flex-direction: column; overflow: hidden; }
  .stage.custom > .screen > .row { flex: 1; min-height: 0; height: 100%; }
  .workspace {
    flex: 1; min-height: 0; display: grid; grid-template-rows: auto 1fr; gap: 12px;
  }
  .workspace-metrics { flex: none; }
  .workspace-metrics .kpis { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; }
  .workspace-metrics .kpi { padding-right: 28px; min-width: 0; }
  .workspace-metrics .kpi h4 { margin: 0 0 4px; padding-right: 8px; overflow-wrap: anywhere; }
  .workspace-metrics .kpi p { margin: 0; color: var(--muted); font-size: var(--fs-small); line-height: 1.35; }
  .workspace-metrics .kpi b {
    display: block; font-size: var(--fs-value); font-weight: 800;
    color: var(--heading); letter-spacing: -0.4px; line-height: 1.1;
  }
  .workspace-body {
    min-height: 0; display: grid; grid-template-columns: minmax(0, 1.4fr) minmax(260px, 0.9fr); gap: 12px;
  }
  .workspace-body.solo { grid-template-columns: 1fr; }
  .workspace-hero, .workspace-rail {
    min-height: 0; overflow: auto; display: flex; flex-direction: column; gap: 10px;
  }
  .workspace-rail .stack { flex: none; gap: 10px; }
  .workspace-hero > h3, .workspace-rail > h3 {
    margin: 0; font-size: var(--fs-h3); color: #d7deea;
  }
  .workspace-hero > .viz, .workspace-hero > article {
    flex: 1; min-height: 0; overflow: auto;
  }
  .workspace-rail > * { flex: none; min-height: 0; }
  .workspace td .cell, .workspace th .cell, .workspace td .heat, .workspace th .heat {
    display: inline-flex; padding: 3px 8px; min-height: 0; font-size: var(--fs-micro);
  }
  .workspace button, .workspace-hero button, .workspace-rail button {
    background: var(--accent); color: #fff; border: 0; padding: 8px 12px;
    border-radius: 8px; font-size: var(--fs-small); font-weight: 700; cursor: pointer;
    align-self: flex-start;
  }
  .row {
    display: grid; grid-template-columns: minmax(0, 1.3fr) minmax(0, 0.9fr);
    gap: 12px; min-height: 0; align-content: start;
  }
  .row > :nth-child(n+3) { grid-column: 1 / -1; }
  .row.eq { grid-template-columns: 1fr 1fr; }
  .row.tri { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .row.tri > :nth-child(n+4) { grid-column: 1 / -1; }
  .stack { display: flex; flex-direction: column; gap: 10px; min-height: 0; }
  .split-v { display: grid; grid-template-rows: auto 1fr; gap: 12px; min-height: 0; }
  .board {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 8px; min-height: 0; align-content: start;
  }
  .board > * {
    background: #0b1220; border-radius: 10px; padding: 10px;
    display: flex; flex-direction: column; gap: 8px; min-height: 0; min-width: 0; border: 1px solid #243556;
  }
  .board p, .board .callout { overflow-wrap: anywhere; line-height: 1.35; margin: 0; }
  .lane { display: grid; grid-template-columns: minmax(72px, 120px) minmax(0, 1fr); gap: 8px; align-items: start; background: #0b1220; border-radius: 10px; padding: 10px; min-width: 0; }
  .funnel { display: flex; flex-direction: column; gap: 6px; justify-content: center; }
  .funnel .step { background: #1D6EE4; border-radius: 8px; padding: 10px 12px; text-align: center; font-weight: 700; font-size: var(--fs-body); overflow-wrap: anywhere; }
  .matrix { display: block; min-height: 0; }
  .gauge { display: flex; flex-direction: column; justify-content: center; background: #0b1220; border-radius: 10px; padding: 16px; min-height: 0; }
  .queue { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; height: auto; justify-content: flex-start; }
  .queue > * { display: flex; gap: 10px; align-items: flex-start; background: #0b1220; border-radius: 8px; padding: 10px; min-width: 0; overflow: visible; }
  .queue > * > :not(.n) { min-width: 0; flex: 1; white-space: normal; line-height: 1.35; }
  .queue .n { width: 22px; height: 22px; border-radius: 50%; background: var(--accent); color: #fff; display: grid; place-items: center; font-weight: 800; font-size: var(--fs-small); flex: none; }
  .callout { background: #1A1410; border-left: 4px solid var(--accent); border-radius: 10px; padding: 12px 14px; color: #d7deea; font-size: var(--fs-body); overflow-wrap: anywhere; line-height: 1.4; }
  h4 { margin: 0 0 8px; font-size: var(--fs-small); letter-spacing: .08em; text-transform: uppercase; color: var(--muted); }
  .pill { flex: none; border-radius: 999px; padding: 2px 8px; font-size: var(--fs-micro); font-weight: 700; }
  .good { background: #16351f; color: #7ddea0; }
  .warn { background: #3a2a10; color: #ffd48a; }
  .bad { background: #3a1515; color: #ff8d80; }
  .primary {
    background: var(--accent); color: #fff; border: 0; padding: 9px 16px;
    border-radius: 8px; font-size: var(--fs-body); font-weight: 700; cursor: pointer;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 240px; flex: none;
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
    .kpis, .stage.with-side, .workspace-body { grid-template-columns: 1fr 1fr; }
    .workspace-body { grid-template-columns: 1fr; }
    .split { grid-template-columns: 1fr; }
    .title-row { flex-direction: column; }
  }
</style>
</head>
<body>
<header>
  <div class="brand">
    ${apexonSrc ? `<img src="${apexonSrc}" alt="Apexon" />` : "<strong>Apexon</strong>"}
    <span class="hub">Leadership view · <b>${escapeHtml(companyName)}</b></span>
  </div>
  ${deckLink}
</header>
<p class="sample">
  <span class="page-info">
    <button class="info" type="button" onclick="toggleInfo('page-i')" aria-label="About this demonstration" style="position:static">i</button>
    <span id="page-i" class="pop">This is the product screen leadership would leave open: the KPIs from the use cases on the slides, and the next action.<br/>Figures are sample only — not a live system.</span>
  </span>
  <b>Sample data</b> — walkthrough for ${escapeHtml(companyName)}. Not live company figures.${
    evidenceNote ? ` <span class="ev-note">${escapeHtml(toSentences(evidenceNote, 140))}</span>` : ""
  }
</p>
<main>${body}</main>
<footer>${apexonSrc ? `<img src="${apexonSrc}" alt="" />` : ""} ${escapeHtml(footerLine)}</footer>
<script>
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
