import { renderHead, renderHeader, renderFooter, escapeHtml } from "./layout.mjs";
import { BASE_PATH, HERO_VIDEO_URL, HERO_VIDEO_POSTER } from "../scripts/config.mjs";

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
      "Free interactive Maths worksheets for Grade 6-9, GCSE, A-Level and SAT. Draw, type and tap your answers, get instant marking, and book a free demo class.",
    path,
  });

  const allGrades = [...new Set(worksheets.map((w) => w.grade))];
  const gradeCards = allGrades
    .map((g) => {
      const count = worksheets.filter((w) => w.grade === g).length;
      return `<a class="warm-card grade-card" href="${BASE_PATH}/worksheets/?grade=${encodeURIComponent(g)}">
        <div class="icon" aria-hidden="true">${GRADE_ICONS[g] || "📐"}</div>
        <h3>${escapeHtml(g)} Maths</h3>
        <p>${count} interactive worksheet${count === 1 ? "" : "s"}</p>
        <span class="card-link">Explore →</span>
      </a>`;
    })
    .join("\n");

  const featured = worksheets.filter((w) => w.featured).slice(0, 3);
  const featuredList = (featured.length ? featured : worksheets.slice(0, 3))
    .map((w) => {
      const url = `${BASE_PATH}/worksheets/${w.gradeSlug}/${w.topicSlug}/${w.slug}/`;
      return `<a class="warm-card featured-card" href="${url}">
        <div class="eyebrow">${escapeHtml(w.grade)} • ${escapeHtml(w.topic)}</div>
        <h3>${escapeHtml(w.title)}</h3>
        <p>${escapeHtml(w.shortDescription || "")}</p>
        <span class="card-link">Start worksheet →</span>
      </a>`;
    })
    .join("\n");

  const videoSection = HERO_VIDEO_URL
    ? `<section class="home-section home-video">
  <div class="section-head">
    <h2>See it in action</h2>
    <p>A quick look at how a MyTutBuddy worksheet works.</p>
  </div>
  <div class="video-frame">
    <video controls muted playsinline preload="metadata"${HERO_VIDEO_POSTER ? ` poster="${escapeHtml(HERO_VIDEO_POSTER)}"` : ""}>
      <source src="${escapeHtml(HERO_VIDEO_URL)}" type="video/mp4">
      Your browser can't play this video.
    </video>
  </div>
</section>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
${head}
</head>
<body class="warm">
${renderHeader()}

<!-- ============ HERO ============ -->
<section class="home-hero">
  <div class="home-hero-text">
    <p class="pill">✨ Draw lines, drop in answers, show your working</p>
    <h1>Maths practice that <span class="squiggle">talks back</span></h1>
    <p class="lead">Interactive worksheets for Grade 6 to A-Level and SAT. Answer your way, get marked instantly, and see exactly what to review — no printing, no PDFs.</p>

    <div class="hero-cta">
      <a class="btn-warm" href="${BASE_PATH}/worksheets/">Try a worksheet</a>
      <a class="btn-ghost" href="${BASE_PATH}/free-demo/">Book a free demo class</a>
    </div>

    <form class="home-search" action="${BASE_PATH}/worksheets/" method="get" role="search">
      <label class="sr-only" for="home-q">Search worksheets</label>
      <input id="home-q" type="text" name="q" placeholder="Search e.g. algebra, fractions, place value…">
      <button type="submit" aria-label="Search">🔎</button>
    </form>

    <ul class="hero-badges">
      <li>⚡ Instant marking</li>
      <li>📱 Works on phone &amp; iPad</li>
      <li>🎯 Grade 6 – A-Level</li>
    </ul>
  </div>

  <div class="home-hero-demo">
    <div class="demo-card" id="demo" aria-label="Animated preview of a MyTutBuddy worksheet">
      <div class="demo-chrome">
        <span class="demo-lights" aria-hidden="true"><i></i><i></i><i></i></span>
        <span class="demo-title">Live worksheet preview</span>
        <span class="demo-score" aria-hidden="true">Score <b>0</b></span>
      </div>

      <div class="demo-stage" aria-hidden="true">

        <!-- Scene 1: draw-a-line matching -->
        <div class="demo-scene is-active" data-scene="0">
          <p class="demo-q"><span class="demo-num">1</span> Join each number to the place value of its <b class="red">red digit</b>.</p>
          <div class="demo-match">
            <svg class="demo-lines"></svg>
            <div class="demo-col">
              <div class="demo-node"><span>3<b class="red">5</b>7</span><i class="demo-dot"></i></div>
              <div class="demo-node"><span><b class="red">8</b>42</span><i class="demo-dot"></i></div>
              <div class="demo-node"><span>46<b class="red">0</b></span><i class="demo-dot"></i></div>
            </div>
            <div class="demo-col right">
              <div class="demo-node"><i class="demo-dot"></i><span>Hundreds</span></div>
              <div class="demo-node"><i class="demo-dot"></i><span>Ones</span></div>
              <div class="demo-node"><i class="demo-dot"></i><span>Tens</span></div>
            </div>
            <span class="demo-pen">✏️</span>
          </div>
        </div>

        <!-- Scene 2: fill the boxes -->
        <div class="demo-scene" data-scene="1">
          <p class="demo-q"><span class="demo-num">2</span> Multiply, then simplify.</p>
          <div class="demo-eq">
            <span class="demo-frac"><span>2</span><span>3</span></span>
            <span class="demo-op">×</span>
            <span class="demo-frac"><span>3</span><span>5</span></span>
            <span class="demo-op">=</span>
            <span class="demo-frac"><span class="demo-box"></span><span class="demo-box"></span></span>
            <span class="demo-op">=</span>
            <span class="demo-frac"><span class="demo-box"></span><span class="demo-box"></span></span>
          </div>
          <p class="demo-hint">Product first, then the simplified fraction.</p>
        </div>

        <!-- Scene 3: show working + final answer -->
        <div class="demo-scene" data-scene="2">
          <p class="demo-q"><span class="demo-num">3</span> Simplify fully:
            <span class="demo-frac small"><span>x² − 9</span><span>x² + 2x</span></span>
            <span class="demo-op">÷</span>
            <span class="demo-frac small"><span>x − 3</span><span>x + 2</span></span>
          </p>
          <div class="demo-working" data-label="Working (not marked)"></div>
          <div class="demo-answer-row"><b>Final answer:</b> <span class="demo-answer"></span></div>
        </div>

        <div class="demo-toast" aria-hidden="true"></div>
      </div>

      <div class="demo-controls">
        <div class="demo-dots" role="group" aria-label="Choose a preview">
          <button type="button" class="demo-dotbtn is-active" data-go="0" aria-label="Matching preview"></button>
          <button type="button" class="demo-dotbtn" data-go="1" aria-label="Fill-in-the-boxes preview"></button>
          <button type="button" class="demo-dotbtn" data-go="2" aria-label="Show-your-working preview"></button>
        </div>
        <button type="button" class="demo-pause" aria-pressed="false">⏸ Pause</button>
      </div>
    </div>
  </div>
</section>

${videoSection}

<!-- ============ HOW IT WORKS ============ -->
<section class="home-section">
  <div class="section-head">
    <h2>How it works</h2>
    <p>Practice that feels more like a game than homework.</p>
  </div>
  <div class="steps">
    <div class="step">
      <span class="step-num">1</span>
      <h3>Pick a worksheet</h3>
      <p>Search by topic, grade or difficulty and open any worksheet instantly.</p>
    </div>
    <div class="step">
      <span class="step-num">2</span>
      <h3>Answer your way</h3>
      <p>Draw lines, tap words, type into boxes or show your working — on any device.</p>
    </div>
    <div class="step">
      <span class="step-num">3</span>
      <h3>Get marked instantly</h3>
      <p>See green and red feedback on every answer, then try again and improve.</p>
    </div>
  </div>
</section>

<!-- ============ WAYS TO ANSWER ============ -->
<section class="home-section tight">
  <div class="chip-row" aria-label="Ways to answer">
    <span class="chip">✏️ Draw-a-line matching</span>
    <span class="chip">🔢 Fill-in-the-boxes</span>
    <span class="chip">🧩 Word banks</span>
    <span class="chip">📝 Show your working</span>
    <span class="chip">✅ Multiple choice</span>
    <span class="chip">↔️ True / false</span>
  </div>
</section>

<!-- ============ GRADES ============ -->
<section class="home-section">
  <div class="section-head">
    <h2>Browse by grade</h2>
    <p>Find the right level and start practising.</p>
  </div>
  <div class="warm-grid">
  ${gradeCards}
  </div>
</section>

<!-- ============ FEATURED ============ -->
<section class="home-section">
  <div class="section-head">
    <h2>Featured worksheets</h2>
    <p>A few good places to start.</p>
  </div>
  <div class="warm-grid">
  ${featuredList}
  </div>
  <p class="center-link"><a href="${BASE_PATH}/worksheets/">See all worksheets →</a></p>
</section>

<!-- ============ TWO CALLS TO ACTION ============ -->
<section class="home-section">
  <div class="cta-band">
    <div class="cta-photo" aria-hidden="true">
      <svg viewBox="0 0 400 320" role="img" aria-label="">
        <rect x="0" y="0" width="400" height="320" rx="24" fill="#eef2ff"/>
        <circle cx="320" cy="60" r="46" fill="#fde68a"/>
        <rect x="40" y="150" width="200" height="130" rx="14" fill="#ffffff" stroke="#c7d2fe" stroke-width="3"/>
        <rect x="60" y="172" width="160" height="10" rx="5" fill="#c7d2fe"/>
        <rect x="60" y="196" width="120" height="10" rx="5" fill="#e0e7ff"/>
        <circle cx="70" cy="230" r="14" fill="#4f46e5"/>
        <circle cx="120" cy="230" r="14" fill="#fca5a5"/>
        <line x1="70" y1="230" x2="120" y2="230" stroke="#4f46e5" stroke-width="3"/>
        <rect x="150" y="222" width="70" height="18" rx="6" fill="#dcfce7"/>
        <rect x="230" y="120" width="140" height="160" rx="16" fill="#fff" stroke="#fde68a" stroke-width="3"/>
        <circle cx="300" cy="165" r="26" fill="#eef2ff"/>
        <path d="M289 165l8 8 16-16" stroke="#16a34a" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        <rect x="250" y="205" width="100" height="10" rx="5" fill="#e0e7ff"/>
        <rect x="250" y="225" width="80" height="10" rx="5" fill="#e0e7ff"/>
        <rect x="250" y="245" width="90" height="10" rx="5" fill="#fde68a"/>
      </svg>
    </div>
    <div class="cta-cards">
      <div class="cta-card student">
        <span class="cta-emoji" aria-hidden="true">🎈</span>
        <h3>Students &amp; parents</h3>
        <p>Want a little extra help? Book a free demo class and tell us about your grade, board and goals.</p>
        <a class="btn-warm" href="${BASE_PATH}/free-demo/">Book a free demo class</a>
      </div>
      <div class="cta-card teacher">
        <span class="cta-emoji" aria-hidden="true">🍎</span>
        <h3>Maths teachers &amp; tutors</h3>
        <p>Passionate about teaching Maths? Share your experience and upload your CV to apply.</p>
        <a class="btn-ghost" href="${BASE_PATH}/teach-with-us/">Teach with us</a>
      </div>
    </div>
  </div>
</section>

${renderFooter()}
<script src="${BASE_PATH}/assets/home-demo.js" defer></script>
</body>
</html>
`;
}
