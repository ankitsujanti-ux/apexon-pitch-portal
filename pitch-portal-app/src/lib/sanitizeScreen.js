// The agent writes HTML. This is the only gate between that markup and the
// page. It cannot run script, leave the type scale, or invent colours. If the
// fragment is unsafe or empty, the caller falls back to the block renderer.

import { ALLOWED_ATTRS, ALLOWED_CLASSES, ALLOWED_TAGS } from "./designContract.js";

const UNSAFE =
  /<script|<iframe|<object|<embed|<link|<meta|<style|<svg|<img|<form|<input|<textarea|<video|<audio|<base|javascript:|data:text\/html|\son[a-z]+\s*=/i;

function filterClasses(value) {
  return String(value || "")
    .split(/\s+/)
    .filter((c) => ALLOWED_CLASSES.has(c))
    .join(" ");
}

function filterStyle(value) {
  // Width on a bar or funnel step is the only inline style the design system
  // needs. Colour, font-size, and positioning stay in the stylesheet.
  const kept = String(value || "")
    .split(";")
    .map((s) => s.trim())
    .filter((s) => /^width\s*:\s*\d{1,3}%$/i.test(s) || /^flex\s*:\s*[\d.]+$/i.test(s));
  return kept.join(";");
}

function sanitizeOpenTag(tag, rawAttrs, tabId) {
  if (!ALLOWED_TAGS.has(tag)) return "";
  const attrs = [];
  const re = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  let match;
  while ((match = re.exec(rawAttrs || ""))) {
    const name = match[1].toLowerCase();
    if (!ALLOWED_ATTRS.has(name) || name.startsWith("on")) continue;
    const value = match[2] ?? match[3] ?? match[4] ?? "";
    if (name === "class") {
      const cls = filterClasses(value);
      if (cls) attrs.push(`class="${cls}"`);
    } else if (name === "style") {
      const style = filterStyle(value);
      if (style) attrs.push(`style="${style}"`);
    } else if (name === "id") {
      const safe = String(value).replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 40);
      if (safe) attrs.push(`id="${tabId}-${safe}"`);
    } else if (name === "type") {
      if (tag === "button") attrs.push('type="button"');
    } else if (name === "data-feed" || name === "data-kpi" || name === "aria-label") {
      const clean = String(value).replace(/[<>"']/g, "").slice(0, 80);
      attrs.push(`${name}="${clean}"`);
    }
  }
  return `<${tag}${attrs.length ? ` ${attrs.join(" ")}` : ""}>`;
}

function textLength(html) {
  return String(html || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim().length;
}

export function sanitizeScreen(html, { tabId = "tab" } = {}) {
  const raw = String(html || "").trim();
  if (!raw) return { ok: false, reason: "empty" };
  if (raw.length > 14000) return { ok: false, reason: "too large" };
  if (UNSAFE.test(raw)) return { ok: false, reason: "unsafe construct" };

  const out = raw.replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)\b([^>]*)>/g, (full, tag, attrs) => {
    const name = tag.toLowerCase();
    if (full.startsWith("</")) return ALLOWED_TAGS.has(name) ? `</${name}>` : "";
    if (full.endsWith("/>")) {
      const open = sanitizeOpenTag(name, attrs, tabId);
      return open ? `${open}</${name}>` : "";
    }
    return sanitizeOpenTag(name, attrs, tabId);
  });

  if (textLength(out) < 32) return { ok: false, reason: "too little content" };
  if (!/<(article|div|section|table|ul|ol)\b/i.test(out)) {
    return { ok: false, reason: "no layout root" };
  }
  return { ok: true, html: compileScreen(out) };
}

const LAYOUT_ROOT = /\b(row|stack|split-v|screen|workspace|tri|eq)\b/;

function classOf(html) {
  const m = /^<[a-z]+([^>]*)>/i.exec(String(html || ""));
  const cls = m && /class="([^"]*)"/.exec(m[1] || "");
  return cls ? cls[1] : "";
}

