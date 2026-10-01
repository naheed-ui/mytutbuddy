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
const videoSection = "";
  return `<!DOCTYPE html>
<html lang="en">
<head>
${head}
</head>
<body class="warm">
${renderHeader()}
<!-- ============ PINTEREST JOURNAL HERO ============ -->
<section class="journal-hero">

  <div class="journal-hero-copy">

    <div class="journal-kicker">
      <span>✦</span> a little smarter, one page at a time
    </div>

    <h1>
      Maths can feel<br>
      <em>beautifully simple.</em>
    </h1>

    <p class="journal-lead">
      Interactive practice made for curious learners —
      write, try, get feedback and keep going.
    </p>

    <div class="journal-actions">
      <a class="btn-warm" href="${BASE_PATH}/worksheets/">
        Explore worksheets <span>→</span>
      </a>

      <a class="btn-ghost" href="${BASE_PATH}/free-demo/">
        Book a free demo
      </a>
    </div>

    <form
      class="journal-search"
      action="${BASE_PATH}/worksheets/"
      method="get"
      role="search"
    >
      <span aria-hidden="true">⌕</span>

      <label class="sr-only" for="home-q">
        Search worksheets
      </label>

      <input
        id="home-q"
        type="text"
        name="q"
        placeholder="What are you practising today?"
      >
    </form>

    <div class="journal-trust">
      <span>✓ Instant feedback</span>
      <span>✎ Show your working</span>
      <span>♡ Learn at your pace</span>
    </div>

  </div>


  <!-- ANIMATED JOURNAL -->
  <div class="journal-visual">

    <div class="doodle doodle-star">✦</div>
    <div class="doodle doodle-spark">✧</div>
    <div class="doodle doodle-heart">♡</div>

    <div class="tape tape-one"></div>
    <div class="tape tape-two"></div>


    <!-- MAIN PAPER -->
    <div class="journal-paper">

      <div class="paper-topline">
        <span>MYTUTBUDDY</span>
        <span>01 / PRACTICE</span>
      </div>

      <div class="paper-title">
        today's<br>
        <strong>maths note</strong>
      </div>

      <div class="paper-rule"></div>

      <div class="paper-equation">
        2x + 6 = 18
      </div>

      <div class="paper-work">
        <span>2x = 12</span>
        <span>x = 6</span>
      </div>

      <div class="paper-check">
        <span>✓</span> tiny steps count
      </div>

      <div class="paper-footer">
        learn · practise · grow
      </div>

    </div>


    <!-- FLOATING NOTES -->
    <div class="sticky-note note-yellow">
      <span>focus</span>
      <b>one</b>
      <span>topic ♡</span>
    </div>

    <div class="sticky-note note-lilac">
      <span>you've</span>
      <b>got this!</b>
      <span>✦</span>
    </div>


    <!-- PROGRESS CARD -->
    <div class="mini-card">

      <span class="mini-label">TODAY</span>

      <strong>3 / 5</strong>

      <small>questions done</small>

      <div class="mini-progress">
        <i></i>
      </div>

    </div>

  </div>

</section>

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
        <h3>Students &amp; parents</h3>
        <p>Want a little extra help? Book a free demo class and tell us about your grade, board and goals.</p>
        <a class="btn-warm" href="${BASE_PATH}/free-demo/">Book a free demo class</a>
      </div>
      <div class="cta-card teacher">
        <h3> Tutors</h3>
        <p>Passionate about teaching? Share your experience and upload your CV to apply.</p>
        <a class="btn-ghost" href="${BASE_PATH}/teach-with-us/">Teach with us</a>
      </div>
    </div>
  </div>
</section>

${renderFooter()}
</body>
</html>
`;
}
