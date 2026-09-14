import { renderHead, renderHeader, renderFooter, escapeHtml } from "./layout.mjs";
import { BASE_PATH, SITE_URL } from "../scripts/config.mjs";

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function renderQuestion(q, index) {
  const num = index + 1;
  const promptHtml = `<div class="prompt"><p>${num}. ${escapeHtml(q.prompt)}</p></div>`;
  const image = q.image
    ? `<img class="diagram" src="${escapeHtml(q.image)}" alt="Diagram for question ${num}">`
    : "";

  let body = "";
  let dataType = q.type;
  let dataAnswer = "";

  if (q.type === "text") {
    const alt = q.acceptableAnswers && q.acceptableAnswers.length ? q.acceptableAnswers : [q.answer];
    dataAnswer = escapeHtml(JSON.stringify(alt));
    body = `<input type="text" placeholder="Type your answer">`;
  } else if (q.type === "multiple-choice") {
    dataAnswer = escapeHtml(q.answer);
    body = `<div class="mc-options">
      ${q.options
        .map(
          (opt, i) => `<label class="mc-option">
          <input type="radio" name="q${index}" value="${escapeHtml(opt)}">
          <span>${escapeHtml(opt)}</span>
        </label>`
        )
        .join("\n")}
    </div>`;
  } else if (q.type === "dropdown") {
    dataAnswer = escapeHtml(q.answer);
    body = `<select>
      <option value="">-- Select an answer --</option>
      ${q.options.map((opt) => `<option value="${escapeHtml(opt)}">${escapeHtml(opt)}</option>`).join("\n")}
    </select>`;
  } else if (q.type === "true-false") {
    dataAnswer = q.answer ? "true" : "false";
    body = `<div class="tf-buttons">
      <div class="tf-btn" data-value="true" onclick="selectTF(this)">True</div>
      <div class="tf-btn" data-value="false" onclick="selectTF(this)">False</div>
    </div>`;
  } else if (q.type === "matching") {
    const rightOptions = shuffle(q.pairs.map((p) => p.right));
    body = `<div class="match-rows">
      ${q.pairs
        .map(
          (p) => `<div class="match-row">
          <div class="match-left">${escapeHtml(p.left)}</div>
          <select data-correct="${escapeHtml(p.right)}">
            <option value="">-- match --</option>
            ${rightOptions.map((r) => `<option value="${escapeHtml(r)}">${escapeHtml(r)}</option>`).join("\n")}
          </select>
        </div>`
        )
        .join("\n")}
    </div>`;
  }

  return `<div class="question" data-type="${dataType}" data-answer='${dataAnswer}'>
    <span class="q-number">Question ${num}</span>
    ${image}
    ${promptHtml}
    ${body}
    <div class="feedback"></div>
  </div>`;
}