function splitTopLevel(html) {
  const s = String(html || "").trim();
  const parts = [];
  let i = 0;
  while (i < s.length) {
    if (s[i] !== "<") {
      const skip = s.slice(i).match(/^[^<]*/);
      i += skip ? skip[0].length : 1;
      continue;
    }
    if (s.startsWith("</", i)) {
      const close = s.slice(i).match(/^<\/[a-zA-Z][a-zA-Z0-9]*>/);
      i += close ? close[0].length : 1;
      continue;
    }
    const open = s.slice(i).match(/^<([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/);
    if (!open) break;
    const tag = open[1].toLowerCase();
    const start = i;
    i += open[0].length;
    if (open[0].endsWith("/>")) {
      parts.push(s.slice(start, i));
      continue;
    }
    let depth = 1;
    while (depth > 0 && i < s.length) {
      const next = s.slice(i).match(/<(\/?)([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/);
      if (!next) {
        i = s.length;
        break;
      }
      i += s.slice(i).indexOf(next[0]) + next[0].length;
      if (next[2].toLowerCase() !== tag) continue;
      if (next[1] === "/") depth -= 1;
      else if (!next[0].endsWith("/>")) depth += 1;
    }
    parts.push(s.slice(start, i));
  }
  return parts.filter((p) => /<[a-z]/i.test(p));
}

function innerHtml(el) {
  return String(el || "").replace(/^<[^>]+>/, "").replace(/<\/[a-zA-Z][a-zA-Z0-9]*>$/, "");
}

function flattenWidgets(html) {
  const out = [];
  for (const el of splitTopLevel(html)) {
    const cls = classOf(el);
    const layoutOnly = LAYOUT_ROOT.test(cls) && !/\b(viz|side|kpis|board|heat|compare|queue|alerts|gauge|flow|matrix)\b/.test(cls);
    if (layoutOnly) out.push(...flattenWidgets(innerHtml(el)));
    else out.push(el);
  }
  return out;
}

function kindOfWidget(el) {
  const cls = classOf(el);
  const body = String(el);
  if (/\bkpis\b/.test(cls) || /^<.*class="[^"]*\bkpi\b/.test(body.slice(0, 80))) return "metrics";
  if (/\b(board|heat|matrix|table)\b/.test(cls) || /<table\b/i.test(body) || /\bboard\b/.test(body)) return "hero";
  if (/\b(alerts|queue|nba-list|feed|compare|flow|gauge|callout)\b/.test(cls) || /<(ul|ol)\b/i.test(body)) return "rail";
  if (/^<h[34]\b/i.test(el)) return "heading";
  if (/^<button\b/i.test(el)) return "action";
  return "hero";
}

function polish(el) {
  let html = String(el || "");
  html = html.replace(/<button\b(?![^>]*class=)/gi, '<button class="primary" type="button"');
  html = html.replace(/<button class="/gi, '<button type="button" class="');
  return html;
}

function attachHeading(heading, el) {
  if (!heading) return el;
  if (/^<(ul|ol)\b/i.test(el)) return `${heading}${el}`;
  return String(el).replace(/^(<[a-z]+[^>]*>)/i, `$1${heading}`);
}

// Agent HTML is a pile of widgets. The page is a product screen: metrics on
// top, the working view on the left, the next move on the right. Anything else
// is what made the Microsoft mockup unreadable.
export function compileScreen(html) {
  const widgets = flattenWidgets(html).map(polish);
  if (!widgets.length) return html;
  const metrics = [];
  const heroes = [];
  const rails = [];
  let pendingHeading = "";
  for (const el of widgets) {
    const kind = kindOfWidget(el);
    if (kind === "heading") {
      pendingHeading = el;
      continue;
    }
    if (kind === "metrics") {
      metrics.push(el);
      continue;
    }
    const wrapped = attachHeading(pendingHeading, el);
    pendingHeading = "";
    if (kind === "rail" || kind === "action") rails.push(wrapped);
    else heroes.push(wrapped);
  }
  if (pendingHeading) rails.push(pendingHeading);
  if (heroes.length > 1) rails.push(...heroes.slice(1));
  const hero = heroes[0] || rails.shift() || widgets[0];
  const rail = rails.join("");
  const strip = metrics.join("");
  return `<div class="workspace">${strip ? `<div class="workspace-metrics">${strip}</div>` : ""}<div class="workspace-body${rail ? "" : " solo"}"><div class="workspace-hero">${hero}</div>${rail ? `<div class="workspace-rail">${rail}</div>` : ""}</div></div>`;
}

export function screenFingerprint(html) {
  const tags = [...String(html || "").matchAll(/<([a-z0-9]+)([^>]*)>/gi)].map((m) => {
    const cls = /class="([^"]*)"/.exec(m[2] || "");
    const lead = cls ? cls[1].split(/\s+/)[0] : "";
    return lead ? `${m[1]}.${lead}` : m[1];
  });
  return tags.slice(0, 12).join(">");
}
