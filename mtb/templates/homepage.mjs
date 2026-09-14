import { renderHead, renderHeader, renderFooter, escapeHtml } from "./layout.mjs";
import { BASE_PATH } from "../scripts/config.mjs";

const GRADE_ICONS = {
  "Grade 6": "📗",
  "Grade 7": "📘",
  "Grade 8": "📙",
  "Grade 9": "📕",
  "GCSE": "🧮",
  "A-Level": "📈",
  "SAT": "📝",
};

export function renderHomepage(worksheets, path) {
  const head = renderHead({
    title: "MyTutBuddy | Interactive Maths Worksheets",
    description:
      "Free interactive Maths worksheets for Grade 6-9, GCSE, A-Level and SAT. Practise online and get an instant score with MyTutBuddy.",
    path,
  });

  const allGrades = [...new Set(worksheets.map((w) => w.grade))];
  const gradeCards = allGrades
    .map((g) => {
      const count = worksheets.filter((w) => w.grade === g).length;
      return `<div class="card">
        <div class="icon">${GRADE_ICONS[g] || "📐"}</div>
        <h3>${escapeHtml(g)} Maths</h3>
        <p>${count} interactive worksheet${count === 1 ? "" : "s"} to practise.</p>
        <a class="start-btn" href="${BASE_PATH}/worksheets/?grade=${encodeURIComponent(g)}">Explore →</a>
      </div>`;
    })
    .join("\n");

  const featured = worksheets.filter((w) => w.featured).slice(0, 3);
  const featuredList = (featured.length ? featured : worksheets.slice(0, 3))
    .map((w) => {
      const url = `${BASE_PATH}/worksheets/${w.gradeSlug}/${w.topicSlug}/${w.slug}/`;
      return `<div class="card">
        <div class="eyebrow">${escapeHtml(w.grade)} • ${escapeHtml(w.topic)}</div>
        <h3>${escapeHtml(w.title)}</h3>
        <p>${escapeHtml(w.shortDescription || "")}</p>
        <a class="start-btn" href="${url}">Start Worksheet →</a>
      </div>`;
    })
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
${head}
</head>
<body>
${renderHeader()}

<section class="hero">
  <h1>Interactive <span>Maths Worksheets</span></h1>
  <p>Practise Maths online — from Grade 6 through A-Level and SAT — with instant marking and feedback.</p>

  <form class="hero-search" action="${BASE_PATH}/worksheets/" method="get" onsubmit="return true;">
    <input type="text" name="q" placeholder="Search worksheets... e.g. algebra, fractions, trigonometry">
    <button class="button" type="submit">Search</button>
  </form>
  <a class="button secondary" href="${BASE_PATH}/worksheets/" style="margin-top:14px;">Browse All Worksheets</a>
</section>

<section class="section">
  <h2>Browse by Grade</h2>
  <div class="grid">
  ${gradeCards}
  </div>
</section>

<section class="section">
  <h2>Featured Worksheets</h2>
  <div class="grid">
  ${featuredList}
  </div>
</section>

<section class="section" style="text-align:center;">
  <h2>Why MyTutBuddy?</h2>
  <p style="max-width:680px;margin:0 auto;color:#667085;font-size:17px;">
    MyTutBuddy makes Maths practice interactive. Work through real worksheets online,
    get instant marking, and see exactly which questions to review — no printing, no PDFs.
  </p>
</section>

${renderFooter()}
</body>
</html>
`;
}
