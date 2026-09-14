import { SITE_URL, BASE_PATH, SITE_NAME } from "../scripts/config.mjs";

// Builds the <head> block. `path` is the site-relative path of this page
// (e.g. "/worksheets/gcse/algebra/solving-linear-equations/") used to build
// the canonical URL.
export function renderHead({ title, description, path, jsonLd = null }) {
  const canonical = `${SITE_URL}${path}`;
  return `<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}">
<link rel="canonical" href="${canonical}">
<meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:description" content="${escapeHtml(description)}">
<meta property="og:type" content="website">
<meta property="og:url" content="${canonical}">
<link rel="stylesheet" href="${BASE_PATH}/assets/styles.css">
${jsonLd ? `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>` : ""}`;
}

export function renderHeader() {
  return `<header class="site-header">
  <a class="logo" href="${BASE_PATH}/">${SITE_NAME}</a>
  <nav>
    <a href="${BASE_PATH}/">Home</a>
    <a href="${BASE_PATH}/worksheets/">Worksheets</a>
  </nav>
</header>`;
}

export function renderFooter() {
  const year = new Date().getFullYear();
  return `<footer class="site-footer">
  © ${year} ${SITE_NAME} • Interactive Maths Worksheets
</footer>`;
}

export function escapeHtml(str = "") {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

// Turns "GCSE" -> "gcse", "Grade 9" -> "grade-9", "A-Level" -> "a-level"
export function slugify(str) {
  return String(str)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
