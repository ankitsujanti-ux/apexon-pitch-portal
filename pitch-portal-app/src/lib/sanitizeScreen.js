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
  return { ok: true, html: out };
}

export function screenFingerprint(html) {
  const tags = [...String(html || "").matchAll(/<([a-z0-9]+)([^>]*)>/gi)].map((m) => {
    const cls = /class="([^"]*)"/.exec(m[2] || "");
    const lead = cls ? cls[1].split(/\s+/)[0] : "";
    return lead ? `${m[1]}.${lead}` : m[1];
  });
  return tags.slice(0, 12).join(">");
}
