// Animates the homepage's "live worksheet preview" card: cycles through three
// short scenes (draw-a-line matching, fill-in-the-boxes, show working) on a
// timer, pauses on hover/focus/tap, and is fully skippable via the dots.
(function () {
  var card = document.getElementById("demo");
  if (!card) return;

  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var scenes = Array.prototype.slice.call(card.querySelectorAll(".demo-scene"));
  var dots = Array.prototype.slice.call(card.querySelectorAll(".demo-dotbtn"));
  var pauseBtn = card.querySelector(".demo-pause");
  var toast = card.querySelector(".demo-toast");
  var scoreEl = card.querySelector(".demo-score b");

  var current = 0;
  var playing = !reduceMotion;
  var sceneTimer = null;
  var stepTimers = [];
  var SCENE_MS = 6500;

  function clearStepTimers() {
    stepTimers.forEach(function (t) { clearTimeout(t); });
    stepTimers = [];
  }
  function after(ms, fn) {
    stepTimers.push(setTimeout(fn, ms));
  }

  function showToast(text) {
    if (!toast) return;
    toast.textContent = text;
    toast.classList.add("is-visible");
    after(1200, function () { toast.classList.remove("is-visible"); });
  }

  function bumpScore() {
    if (!scoreEl) return;
    scoreEl.textContent = String(Number(scoreEl.textContent || "0") + 1);
  }

  // ---- Scene 0: draw-a-line matching ----
  function playScene0(root) {
    var svg = root.querySelector(".demo-lines");
    var lefts = root.querySelectorAll(".demo-col:not(.right) .demo-dot");
    var rights = root.querySelectorAll(".demo-col.right .demo-dot");
    var pen = root.querySelector(".demo-pen");
    if (!svg) return;
    svg.innerHTML = "";

    function center(el) {
      var r = el.getBoundingClientRect();
      var s = svg.getBoundingClientRect();
      return { x: r.left + r.width / 2 - s.left, y: r.top + r.height / 2 - s.top };
    }
    function line(a, b, cls) {
      var l = document.createElementNS("http://www.w3.org/2000/svg", "line");
      l.setAttribute("x1", a.x); l.setAttribute("y1", a.y);
      l.setAttribute("x2", b.x); l.setAttribute("y2", b.y);
      l.setAttribute("class", cls);
      svg.appendChild(l);
      return l;
    }

    var pairs = [0, 1, 2]; // left i pairs with right i, matching the markup order
    pairs.forEach(function (i, idx) {
      after(500 + idx * 900, function () {
        if (!lefts[i] || !rights[i]) return;
        var a = center(lefts[i]), b = center(rights[i]);
        if (pen) {
          pen.style.left = a.x + "px";
          pen.style.top = a.y + "px";
          pen.style.opacity = "1";
        }
        var l = line(a, a, "demo-line");
        var t0 = performance.now();
        function step(t) {
          var p = Math.min(1, (t - t0) / 420);
          var x = a.x + (b.x - a.x) * p;
          var y = a.y + (b.y - a.y) * p;
          l.setAttribute("x2", x);
          l.setAttribute("y2", y);
          if (pen) { pen.style.left = x + "px"; pen.style.top = y + "px"; }
          if (p < 1 && playing) requestAnimationFrame(step);
          else {
            l.setAttribute("class", "demo-line is-correct");
            if (pen) pen.style.opacity = "0";
            bumpScore();
          }
        }
        requestAnimationFrame(step);
      });
    });
    after(3400, function () { showToast("✅ Correct!"); });
  }

  // ---- Scene 1: fill the boxes ----
  function typeInto(el, text, speed) {
    var i = 0;
    (function tick() {
      if (!playing) return;
      el.textContent = text.slice(0, i);
      i++;
      if (i <= text.length) after(speed, tick);
    })();
  }
  function playScene1(root) {
    var boxes = root.querySelectorAll(".demo-box");
    var values = ["6", "15", "2", "5"];
    boxes.forEach(function (b, i) {
      b.textContent = "";
      b.classList.remove("is-filled");
      after(500 + i * 700, function () {
        typeInto(b, values[i], 90);
        after(90 * values[i].length + 120, function () { b.classList.add("is-filled"); });
      });
    });
    after(500 + values.length * 700 + 400, function () { showToast("✅ Correct!"); bumpScore(); });
  }

  // ---- Scene 2: show working + final answer ----
  function playScene2(root) {
    var working = root.querySelector(".demo-working");
    var answer = root.querySelector(".demo-answer");
    if (working) working.textContent = "";
    if (answer) { answer.textContent = ""; answer.classList.remove("is-filled"); }
    var workingText = "(x-3)(x+3) / [x(x+2)] ÷ (x-3)/(x+2)";
    var i = 0;
    after(500, function step() {
      if (!playing || !working) return;
      working.textContent = workingText.slice(0, i);
      i++;
      if (i <= workingText.length) after(30, step);
      else after(400, function () {
        typeInto(answer, "(x+3)/x", 90);
        after(90 * 7 + 250, function () {
          if (answer) answer.classList.add("is-filled");
          showToast("✅ Correct!");
          bumpScore();
        });
      });
    });
  }

  var players = [playScene0, playScene1, playScene2];

  function resetScore() {
    if (scoreEl) scoreEl.textContent = "0";
  }

  function goTo(index) {
    clearStepTimers();
    current = (index + scenes.length) % scenes.length;
    scenes.forEach(function (s, i) { s.classList.toggle("is-active", i === current); });
    dots.forEach(function (d, i) { d.classList.toggle("is-active", i === current); });
    resetScore();
    if (playing) players[current](scenes[current]);
  }

  function scheduleNext() {
    clearTimeout(sceneTimer);
    if (!playing) return;
    sceneTimer = setTimeout(function () { goTo(current + 1); }, SCENE_MS);
  }

  function startLoop() {
    goTo(current);
    scheduleNext();
  }

  dots.forEach(function (d, i) {
    d.addEventListener("click", function () {
      playing = true;
      if (pauseBtn) { pauseBtn.textContent = "⏸ Pause"; pauseBtn.setAttribute("aria-pressed", "false"); }
      goTo(i);
      scheduleNext();
    });
  });

  if (pauseBtn) {
    pauseBtn.addEventListener("click", function () {
      playing = !playing;
      pauseBtn.setAttribute("aria-pressed", playing ? "false" : "true");
      pauseBtn.textContent = playing ? "⏸ Pause" : "▶ Play";
      if (playing) startLoop();
      else clearStepTimers(), clearTimeout(sceneTimer);
    });
  }

  // Pause on hover/focus so it's not distracting while someone reads it, and
  // pause automatically once it scrolls off-screen to save battery.
  card.addEventListener("mouseenter", function () { if (playing) { clearStepTimers(); clearTimeout(sceneTimer); } });
  card.addEventListener("mouseleave", function () { if (playing) startLoop(); });

  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) { clearStepTimers(); clearTimeout(sceneTimer); }
        else if (playing) startLoop();
      });
    }, { threshold: 0.2 });
    io.observe(card);
  }

  if (reduceMotion && pauseBtn) {
    pauseBtn.setAttribute("aria-pressed", "true");
    pauseBtn.textContent = "▶ Play";
  }
  goTo(0);
  if (playing) scheduleNext();
})();
