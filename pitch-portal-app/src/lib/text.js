// Every "…the lead", "…control systems so", "Prevent line" defect came from
// slicing strings at a character count. Nothing in the deck or the mockup should
// cut text at an arbitrary offset again — these helpers are the only sanctioned
// way to shorten anything, and none of them can end mid-word.

const ELLIPSIS = "\u2026";

// Words that cannot end a heading or a trimmed phrase.
const DANGLING =
  /^(and|or|the|a|an|of|to|in|on|for|with|so|that|from|by|at|as|is|are|was|were|but|because|while|when|which|their|its|this|these|then|into|over|per|via|it|they|we|you)$/i;

export function squash(text) {
  return String(text ?? "").replace(/\s+/g, " ").trim();
}

function words(text) {
  return squash(text).split(" ").filter(Boolean);
}

// Split into sentences, keeping terminal punctuation.
export function sentences(text) {
  return squash(text)
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

// Shorten to whole words. Adds an ellipsis only when something was dropped and
// the caller wants the reader to know the thought continues.
export function toWords(text, maxWords, { ellipsis = false } = {}) {
  const list = words(text);
  if (list.length <= maxWords) return list.join(" ");
  const kept = list.slice(0, maxWords);
  while (kept.length > 1 && DANGLING.test(kept[kept.length - 1])) kept.pop();
  const out = kept.join(" ").replace(/[,;:]$/, "");
  return ellipsis ? `${out}${ELLIPSIS}` : out;
}

// Shorten to a character budget without ever splitting a word.
export function toChars(text, maxChars, { ellipsis = true } = {}) {
  const clean = squash(text);
  if (clean.length <= maxChars) return clean;
  const budget = ellipsis ? Math.max(1, maxChars - 1) : maxChars;
  let cut = clean.slice(0, budget);
  if (/\S/.test(clean.charAt(budget))) cut = cut.replace(/\s+\S*$/, "");
  cut = cut.replace(/[\s,;:.\-–—]+$/, "");
  const kept = cut.split(" ").filter(Boolean);
  while (kept.length > 1 && DANGLING.test(kept[kept.length - 1])) kept.pop();
  cut = kept.join(" ");
  if (!cut) cut = words(clean)[0] || "";
  return ellipsis ? `${cut}${ELLIPSIS}` : cut;
}

// Keep as many WHOLE sentences as fit. A paragraph that has to be shortened
// should still read as finished prose, which is why this is preferred for body
// copy over any character cut.
export function toSentences(text, maxChars) {
  const clean = squash(text);
  if (clean.length <= maxChars) return clean;
  const parts = sentences(clean);
  let out = "";
  for (const part of parts) {
    const next = out ? `${out} ${part}` : part;
    if (next.length > maxChars) break;
    out = next;
  }
  // A single sentence longer than the budget still has to be cut, but it gets
  // an ellipsis so the reader knows it was trimmed.
  return out || toChars(clean, maxChars);
}

// A heading or tab label: a short noun phrase, never punctuated mid-thought and
// never ellipsised. Strips the instructional lead-ins the model likes to write
// ("Start with the newest defect spike" -> "Newest defect spike").
export function toLabel(text, maxWords = 5) {
  let clean = squash(text)
    // Cards supply their own numbering, so a leading "1." is duplication.
    .replace(/^\d+\s*[.)\]:-]\s*/, "")
    .replace(/^(start|begin)\s+(with|from)\s+(the\s+|a\s+|an\s+)?/i, "")
    .replace(/^(look|focus|check)\s+(at|on|first at)\s+(the\s+|a\s+|an\s+)?/i, "")
    .replace(/^(the|a|an)\s+/i, "");
  // Only split on separators that genuinely delimit clauses. Hyphens do not:
  // splitting on them turned "Prevent line-side part shortages" into
  // "Prevent line".
  clean = clean.split(/\s+[\u2014\u2013|]\s+|:\s+/)[0].trim();
  clean = clean.split(/,\s+/)[0].trim();
  const list = words(clean).slice(0, maxWords);
  // A label must not trail off on a function word ("Newest defect spike that
  // is"). Drop them until it ends on something meaningful.
  while (list.length > 1 && DANGLING.test(list[list.length - 1])) list.pop();
  const label = list.join(" ").replace(/[\s,;:.]+$/, "");
  return label.charAt(0).toUpperCase() + label.slice(1);
}

// Does this text look like it was cut off? Used by the visual checks.
export function looksTruncated(text) {
  const clean = squash(text);
  if (!clean) return false;
  if (clean.endsWith(ELLIPSIS) || clean.endsWith("...")) return true;
  // Ends on a word that cannot end a sentence.
  return /\b(and|or|the|a|an|of|to|in|on|for|with|so|that|from|by|at|as|is|are|was|were|but|because|while|when|which|their|its|this|these|then)$/i.test(
    clean.replace(/[.!?]$/, "")
  );
}
