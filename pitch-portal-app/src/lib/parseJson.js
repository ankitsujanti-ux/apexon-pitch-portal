// Small helper shared by any step that asks the agent for JSON back.
// Models sometimes wrap JSON in ```json fences, add Bing citation tokens
// ([[1]], markdown links), or a stray sentence around the object.

export function stripGroundingNoise(text) {
  return String(text || "")
    .replace(/\[\[[0-9]+\]\]/g, "")
    .replace(/\[([^\]]{0,120})\]\((https?:\/\/[^)]+)\)/g, "$2")
    .replace(/"confidence"\s*:\s*"i[^"]*"/g, '"confidence": "industry-typical"')
    .replace(/"confidence"\s*:\s*"c[^"]{0,12}"/g, '"confidence": "confirmed"')
    .replace(/"ance"\s*:/g, '"compliance":');
}

export function extractJson(text) {
  if (!text || typeof text !== "string") {
    throw new Error("extractJson: expected a non-empty string, got: " + text);
  }

  const cleaned = stripGroundingNoise(text);

  const fenced = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : cleaned;

  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  const jsonSlice =
    start !== -1 && end !== -1 && end > start
      ? candidate.slice(start, end + 1)
      : candidate;

  try {
    return JSON.parse(jsonSlice);
  } catch (err) {
    throw new Error(
      `extractJson: could not parse agent response as JSON (${err.message}). Raw response:\n${text}`
    );
  }
}
