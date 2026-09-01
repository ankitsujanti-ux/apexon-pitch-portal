// The visual contract the builders enforce. The model writes the business
// story only. It does not emit HTML, CSS, or inch coordinates. Code composes
// every slide and paints the one leadership screen from structured data.
//
// Count: the brief decides how many use-case slides, not a constant. Tight
// mandates get three. A sprawling operation can take seven. Padding is a
// defect. HTML is always one leadership screen covering those jobs' KPIs.

export const MIN_SCREENS = 3;
export const MAX_SCREENS = 7;

export const ALLOWED_TAGS = new Set([
  "article",
  "section",
  "div",
  "h3",
  "h4",
  "p",
  "span",
  "b",
  "strong",
  "small",
  "ul",
  "ol",
  "li",
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td",
  "button",
]);

export const ALLOWED_CLASSES = new Set([
  "row",
  "eq",
  "tri",
  "stack",
  "viz",
  "side",
  "kpi",
  "kpis",
  "kpi-value",
  "kpi-label",
  "heat",
  "cell",
  "good",
  "warn",
  "bad",
  "bars",
  "bar-row",
  "track",
  "fill",
  "nm",
  "vv",
  "timeline",
  "flow",
  "node",
  "keep",
  "mid",
  "out",
  "arrow",
  "compare",
  "col",
  "before",
  "after",
  "entities",
  "entity",
  "feed",
  "nba-list",
  "nba",
  "alert",
  "alerts",
  "pill",
  "board",
  "lane",
  "funnel",
  "step",
  "matrix",
  "gauge",
  "queue",
  "callout",
  "split-v",
  "meta",
  "h",
  "s",
  "n",
  "conf",
  "primary",
  "workspace",
  "workspace-metrics",
  "workspace-body",
  "workspace-hero",
  "workspace-rail",
  "solo",
]);

export const ALLOWED_ATTRS = new Set(["class", "id", "style", "data-feed", "data-kpi", "aria-label", "type"]);

export const REGION_KINDS = ["quote", "list", "pair", "steps", "kpis", "callout", "split", "compare"];

export const DEFAULT_SPAN = {
  quote: 12,
  callout: 12,
  kpis: 12,
  steps: 12,
  split: 12,
  pair: 6,
  list: 6,
  compare: 6,
};

export function clampCount(n, fallback = 5) {
  const num = Number(n);
  if (!Number.isFinite(num) || num < MIN_SCREENS) return fallback;
  return Math.min(MAX_SCREENS, Math.max(MIN_SCREENS, Math.round(num)));
}

export function classCatalog() {
  return `LAYOUT: one leadership screen. Code paints KPIs and the working view from hub.visual data. Never write HTML. Never dump h3, kpis, tables, and boards as siblings. One thought per table cell and per queue item.
CARDS: viz, side, kpi, kpis, callout, gauge.
CHARTS: heat+cell (good|warn|bad), bars+bar-row+track+fill, funnel+step, matrix, board+col (kanban), lane, queue+n, timeline, flow+node (keep|mid|out)+arrow, compare+col (before|after), entities+entity.
LISTS: alerts+alert+pill, feed, nba-list+nba.
TYPE: h3, h4, p, span, b, small, meta.`;
}
