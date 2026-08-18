// Turns "Acme Retail Co." into "acme-retail-co" - used for both the
// deck's output filename (Step 3) and the GitHub folder name (Step 5),
// so they always agree with each other.

export function slugify(name) {
  return String(name)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
