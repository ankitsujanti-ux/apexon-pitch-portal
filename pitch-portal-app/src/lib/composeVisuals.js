// Production render contract.
//
// The model writes the business story. It does not draw slides or HTML.
// These functions turn that story into a composition the PPT and HTML
// builders can paint without overflowing, overlapping, or repeating a template.

import { toSentences, toLabel, squash } from "./text.js";

function clip(text, max) {
  return toSentences(squash(text), max);
}

function label(text, words = 6) {
  return toLabel(squash(text), words);
}

function moves(uc) {
  return (uc?.solutionMoves || [])
    .map((m) => squash(m?.detail || m?.lead || m))
    .filter(Boolean)
    .slice(0, 3);
}

const RECIPES = [
  (uc) => [
    {
      kind: "quote",
      span: 12,
      kicker: "What is going wrong",
      body: clip(uc.challenge || uc.businessProblem, 220),
    },
    {
      kind: "steps",
      span: 12,
      kicker: "What we do",
      items: moves(uc).map((m) => clip(m, 90)),
    },
  ],
  (uc) => [
    { kind: "kpis", span: 12 },
    {
      kind: "callout",
      span: 12,
      kicker: "If this slips",
      body: clip(uc.kpis?.[0]?.why || uc.whyItMatters || uc.insight, 160),
    },
  ],
  (uc) => [
    {
      kind: "compare",
      span: 12,
      kicker: "Today",
      title: "After",
      items: [
        clip(uc.challenge || uc.businessProblem, 140),
        clip(uc.benefit || uc.action, 140),
      ],
    },
  ],
  (uc) => [
    {
      kind: "list",
      span: 6,
      kicker: "Works with",
      items: (uc.worksWith || []).slice(0, 3).map((s) => clip(s, 90)),
    },
    {
      kind: "pair",
      span: 6,
      kicker: "What you get",
      body: clip((uc.businessValue || []).join(" "), 180),
    },
  ],
  (uc) => [
    {
      kind: "steps",
      span: 12,
      items: moves(uc).map((m, i) => `${String(i + 1)}. ${clip(m, 80)}`),
    },
    {
      kind: "callout",
      span: 12,
      kicker: "The decision",
      body: clip(uc.decision || uc.action || uc.insight || uc.subtitle, 140),
    },
  ],
  (uc) => [
    {
      kind: "quote",
      span: 6,
      kicker: "The point",
      body: clip(uc.insight || uc.subtitle || uc.benefit, 140),
    },
    {
      kind: "list",
      span: 6,
      kicker: "Then do this",
      items: moves(uc).map((m) => label(m, 8)),
    },
  ],
  (uc) => [
    {
      kind: "split",
      span: 12,
      kicker: "The bind",
      title: "The move",
      items: [clip(uc.businessProblem, 140), clip(uc.benefit || uc.action, 140)],
    },
  ],
];

export function composeSlideRegions(uc, index = 0) {
  const recipe = RECIPES[index % RECIPES.length];
  return recipe(uc).map((r) => ({
    kind: r.kind,
    span: r.span,
    kicker: r.kicker || "",
    title: r.title || "",
    body: r.body || "",
    items: Array.isArray(r.items) ? r.items.filter(Boolean).slice(0, 5) : [],
    accent: r.accent || "",
  }));
}

export function composeSlide(uc, index = 0) {
  return {
    idea: clip(uc?.slide?.idea || uc?.insight || uc?.decision || uc?.subtitle, 90),
    regions: composeSlideRegions(uc, index),
  };
}

export function lockUseCases(useCases) {
  return (Array.isArray(useCases) ? useCases : []).map((uc, i) => ({
    ...uc,
    screenHtml: "",
    slide: composeSlide(uc, i),
  }));
}

export function composeHubVisual(raw, useCases) {
  const jobs = Array.isArray(useCases) ? useCases : [];
  const kind = String(raw?.kind || "").toLowerCase().trim();
  const allowed = new Set(["table", "heat", "board", "compare", "flow"]);
  const picked = allowed.has(kind) ? kind : "table";

  const rowsFromAgent = (Array.isArray(raw?.rows) ? raw.rows : [])
    .map((row) => (Array.isArray(row) ? row : [row]).map((c) => clip(c, 72)).slice(0, 4))
    .filter((row) => row.some(Boolean))
    .slice(0, 5);
  const rows =
    rowsFromAgent.length >= 2
      ? rowsFromAgent
      : jobs.slice(0, 4).map((uc) => [
          label(uc.title, 6),
          label(uc.kpis?.[0]?.name || uc.insight, 5),
          label(uc.persona || "Owner", 3),
        ]);

  const cells = (Array.isArray(raw?.cells) ? raw.cells : [])
    .map((c) => ({
      label: label(c?.label || c?.name, 4),
      state: ["good", "warn", "bad"].includes(c?.state) ? c.state : "warn",
      note: label(c?.note, 3),
    }))
    .filter((c) => c.label)
    .slice(0, 6);

  const actions = (Array.isArray(raw?.actions) ? raw.actions : [])
    .map((a) => clip(typeof a === "string" ? a : a?.text, 90))
    .filter(Boolean)
    .slice(0, 3);
  const fallbackActions = jobs
    .slice(0, 3)
    .map((uc) => clip(uc.action || uc.insight || uc.title, 90))
    .filter(Boolean);

  const columns = (Array.isArray(raw?.columns) ? raw.columns : ["Where", "Watch this", "Owner"])
    .map((c) => label(c, 4))
    .filter(Boolean)
    .slice(0, 4);

  return {
    kind: picked,
    heading: label(raw?.heading, 8) || "What needs a person this morning",
    columns: columns.length ? columns : ["Where", "Watch this", "Owner"],
    rows,
    cells,
    before: clip(raw?.before, 140),
    after: clip(raw?.after, 140),
    steps: (Array.isArray(raw?.steps) ? raw.steps : []).map((s) => label(s, 5)).filter(Boolean).slice(0, 4),
    lanes: (Array.isArray(raw?.lanes) ? raw.lanes : [])
      .map((l) => ({ title: label(l?.title, 4), body: clip(l?.body, 72) }))
      .filter((l) => l.title)
      .slice(0, 3),
    actions: actions.length ? actions : fallbackActions,
  };
}
