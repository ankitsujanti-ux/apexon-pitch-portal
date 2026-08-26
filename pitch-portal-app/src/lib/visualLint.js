// Deterministic checks on hub markup and slide compositions.
// The model cannot see the compiled page, so this is the self-check
// that catches overlapping rails, tables in the side column, and
// copy-paste slide structures before files are written.

import { sanitizeScreen } from "./sanitizeScreen.js";

function textOf(html) {
  return String(html || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function lintHubMarkup(screenHtml) {
  const defects = [];
  const raw = String(screenHtml || "").trim();
  if (!raw) {
    return [{ field: "hub.screenHtml", kind: "SPARSE", problem: "The leadership screen has no working view.", fix: "Design one primary visual and a next-action rail from the use-case decisions." }];
  }

  const cleaned = sanitizeScreen(raw, { tabId: "lint" });
  const html = cleaned.ok ? cleaned.html : raw;

  const railChunk = /workspace-rail[\s\S]*?<\/div><\/div><\/div>/.exec(html)?.[0] || "";
  if (/<table\b/i.test(railChunk)) {
    defects.push({
      field: "hub.screenHtml",
      kind: "HUB",
      problem: "A data table was pushed into the narrow side rail, so text overlaps.",
      fix: "Keep the table in article.viz. Put only a queue, callout, or next actions in article.side.",
    });
  }

  const railKids = (railChunk.match(/<(ul|ol|article|div|section|table)\b/gi) || []).length;
  if (railKids > 5) {
    defects.push({
      field: "hub.screenHtml",
      kind: "HUB",
      problem: "The side rail has too many widgets stacked, so labels overlap.",
      fix: "At most three next actions in the rail. One sentence each.",
    });
  }

  const tds = [...raw.matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/gi)];
  for (const td of tds) {
    const t = textOf(td[1]);
    if (t.length > 220) {
      defects.push({
        field: "hub.screenHtml",
        kind: "HUB",
        problem: "A table cell is a paragraph, so lines stack on top of each other.",
        fix: "One fact per cell. Move the explanation to why-it-matters or the rail.",
      });
      break;
    }
  }

  const queueItems = [...raw.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)];
  if (queueItems.some((li) => textOf(li[1]).length > 140)) {
    defects.push({
      field: "hub.screenHtml",
      kind: "HUB",
      problem: "A next-action item is too long to fit the rail.",
      fix: "Each queue item: a number, then one sentence under 18 words.",
    });
  }

  if (/<(ul|ol)[^>]*class="[^"]*queue[\s\S]*<table\b/i.test(raw) && /<table[\s\S]*<(ul|ol)[^>]*class="[^"]*queue/i.test(raw)) {
    defects.push({
      field: "hub.screenHtml",
      kind: "HUB",
      problem: "Table and queue are mixed in one column.",
      fix: "Table in viz, queue in side. Never both as siblings in the same article.",
    });
  }

  return defects.slice(0, 6);
}

export function lintSlideCompositions(useCases) {
  const defects = [];
  const seqs = (useCases || []).map((uc) =>
    (uc.slide?.regions || []).map((r) => r.kind).filter(Boolean).join("+")
  );
  for (let i = 1; i < seqs.length; i += 1) {
    if (seqs[i] && seqs[i] === seqs[i - 1]) {
      defects.push({
        useCase: useCases[i].title,
        field: "slide.regions",
        kind: "SAMEY",
        problem: "This slide uses the same visual structure as the previous one.",
        fix: "Change the region kinds so neighbouring slides read differently.",
      });
    }
  }
  const kpiOnly = seqs.filter((s) => s === "kpis" || s.startsWith("kpis+")).length;
  if (kpiOnly >= 3) {
    defects.push({
      useCase: "deck",
      field: "slide.regions",
      kind: "SAMEY",
      problem: "Too many slides are just a KPI strip.",
      fix: "Use quote, steps, compare, or callout where the decision is the point.",
    });
  }
  return defects;
}
