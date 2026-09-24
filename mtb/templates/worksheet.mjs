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

// Renders a string, turning **x** into a red-highlighted digit/portion.
// Used so worksheet data can mark exactly one digit as "the red digit".
function highlightDigit(str) {
  const parts = String(str).split("**");
  if (parts.length === 3) {
    return escapeHtml(parts[0]) + `<span class="red-digit">${escapeHtml(parts[1])}</span>` + escapeHtml(parts[2]);
  }
  return escapeHtml(str);
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
    dataAnswer = escapeHtml(JSON.stringify(q.pairs.map(function (p) {
  return p.right;
})));
    const rightOrder = shuffle(q.pairs.map((_, i) => i));
    body = `<div class="joinlines-wrap" data-connections="{}">
      <svg class="joinlines-svg"></svg>
      <div class="joinlines-columns">
        <div class="joinlines-left">
          ${q.pairs
            .map(
              (p, i) => `<div class="jl-node" data-side="left" data-index="${i}">
              <span class="jl-label">${highlightDigit(p.left)}</span>
              <span class="jl-dot" data-side="left" data-index="${i}"></span>
            </div>`
            )
            .join("\n")}
        </div>
        <div class="joinlines-right">
          ${rightOrder
            .map(
              (origIndex) => `<div class="jl-node" data-side="right" data-index="${origIndex}">
              <span class="jl-dot" data-side="right" data-index="${origIndex}"></span>
              <span class="jl-label">${escapeHtml(q.pairs[origIndex].right)}</span>
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
    } else if (q.type === "fraction-multiplication") {
    dataAnswer = escapeHtml(
      JSON.stringify({
        rawNumerator: q.rawNumerator,
        rawDenominator: q.rawDenominator,
        simplifiedNumerator: q.simplifiedNumerator,
        simplifiedDenominator: q.simplifiedDenominator
      })
    );

    body = `
      <div class="fm-wrap">

        <div class="fm-expression">

          <div class="fm-fraction">
            <span>${escapeHtml(String(q.leftNumerator))}</span>
            <span>${escapeHtml(String(q.leftDenominator))}</span>
          </div>

          <span class="fm-times">×</span>

          <div class="fm-fraction">
            <span>${escapeHtml(String(q.rightNumerator))}</span>
            <span>${escapeHtml(String(q.rightDenominator))}</span>
          </div>

          <span class="fm-equals">=</span>

          <div class="fm-fraction fm-input-fraction">
            <input
              class="fm-input"
              data-field="rawNumerator"
              inputmode="numeric"
              pattern="[0-9]*"
              autocomplete="off"
              aria-label="Product numerator"
            >
            <input
              class="fm-input"
              data-field="rawDenominator"
              inputmode="numeric"
              pattern="[0-9]*"
              autocomplete="off"
              aria-label="Product denominator"
            >
          </div>

          <span class="fm-equals">=</span>

          <div class="fm-fraction fm-input-fraction">
            <input
              class="fm-input"
              data-field="simplifiedNumerator"
              inputmode="numeric"
              pattern="[0-9]*"
              autocomplete="off"
              aria-label="Simplified numerator"
            >
            <input
              class="fm-input"
              data-field="simplifiedDenominator"
              inputmode="numeric"
              pattern="[0-9]*"
              autocomplete="off"
              aria-label="Simplified denominator"
            >
          </div>

        </div>

        <div class="fm-hint">
          Multiply the numerators and denominators first, then simplify.
        </div>

      </div>
    `;
  } else if (q.type === "expanded-form") {
    const partsAnswers = {};
    q.parts.forEach((p, i) => { if (!p.given) partsAnswers[i] = String(p.value); });
    dataAnswer = escapeHtml(JSON.stringify({ parts: partsAnswers, words: q.words }));
    const boxesHtml = q.parts
      .map((p, i) => {
        const box = p.given
          ? `<span class="ef-box ef-given">${escapeHtml(String(p.value))}</span>`
          : `<input type="text" class="ef-box ef-input" data-index="${i}" inputmode="numeric" placeholder="?">`;
        return (i === 0 ? "" : `<span class="ef-plus">+</span>`) + box;
      })
      .join("");
    body = `<div class="ef-wrap">
      <div class="ef-row">
        <span class="ef-number">${escapeHtml(q.number)}</span>
        <span class="ef-equals">=</span>
        <span class="ef-parts">${boxesHtml}</span>
      </div>
      <div class="ef-words-row">
        <label class="ef-words-label">In words:</label>
        <input type="text" class="ef-words-input" placeholder="Write the number in words">
      </div>
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

  ${
    ws.slug === "multiplying-fractions-a"
      ? `
    <section class="fm-page-header">

      <div class="fm-brand">
        ✨ MyTutBuddy Maths
      </div>

      <h1 class="fm-page-title">
        ${escapeHtml(ws.title)}
      </h1>

      <p class="fm-page-subtitle">
        Multiply • Simplify • Master Fractions
      </p>

      <div class="fm-student-panel">

        <div class="fm-student-field">
          <label for="studentName">Student Name</label>
          <input
            id="studentName"
            type="text"
            placeholder="Enter your name"
            autocomplete="name"
          >
        </div>

        <div class="fm-student-field">
          <label for="worksheetDate">Date</label>
          <input
            id="worksheetDate"
            type="date"
          >
        </div>

        <div class="fm-student-field">
          <label for="worksheetTime">Time</label>
          <input
            id="worksheetTime"
            type="time"
          >
        </div>

      </div>

      <div class="fm-info-row">
        <span class="fm-info-pill">🎓 Grade 6</span>
        <span class="fm-info-pill">🔢 Number</span>
        <span class="fm-info-pill">🍕 Fractions</span>
        <span class="fm-info-pill">⭐ Medium</span>
        <span class="fm-info-pill">📝 20 Questions</span>
      </div>

    </section>

    <div class="fm-instructions">
      <strong>💡 Your task:</strong>
      Multiply the numerators and denominators first.
      Write your product, then simplify your fraction to its lowest terms.
    </div>

    <div class="fm-progress-card">

      <div class="fm-progress-top">
        <span class="fm-progress-title">
          📚 Your Progress
        </span>

        <span
          class="fm-progress-count"
          id="fmProgressCount"
        >
          0 / ${total} completed
        </span>
      </div>

      <div class="fm-progress-track">
        <div
          class="fm-progress-fill"
          id="fmProgressFill"
        ></div>
      </div>

    </div>
    `
      : `
    <p class="worksheet-meta">${escapeHtml(ws.grade)} • ${escapeHtml(ws.topic)}${
      ws.subtopic ? " • " + escapeHtml(ws.subtopic) : ""
    } • ${escapeHtml(ws.difficulty)}</p>

    <h1>${escapeHtml(ws.title)}</h1>
    ${ws.intro ? `<p class="worksheet-intro">${escapeHtml(ws.intro)}</p>` : ""}

    <div class="progress-bar-track">
      <div class="progress-bar-fill" id="progressFill"></div>
    </div>
    `
  }

  <div id="questions">
  ${questionsHtml}
  </div>

  <div class="check-btn-wrap">
   <button class="button" onclick="checkAnswers()">
  ✨ FINISH & CHECK ANSWERS
</button>
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
        initWorksheetDateTime();
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
      let dragging = null; // { side, index or value, startX, startY }
      let connections = {}; // leftIndex -> rightValue

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
          const rightIndex = connections[leftIndex];
          const leftDot = wrap.querySelector('.jl-dot[data-side="left"][data-index="' + leftIndex + '"]');
          const rightDot = wrap.querySelector('.jl-dot[data-side="right"][data-index="' + rightIndex + '"]');
          if (!leftDot || !rightDot) return;
          drawLine(dotCenter(leftDot), dotCenter(rightDot), false);
        });
        if (dragging && tempEnd) {
          const startDot = wrap.querySelector(
            '.jl-dot[data-side="' + dragging.side + '"][data-index="' + dragging.index + '"]'
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
        let pt = e;
        if (e.touches && e.touches.length) pt = e.touches[0];
        else if (e.changedTouches && e.changedTouches.length) pt = e.changedTouches[0];
        return { x: pt.clientX - wrapRect.left, y: pt.clientY - wrapRect.top, clientX: pt.clientX, clientY: pt.clientY };
      }

      function pointerIndicator(clientX, clientY, show) {
        let ind = wrap._penIndicator;
        if (!show) {
          if (ind) ind.style.display = "none";
          return;
        }
        if (!ind) {
          ind = document.createElement("div");
          ind.className = "jl-pen-indicator";
          ind.textContent = "✏️";
          document.body.appendChild(ind);
          wrap._penIndicator = ind;
        }
        ind.style.display = "block";
        ind.style.left = clientX + "px";
        ind.style.top = clientY + "px";
      }

      function updateConnectionsAttr() {
        wrap.dataset.connections = JSON.stringify(connections);
        updateProgress();
      }

      function onDown(e) {
        const node = e.target.closest(".jl-node");
        if (!node) return;
        e.preventDefault();
        const side = node.dataset.side;
        dragging = { side: side, index: node.dataset.index };
        document.body.classList.add("jl-dragging");
        const p = pointFromEvent(e);
        redraw(p);
        pointerIndicator(p.clientX, p.clientY, true);
        document.addEventListener("mousemove", onMove);
        document.addEventListener("touchmove", onMove, { passive: false });
        document.addEventListener("mouseup", onUp);
        document.addEventListener("touchend", onUp);
        document.addEventListener("touchcancel", onUp);
      }

      function onMove(e) {
        if (!dragging) return;
        e.preventDefault();
        const p = pointFromEvent(e);
        redraw(p);
        pointerIndicator(p.clientX, p.clientY, true);
      }

      function onUp(e) {
        if (!dragging) return;
        const p = pointFromEvent(e);

        // Primary: is the touch/click point inside any opposite-side box at all?
        // This lets you release anywhere in the box, not just on the small dot.
        const oppositeSide = dragging.side === "left" ? "right" : "left";
        const candidates = wrap.querySelectorAll('.jl-node[data-side="' + oppositeSide + '"]');
        let target = null;
        candidates.forEach(function (node) {
          if (target) return;
          const r = node.getBoundingClientRect();
          const wrapRect = wrap.getBoundingClientRect();
          const left = r.left - wrapRect.left;
          const top = r.top - wrapRect.top;
          if (p.x >= left && p.x <= left + r.width && p.y >= top && p.y <= top + r.height) {
            target = node;
          }
        });

        // Fallback: nearest box center within a generous radius, in case the
        // finger lifted just outside an edge.
        if (!target) {
          let nearestDist = Infinity;
          candidates.forEach(function (node) {
            const r = node.getBoundingClientRect();
            const wrapRect = wrap.getBoundingClientRect();
            const cx = r.left - wrapRect.left + r.width / 2;
            const cy = r.top - wrapRect.top + r.height / 2;
            const dist = Math.sqrt((cx - p.x) * (cx - p.x) + (cy - p.y) * (cy - p.y));
            if (dist < nearestDist) {
              nearestDist = dist;
              if (dist <= 60) target = node;
            }
          });
        }

        if (target) {
          const leftIndex = dragging.side === "left" ? dragging.index : target.dataset.index;
          const rightIndex = dragging.side === "left" ? target.dataset.index : dragging.index;
          // Enforce one-to-one: if another left item already uses this right box, free it up.
          Object.keys(connections).forEach(function (k) {
            if (k !== leftIndex && connections[k] === rightIndex) delete connections[k];
          });
          connections[leftIndex] = rightIndex;
        }

        dragging = null;
        document.body.classList.remove("jl-dragging");
        pointerIndicator(0, 0, false);
        updateConnectionsAttr();
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("touchmove", onMove);
        document.removeEventListener("mouseup", onUp);
        document.removeEventListener("touchend", onUp);
        document.removeEventListener("touchcancel", onUp);
        // Deferred to the next frame: iOS Safari can still be settling the
        // viewport/toolbar right after a touch ends, which briefly makes
        // getBoundingClientRect() coordinates stale.
        requestAnimationFrame(function () { redraw(null); });
      }

      wrap.querySelectorAll(".jl-node").forEach(function (node) {
        node.addEventListener("mousedown", onDown);
        node.addEventListener("touchstart", onDown, { passive: false });
      });

      window.addEventListener("resize", function () { redraw(null); });

      wrap._resetJoinLines = function () {
        connections = {};
        updateConnectionsAttr();
        redraw(null);
      };

      wrap._showResults = function (correctness) {
        svg.innerHTML = "";
        Object.keys(connections).forEach(function (leftIndex) {
          const rightIndex = connections[leftIndex];
          const leftDot = wrap.querySelector('.jl-dot[data-side="left"][data-index="' + leftIndex + '"]');
          const rightDot = wrap.querySelector('.jl-dot[data-side="right"][data-index="' + rightIndex + '"]');
          if (!leftDot || !rightDot) return;
          const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
          const a = dotCenter(leftDot), b = dotCenter(rightDot);
          line.setAttribute("x1", a.x); line.setAttribute("y1", a.y);
          line.setAttribute("x2", b.x); line.setAttribute("y2", b.y);
          line.setAttribute("class", correctness[leftIndex] ? "jl-line-correct" : "jl-line-incorrect");
          svg.appendChild(line);
        });
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
       if (type === "fraction-multiplication") {
      const inputs = q.querySelectorAll(".fm-input");
      return Array.from(inputs).every(function (inp) {
        return inp.value.trim() !== "";
      });
    } 
    if (type === "expanded-form") {
      const inputs = q.querySelectorAll(".ef-input, .ef-words-input");
      return Array.from(inputs).every(function (inp) { return inp.value.trim() !== ""; });
    }
    return false;
  }
function initWorksheetDateTime() {
  const dateInput = document.getElementById("worksheetDate");
  const timeInput = document.getElementById("worksheetTime");

  if (!dateInput && !timeInput) return;

  const now = new Date();

  if (dateInput && !dateInput.value) {
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    dateInput.value = year + "-" + month + "-" + day;
  }

  if (timeInput && !timeInput.value) {
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");

    timeInput.value = hours + ":" + minutes;
  }
}
  function updateProgress() {
  const questions = document.querySelectorAll("#questions .question");
  let answered = 0;

  questions.forEach(function (q) {
    if (isAnswered(q)) answered++;
  });

  const pct = questions.length
    ? Math.round((answered / questions.length) * 100)
    : 0;

  const oldProgress = document.getElementById("progressFill");

  if (oldProgress) {
    oldProgress.style.width = pct + "%";
  }

  const fmProgress = document.getElementById("fmProgressFill");
  const fmCount = document.getElementById("fmProgressCount");

  if (fmProgress) {
    fmProgress.style.width = pct + "%";
  }

  if (fmCount) {
    fmCount.textContent =
      answered + " / " + questions.length + " completed";
  }
}

  function normalize(str) {
  return String(str)
    .toLowerCase()
    .normalize("NFKC")
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]/g, "");
}

function normalizeWords(str) {
  return normalize(str).replace(/and/g, "");
}

  function checkAnswers() {
    const questions = document.querySelectorAll("#questions .question");
    let correct = 0;
    let total = 0;

    questions.forEach(function (q) {
      const type = q.dataset.type;
      const feedback = q.querySelector(".feedback");
      let qCorrect = 0;
      let qTotal = 1;

      if (type === "text") {
        const accepted = JSON.parse(q.dataset.answer);
        const val = q.querySelector("input").value;
        qCorrect = accepted.some(function (a) { return normalize(a) === normalize(val); }) ? 1 : 0;
      } else if (type === "multiple-choice") {
        const checked = q.querySelector("input:checked");
        qCorrect = (!!checked && checked.value === q.dataset.answer) ? 1 : 0;
      } else if (type === "dropdown") {
        qCorrect = (q.querySelector("select").value === q.dataset.answer) ? 1 : 0;
      } else if (type === "true-false") {
        const sel = q.querySelector(".tf-btn.selected");
        qCorrect = (!!sel && sel.dataset.value === q.dataset.answer) ? 1 : 0;
      } else if (type === "matching") {
        const selects = q.querySelectorAll("select");
        qTotal = selects.length;
        selects.forEach(function (s) {
          const ok = s.value !== "" && s.value === s.dataset.correct;
          if (ok) qCorrect++;
          s.closest(".match-row").classList.toggle("row-correct", ok);
          s.closest(".match-row").classList.toggle("row-incorrect", !ok);
        });
      } else if (type === "join-lines") {
        const wrap = q.querySelector(".joinlines-wrap");
        const connections = JSON.parse(wrap.dataset.connections || "{}");
        qTotal = q.querySelectorAll(".jl-dot[data-side='left']").length;
        const correctness = {};
        for (let i = 0; i < qTotal; i++) {
  const rightIndex = connections[i];

  const categories = JSON.parse(q.dataset.answer || "[]");

  const leftCategory = categories[i] || "";

  const rightCategory =
    rightIndex !== undefined
      ? categories[Number(rightIndex)] || ""
      : "";

  // Any box with the same place-value category is correct.
  const ok =
    rightIndex !== undefined &&
    leftCategory !== "" &&
    leftCategory === rightCategory;

  if (ok) qCorrect++;
  correctness[i] = ok;
}
        if (wrap._showResults) wrap._showResults(correctness);
      } else if (type === "word-bank") {
        const blanks = q.querySelectorAll(".wb-blank");
        qTotal = blanks.length;
        blanks.forEach(function (b) {
          const ok = b.classList.contains("wb-filled") && normalize(b.textContent) === normalize(b.dataset.answer);
          if (ok) qCorrect++;
          b.classList.toggle("wb-correct", ok);
          b.classList.toggle("wb-incorrect", !ok);
        });
              } else if (type === "fraction-multiplication") {
        const data = JSON.parse(q.dataset.answer);

        const fields = [
          "rawNumerator",
          "rawDenominator",
          "simplifiedNumerator",
          "simplifiedDenominator"
        ];

        qTotal = fields.length;

        fields.forEach(function (field) {
          const input = q.querySelector(
            '.fm-input[data-field="' + field + '"]'
          );

          const expected = String(data[field]);
          const actual = input ? input.value.trim() : "";

          const ok =
            actual !== "" &&
            actual.replace(/^0+(?=\d)/, "") ===
            expected.replace(/^0+(?=\d)/, "");

          if (ok) qCorrect++;

          if (input) {
            input.classList.toggle("fm-correct", ok);
            input.classList.toggle("fm-incorrect", !ok);
          }
        });
      } else if (type === "expanded-form") {
        const data = JSON.parse(q.dataset.answer);
        const idxs = Object.keys(data.parts);
        qTotal = idxs.length + 1;
        idxs.forEach(function (idx) {
          const inp = q.querySelector('.ef-input[data-index="' + idx + '"]');
          const ok = inp && normalize(inp.value) === normalize(data.parts[idx]);
          if (ok) qCorrect++;
          if (inp) inp.classList.toggle("ef-correct", ok), inp.classList.toggle("ef-incorrect", !ok);
        });
        const wordsInput = q.querySelector(".ef-words-input");
        const wordsOk = wordsInput && (
  normalize(wordsInput.value) === normalize(data.words) ||
  normalizeWords(wordsInput.value) === normalizeWords(data.words)
);
        if (wordsOk) qCorrect++;
        if (wordsInput) wordsInput.classList.toggle("ef-correct", wordsOk), wordsInput.classList.toggle("ef-incorrect", !wordsOk);
      }

      correct += qCorrect;
      total += qTotal;

      q.classList.remove("correct", "incorrect", "partial");
      if (qCorrect === qTotal) {
        q.classList.add("correct");
        feedback.innerHTML = "✅ Correct!";
      } else if (qCorrect === 0) {
        q.classList.add("incorrect");
        feedback.innerHTML = "❌ Not quite. Review this one and try again.";
      } else {
        q.classList.add("partial");
        feedback.innerHTML = "🟡 " + qCorrect + " / " + qTotal + " correct. Review the rest.";
      }
    });

    const percentage = Math.round((correct / total) * 100);

    document.getElementById("score").innerHTML = correct + " / " + total + " — " + percentage + "%";

    const msg = document.getElementById("message");
   if (percentage === 100) {
  msg.innerHTML =
    "🏆 Perfect! You mastered multiplying fractions!";
} else if (percentage >= 80) {
  msg.innerHTML =
    "🌟 Great work! You have a strong understanding of multiplying fractions.";
} else if (percentage >= 60) {
  msg.innerHTML =
    "👏 Good job! Review the questions you missed and try again.";
} else if (percentage >= 40) {
  msg.innerHTML =
    "💪 Nice effort! A little more practice will help.";
} else {
  msg.innerHTML =
    "📚 Keep practising! Review the multiplication and simplification steps.";
}

    document.getElementById("result").style.display = "block";
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  }

  function tryAgain() {
    document.querySelectorAll("#questions .question").forEach(function (q) {
      q.classList.remove("correct", "incorrect", "partial");
      q.querySelector(".feedback").innerHTML = "";
      const type = q.dataset.type;
      if (type === "text") q.querySelector("input").value = "";
      if (type === "multiple-choice") q.querySelectorAll("input").forEach(function (r) { r.checked = false; });
      if (type === "dropdown") q.querySelector("select").value = "";
      if (type === "true-false") q.querySelectorAll(".tf-btn").forEach(function (b) { b.classList.remove("selected"); });
      if (type === "matching") {
        q.querySelectorAll("select").forEach(function (s) { s.value = ""; });
        q.querySelectorAll(".match-row").forEach(function (r) { r.classList.remove("row-correct", "row-incorrect"); });
      }
      if (type === "join-lines") {
        const wrap = q.querySelector(".joinlines-wrap");
        if (wrap && wrap._resetJoinLines) wrap._resetJoinLines();
      }
      if (type === "word-bank") {
        const wrap = q.querySelector(".wordbank-wrap");
        if (wrap && wrap._resetWordBank) wrap._resetWordBank();
      }
         if (type === "fraction-multiplication") {
        q.querySelectorAll(".fm-input").forEach(function (inp) {
          inp.value = "";
          inp.classList.remove("fm-correct", "fm-incorrect");
        });
      }  
      if (type === "expanded-form") {
        q.querySelectorAll(".ef-input, .ef-words-input").forEach(function (inp) {
          inp.value = "";
          inp.classList.remove("ef-correct", "ef-incorrect");
        });
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

