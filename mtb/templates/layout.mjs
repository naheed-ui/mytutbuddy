import { SITE_URL, BASE_PATH, SITE_NAME, SOCIAL } from "../scripts/config.mjs";

// Builds the <head> block. `path` is the site-relative path of this page
// (e.g. "/worksheets/gcse/algebra/solving-linear-equations/") used to build
// the canonical URL. Pass noindex:true for utility pages (like the thank-you
// page) that shouldn't show up in search results.
export function renderHead({ title, description, path, jsonLd = null, noindex = false }) {
  const canonical = `${SITE_URL}${path}`;
  return `<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<meta name="google-site-verification" content="5XzwimhY9VH7x2WTl0aX3Vo0zrVIEz9d5c9GoO-LUUk" />
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}">
${noindex ? '<meta name="robots" content="noindex">' : ""}
<link rel="canonical" href="${canonical}">
<meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:description" content="${escapeHtml(description)}">
<meta property="og:type" content="website">
<meta property="og:url" content="${canonical}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;500;600;700&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${BASE_PATH}/assets/styles.css">
${jsonLd ? `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>` : ""}`;
}

export function renderHeader() {
  return `<header class="site-header">
  <a class="logo" href="${BASE_PATH}/">${SITE_NAME}</a>
  <button class="nav-toggle" type="button" aria-label="Menu" aria-expanded="false" aria-controls="site-nav">
    <span></span><span></span><span></span>
  </button>
  <nav id="site-nav">
    <a href="${BASE_PATH}/">Home</a>
    <a href="${BASE_PATH}/worksheets/">Worksheets</a>
    <a href="${BASE_PATH}/teach-with-us/">Teach With Us</a>
    <a class="nav-cta" href="${BASE_PATH}/free-demo/">Free Demo Class</a>
  </nav>
</header>
<script>
  (function () {
    var btn = document.querySelector(".nav-toggle");
    var nav = document.getElementById("site-nav");
    if (!btn || !nav) return;
    btn.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
  })();
</script>`;
}

function socialIcon(name, url) {
  const icons = {
    instagram:
      '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1"/></svg>',
    youtube:
      '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="4"/><path d="M10 9l6 3-6 3V9z" fill="currentColor" stroke="none"/></svg>',
  };
  return `<a class="icon-btn" href="${url}" target="_blank" rel="noopener" aria-label="${name}">${icons[name] || ""}</a>`;
}

export function renderFooter() {
  const year = new Date().getFullYear();
  const social = Object.entries(SOCIAL)
    .filter(([, url]) => url)
    .map(([name, url]) => socialIcon(name, url))
    .join("\n    ");
  return `<footer class="site-footer">
  <p>
    <a href="${BASE_PATH}/free-demo/">Free Demo Class</a>
    &nbsp;•&nbsp;
    <a href="${BASE_PATH}/teach-with-us/">Teach With Us</a>
    &nbsp;•&nbsp;
    <a href="${BASE_PATH}/about/">About</a>
    &nbsp;•&nbsp;
    <a href="${BASE_PATH}/privacy/">Privacy Policy</a>
  </p>
  ${social ? `<div class="social-icons">\n    ${social}\n  </div>` : ""}
  <p>© ${year} ${SITE_NAME} • Interactive Maths Worksheets</p>
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