export function renderWorksheetPage(ws, path) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    name: ws.title,
    description: ws.seoDescription || ws.shortDescription,
    educationalLevel: ws.grade,
    about: ws.topic,
    url: `${SITE_URL}${path}`,
    isAccessibleForFree: true,
    learningResourceType: "Interactive Worksheet",
    provider: { "@type": "Organization", name: "MyTutBuddy" },
  };

  const head = renderHead({
    title: ws.seoTitle || `${ws.title} | MyTutBuddy`,
    description: ws.seoDescription || ws.shortDescription,
    path,
    jsonLd,
  });

  const questionsHtml = ws.questions.map((q, i) => renderQuestion(q, i)).join("\n");
  const total = ws.questions.length;

  return `<!DOCTYPE html>
<html lang="en">
<head>
${head}
<link rel="stylesheet" href="${BASE_PATH}/assets/vendor/katex/katex.min.css">
</head>
<body>
${renderHeader()}

<main class="worksheet-wrap">

  <p class="worksheet-meta">${escapeHtml(ws.grade)} • ${escapeHtml(ws.topic)}${
    ws.subtopic ? " • " + escapeHtml(ws.subtopic) : ""
  } • ${escapeHtml(ws.difficulty)}</p>

  <h1>${escapeHtml(ws.title)}</h1>
  ${ws.intro ? `<p class="worksheet-intro">${escapeHtml(ws.intro)}</p>` : ""}

  <div class="progress-bar-track">
    <div class="progress-bar-fill" id="progressFill"></div>
  </div>

  <div id="questions">
  ${questionsHtml}
  </div>

  <div class="check-btn-wrap">
    <button class="button" onclick="checkAnswers()">CHECK MY ANSWERS</button>
  </div>

  <div class="result" id="result">
    <div class="score" id="score"></div>
    <p id="message"></p>
    <button class="button secondary" onclick="tryAgain()">TRY AGAIN</button>
  </div>

</main>

${renderFooter()}

<script src="${BASE_PATH}/assets/vendor/katex/katex.min.js"></script>
<script src="${BASE_PATH}/assets/vendor/katex/auto-render.min.js"></script>
<script>
  document.addEventListener("DOMContentLoaded", function () {
    renderMathInElement(document.body, {
      delimiters: [
        { left: "$$", right: "$$", display: true },
        { left: "$", right: "$", display: false }
      ]
    });
    updateProgress();
    document.querySelectorAll("#questions input, #questions select").forEach(function (el) {
      el.addEventListener("input", updateProgress);
      el.addEventListener("change", updateProgress);
    });
  });

  function selectTF(el) {
    el.parentElement.querySelectorAll(".tf-btn").forEach(function (b) { b.classList.remove("selected"); });
    el.classList.add("selected");
    updateProgress();
  }

  function isAnswered(q) {
    const type = q.dataset.type;
    if (type === "text") return q.querySelector("input").value.trim() !== "";
    if (type === "multiple-choice") return !!q.querySelector("input:checked");
    if (type === "dropdown") return q.querySelector("select").value !== "";
    if (type === "true-false") return !!q.querySelector(".tf-btn.selected");
    if (type === "matching") {
      const selects = q.querySelectorAll("select");
      return Array.from(selects).every(function (s) { return s.value !== ""; });
    }
    return false;
  }

  function updateProgress() {
    const questions = document.querySelectorAll("#questions .question");
    let answered = 0;
    questions.forEach(function (q) { if (isAnswered(q)) answered++; });
    const pct = Math.round((answered / questions.length) * 100);
    document.getElementById("progressFill").style.width = pct + "%";
  }

  function normalize(str) {
    return String(str).toLowerCase().replace(/\\s+/g, "");
  }

  function checkAnswers() {
    const questions = document.querySelectorAll("#questions .question");
    let correct = 0;

    questions.forEach(function (q) {
      const type = q.dataset.type;
      const feedback = q.querySelector(".feedback");
      let isCorrect = false;

      if (type === "text") {
        const accepted = JSON.parse(q.dataset.answer);
        const val = q.querySelector("input").value;
        isCorrect = accepted.some(function (a) { return normalize(a) === normalize(val); });
      } else if (type === "multiple-choice") {
        const checked = q.querySelector("input:checked");
        isCorrect = !!checked && checked.value === q.dataset.answer;
      } else if (type === "dropdown") {
        isCorrect = q.querySelector("select").value === q.dataset.answer;
      } else if (type === "true-false") {
        const sel = q.querySelector(".tf-btn.selected");
        isCorrect = !!sel && sel.dataset.value === q.dataset.answer;
      } else if (type === "matching") {
        const selects = q.querySelectorAll("select");
        isCorrect = Array.from(selects).every(function (s) { return s.value !== "" && s.value === s.dataset.correct; });
      }

      q.classList.remove("correct", "incorrect");
      if (isCorrect) {
        correct++;
        q.classList.add("correct");
        feedback.innerHTML = "✅ Correct!";
      } else {
        q.classList.add("incorrect");
        feedback.innerHTML = "❌ Not quite. Review this one and try again.";
      }
    });

    const total = questions.length;
    const percentage = Math.round((correct / total) * 100);

    document.getElementById("score").innerHTML = correct + " / " + total + " — " + percentage + "%";

    const msg = document.getElementById("message");
    if (percentage === 100) {
      msg.innerHTML = "🎉 Excellent work! You got everything correct.";
    } else if (percentage >= 50) {
      msg.innerHTML = "👍 Good effort! Review the questions you missed.";
    } else {
      msg.innerHTML = "📚 Keep practising! Review the topic and try again.";
    }

    document.getElementById("result").style.display = "block";
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  }

  function tryAgain() {
    document.querySelectorAll("#questions .question").forEach(function (q) {
      q.classList.remove("correct", "incorrect");
      q.querySelector(".feedback").innerHTML = "";
      const type = q.dataset.type;
      if (type === "text") q.querySelector("input").value = "";
      if (type === "multiple-choice") q.querySelectorAll("input").forEach(function (r) { r.checked = false; });
      if (type === "dropdown") q.querySelector("select").value = "";
      if (type === "true-false") q.querySelectorAll(".tf-btn").forEach(function (b) { b.classList.remove("selected"); });
      if (type === "matching") q.querySelectorAll("select").forEach(function (s) { s.value = ""; });
    });
    document.getElementById("result").style.display = "none";
    updateProgress();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
</script>
</body>
</html>
`;
}
