// The visual contract the agent designs against, and that the builders enforce.
//
// HTML: the agent writes real screen markup using only these tags and classes.
// Anything else is stripped or the screen falls back to the block renderer.
//
// Deck: the agent describes a composition (regions on a 12-column grid). The
// builder packs and paints it. The agent never emits inch coordinates.
//
// Count: the brief decides how many screens, not a constant. Tight mandates
// get three. A sprawling operation can take seven. Padding is a defect.

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
  return `LAYOUT: row with EXACTLY two children (article.viz + article.side). Optional section.kpis ABOVE the row, never inside it. stack = kpis then one viz. Never put h3, kpis, tables, and boards as siblings in a row.
CARDS: viz, side, kpi, kpis, callout, gauge.
CHARTS: heat+cell (good|warn|bad), bars+bar-row+track+fill, funnel+step, matrix, board+col (kanban), lane, queue+n, timeline, flow+node (keep|mid|out)+arrow, compare+col (before|after), entities+entity.
LISTS: alerts+alert+pill, feed, nba-list+nba.
TYPE: h3, h4, p, span, b, small, meta.`;
}
