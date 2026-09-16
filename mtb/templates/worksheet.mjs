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
  } else if (q.type === "join-lines") {
    const rightOptions = shuffle(q.pairs.map((p) => p.right));
    dataAnswer = escapeHtml(JSON.stringify(q.pairs.map((p) => p.right)));
    body = `<div class="joinlines-wrap" data-connections="{}">
      <svg class="joinlines-svg"></svg>
      <div class="joinlines-columns">
        <div class="joinlines-left">
          ${q.pairs
            .map(
              (p, i) => `<div class="jl-node">
              <span class="jl-label">${escapeHtml(p.left)}</span>
              <span class="jl-dot" data-side="left" data-index="${i}"></span>
            </div>`
            )
            .join("\n")}
        </div>
        <div class="joinlines-right">
          ${rightOptions
            .map(
              (r) => `<div class="jl-node">
              <span class="jl-dot" data-side="right" data-value="${escapeHtml(r)}"></span>
              <span class="jl-label">${escapeHtml(r)}</span>
            </div>`
            )
            .join("\n")}
        </div>
      </div>
    </div>`;
  } else if (q.type === "word-bank") {
    dataAnswer = escapeHtml(JSON.stringify(q.blanks.map((b) => b.answer)));
    const pool = shuffle(q.wordBank);
    const poolHtml = `<div class="wordbank-pool">
        ${pool.map((w) => `<span class="wb-chip" data-word="${escapeHtml(w)}">${escapeHtml(w)}</span>`).join("\n")}
      </div>`;

    // Two layouts: image grid (each blank has an "image"), or sentences with _____
    const isImageGrid = q.blanks.every((b) => b.image);
    const blanksHtml = isImageGrid
      ? `<div class="wordbank-images">
        ${q.blanks
          .map(
            (b, i) => `<div class="wb-image-cell">
            <img src="${escapeHtml(b.image)}" alt="${escapeHtml(b.alt || "Image " + (i + 1))}">
            <span class="wb-blank" data-index="${i}" data-answer="${escapeHtml(b.answer)}"></span>
          </div>`
          )
          .join("\n")}
      </div>`
      : `<div class="wordbank-blanks">
        ${q.blanks
          .map((b, i) => {
            const parts = b.text.split("_____");
            const before = parts[0] !== undefined ? parts[0] : "";
            const after = parts[1] !== undefined ? parts[1] : "";
            return `<p class="wb-sentence">${i + 1}. ${escapeHtml(before)}<span class="wb-blank" data-index="${i}" data-answer="${escapeHtml(
              b.answer
            )}"></span>${escapeHtml(after)}</p>`;
          })
          .join("\n")}
      </div>`;

    body = `<div class="wordbank-wrap">${poolHtml}${blanksHtml}</div>`;
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
    initJoinLines();
    initWordBanks();
  });

  // ---------- word-bank (shared pool, tap-to-place) ----------

  function initWordBanks() {
    document.querySelectorAll(".wordbank-wrap").forEach(function (wrap) {
      let selectedChip = null;
      const chipForBlank = {}; // blankIndex -> chip element

      function selectChip(chip) {
        if (selectedChip) selectedChip.classList.remove("wb-selected");
        if (selectedChip === chip) { selectedChip = null; return; }
        selectedChip = chip;
        chip.classList.add("wb-selected");
      }

      function returnChip(blankIndex) {
        const chip = chipForBlank[blankIndex];
        if (chip) {
          chip.classList.remove("wb-used");
          delete chipForBlank[blankIndex];
        }
      }

      wrap.querySelectorAll(".wb-chip").forEach(function (chip) {
        chip.addEventListener("click", function () {
          if (chip.classList.contains("wb-used")) return;
          selectChip(chip);
        });
      });

      wrap.querySelectorAll(".wb-blank").forEach(function (blank) {
        blank.addEventListener("click", function () {
          const idx = blank.dataset.index;
          if (selectedChip) {
            if (chipForBlank[idx]) returnChip(idx);
            blank.textContent = selectedChip.dataset.word;
            blank.classList.add("wb-filled");
            selectedChip.classList.add("wb-used");
            chipForBlank[idx] = selectedChip;
            selectChip(selectedChip); // deselect
            updateProgress();
          } else if (blank.classList.contains("wb-filled")) {
            returnChip(idx);
            blank.textContent = "";
            blank.classList.remove("wb-filled");
            updateProgress();
          }
        });
      });

      wrap._resetWordBank = function () {
        wrap.querySelectorAll(".wb-blank").forEach(function (blank) {
          blank.textContent = "";
          blank.classList.remove("wb-filled");
        });
        wrap.querySelectorAll(".wb-chip").forEach(function (chip) {
          chip.classList.remove("wb-used", "wb-selected");
        });
        selectedChip = null;
        for (const k in chipForBlank) delete chipForBlank[k];
      };
    });
  }

  // ---------- join-lines (draw-a-line matching) ----------

  function initJoinLines() {
    document.querySelectorAll(".joinlines-wrap").forEach(function (wrap) {
      const svg = wrap.querySelector(".joinlines-svg");
      let dragging = null;
      let connections = {};

      function dotCenter(dot) {
        const dotRect = dot.getBoundingClientRect();
        const wrapRect = wrap.getBoundingClientRect();
        return {
          x: dotRect.left + dotRect.width / 2 - wrapRect.left,
          y: dotRect.top + dotRect.height / 2 - wrapRect.top,
        };
      }

      function redraw(tempEnd) {
        svg.innerHTML = "";
        Object.keys(connections).forEach(function (leftIndex) {
          const rightValue = connections[leftIndex];
          const leftDot = wrap.querySelector('.jl-dot[data-side="left"][data-index="' + leftIndex + '"]');
          const rightDot = wrap.querySelector('.jl-dot[data-side="right"][data-value="' + CSS.escape(rightValue) + '"]');
          if (!leftDot || !rightDot) return;
          drawLine(dotCenter(leftDot), dotCenter(rightDot), false);
        });
        if (dragging && tempEnd) {
          const startDot = wrap.querySelector(
            '.jl-dot[data-side="' + dragging.side + '"]' +
              (dragging.side === "left" ? '[data-index="' + dragging.index + '"]' : '[data-value="' + CSS.escape(dragging.value) + '"]')
          );
          if (startDot) drawLine(dotCenter(startDot), tempEnd, true);
        }
      }

      function drawLine(a, b, temp) {
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", a.x);
        line.setAttribute("y1", a.y);
        line.setAttribute("x2", b.x);
        line.setAttribute("y2", b.y);
        line.setAttribute("class", temp ? "jl-line-temp" : "jl-line");
        svg.appendChild(line);
      }

      function pointFromEvent(e) {
        const wrapRect = wrap.getBoundingClientRect();
        const pt = e.touches && e.touches[0] ? e.touches[0] : e;
        return { x: pt.clientX - wrapRect.left, y: pt.clientY - wrapRect.top, clientX: pt.clientX, clientY: pt.clientY };
      }

      function updateConnectionsAttr() {
        wrap.dataset.connections = JSON.stringify(connections);
        updateProgress();
      }

      function onDown(e) {
        const dot = e.target.closest(".jl-dot");
        if (!dot) return;
        e.preventDefault();
        const side = dot.dataset.side;
        dragging = side === "left" ? { side: "left", index: dot.dataset.index } : { side: "right", value: dot.dataset.value };
        const p = pointFromEvent(e);
        redraw(p);
        document.addEventListener("mousemove", onMove);
        document.addEventListener("touchmove", onMove, { passive: false });
        document.addEventListener("mouseup", onUp);
        document.addEventListener("touchend", onUp);
      }

      function onMove(e) {
        if (!dragging) return;
        e.preventDefault();
        redraw(pointFromEvent(e));
      }

      function onUp(e) {
        if (!dragging) return;
        const p = pointFromEvent(e);
        const el = document.elementFromPoint(p.clientX, p.clientY);
        const targetDot = el ? el.closest(".jl-dot") : null;

        if (targetDot && targetDot.dataset.side !== dragging.side) {
          let leftIndex, rightValue;
          if (dragging.side === "left") {
            leftIndex = dragging.index;
            rightValue = targetDot.dataset.value;
          } else {
            leftIndex = targetDot.dataset.index;
            rightValue = dragging.value;
          }
          connections[leftIndex] = rightValue;
        }

        dragging = null;
        redraw(null);
        updateConnectionsAttr();
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("touchmove", onMove);
        document.removeEventListener("mouseup", onUp);
        document.removeEventListener("touchend", onUp);
      }

      wrap.querySelectorAll(".jl-dot").forEach(function (dot) {
        dot.addEventListener("mousedown", onDown);
        dot.addEventListener("touchstart", onDown, { passive: false });
      });

      window.addEventListener("resize", function () { redraw(null); });

      wrap._resetJoinLines = function () {
        connections = {};
        updateConnectionsAttr();
        redraw(null);
      };
    });
  }

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
    if (type === "join-lines") {
      const wrap = q.querySelector(".joinlines-wrap");
      const total = q.querySelectorAll(".jl-dot[data-side='left']").length;
      const connections = JSON.parse(wrap.dataset.connections || "{}");
      return Object.keys(connections).length === total;
    }
    if (type === "word-bank") {
      const blanks = q.querySelectorAll(".wb-blank");
      return Array.from(blanks).every(function (b) { return b.classList.contains("wb-filled"); });
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
    return String(str).toLowerCase().replace(/\s+/g, "");
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
      } else if (type === "join-lines") {
        const wrap = q.querySelector(".joinlines-wrap");
        const expected = JSON.parse(q.dataset.answer);
        const connections = JSON.parse(wrap.dataset.connections || "{}");
        isCorrect = expected.every(function (rightValue, i) { return connections[i] === rightValue; });
      } else if (type === "word-bank") {
        const blanks = q.querySelectorAll(".wb-blank");
        isCorrect = Array.from(blanks).every(function (b) {
          return b.classList.contains("wb-filled") && normalize(b.textContent) === normalize(b.dataset.answer);
        });
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
      if (type === "join-lines") {
        const wrap = q.querySelector(".joinlines-wrap");
        if (wrap && wrap._resetJoinLines) wrap._resetJoinLines();
      }
      if (type === "word-bank") {
        const wrap = q.querySelector(".wordbank-wrap");
        if (wrap && wrap._resetWordBank) wrap._resetWordBank();
      }
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