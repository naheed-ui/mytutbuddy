import { renderHead, renderHeader, renderFooter, escapeHtml } from "./layout.mjs";
import { BASE_PATH } from "../scripts/config.mjs";

export function renderLibraryPage(worksheets, path) {
  const grades = [...new Set(worksheets.map((w) => w.grade))];
  const topics = [...new Set(worksheets.map((w) => w.topic))];
  const difficulties = [...new Set(worksheets.map((w) => w.difficulty))];

  const head = renderHead({
    title: "Maths Worksheets Library | MyTutBuddy",
    description:
      "Browse free interactive Maths worksheets for Grade 6-9, GCSE, A-Level and SAT. Search or filter by grade, topic and difficulty, then practise online with instant feedback.",
    path,
  });

  const cards = worksheets
    .map((w) => {
      const url = `${BASE_PATH}/worksheets/${w.gradeSlug}/${w.topicSlug}/${w.slug}/`;
      const searchText = [w.title, w.grade, w.topic, w.subtopic, w.difficulty].filter(Boolean).join(" ").toLowerCase();
      return `<div class="card worksheet"
        data-grade="${escapeHtml(w.grade)}"
        data-topic="${escapeHtml(w.topic)}"
        data-difficulty="${escapeHtml(w.difficulty)}"
        data-search="${escapeHtml(searchText)}">
        <div class="icon">📐</div>
        <div class="eyebrow">${escapeHtml(w.grade)} • ${escapeHtml(w.topic)}</div>
        <h3>${escapeHtml(w.title)}</h3>
        <p>${escapeHtml(w.shortDescription || "")}</p>
        <div class="tags">
          <span class="tag">${escapeHtml(w.difficulty)}</span>
          ${w.subtopic ? `<span class="tag">${escapeHtml(w.subtopic)}</span>` : ""}
        </div>
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

<section class="library-hero">
  <h1>Find a <span>Maths Worksheet</span></h1>
  <p>Search or filter ${worksheets.length} interactive Maths worksheets and practise online.</p>
</section>

<div class="search-area">
  <input type="text" id="search" class="search-box" placeholder="🔎 Search worksheets... e.g. algebra, fractions" onkeyup="applyFilters()">
</div>

<div class="filters">
  <select id="gradeFilter" onchange="applyFilters()">
    <option value="all">All grades</option>
    ${grades.map((g) => `<option value="${escapeHtml(g)}">${escapeHtml(g)}</option>`).join("\n")}
  </select>
  <select id="topicFilter" onchange="applyFilters()">
    <option value="all">All topics</option>
    ${topics.map((t) => `<option value="${escapeHtml(t)}">${escapeHtml(t)}</option>`).join("\n")}
  </select>
  <select id="difficultyFilter" onchange="applyFilters()">
    <option value="all">All difficulties</option>
    ${difficulties.map((d) => `<option value="${escapeHtml(d)}">${escapeHtml(d)}</option>`).join("\n")}
  </select>
</div>

<main class="section">
  <p class="result-count" id="resultCount"></p>
  <div class="grid" id="worksheetGrid">
  ${cards}
  </div>
  <div id="noResults" class="no-results">No worksheets found. Try another search or filter.</div>
</main>

${renderFooter()}

<script>
  function applyFilters() {
    const search = document.getElementById("search").value.toLowerCase();
    const grade = document.getElementById("gradeFilter").value;
    const topic = document.getElementById("topicFilter").value;
    const difficulty = document.getElementById("difficultyFilter").value;

    const cards = document.querySelectorAll(".worksheet");
    let found = 0;

    cards.forEach(function (card) {
      const matchesSearch = card.dataset.search.includes(search);
      const matchesGrade = grade === "all" || card.dataset.grade === grade;
      const matchesTopic = topic === "all" || card.dataset.topic === topic;
      const matchesDifficulty = difficulty === "all" || card.dataset.difficulty === difficulty;

      const show = matchesSearch && matchesGrade && matchesTopic && matchesDifficulty;
      card.style.display = show ? "block" : "none";
      if (show) found++;
    });

    document.getElementById("noResults").style.display = found === 0 ? "block" : "none";
    document.getElementById("resultCount").textContent = found + " worksheet" + (found === 1 ? "" : "s") + " found";
  }

  document.addEventListener("DOMContentLoaded", function () {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q");
    if (q) document.getElementById("search").value = q;
    applyFilters();
  });
</script>
</body>
</html>
`;
}
