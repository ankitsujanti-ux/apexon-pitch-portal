// Small helper shared by any step that asks the agent for JSON back.
// Models sometimes wrap JSON in ```json fences or add a stray sentence
// before/after it - this strips that and parses the actual object.

export function extractJson(text) {
  if (!text || typeof text !== "string") {
    throw new Error("extractJson: expected a non-empty string, got: " + text);
  }

  // Strip ```json ... ``` or ``` ... ``` fences if present.
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : text;

  // If there's still leading/trailing chatter, grab from the first { to
  // the last } (works for a single top-level JSON object).
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
