import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SITE_URL, BASE_PATH } from "./config.mjs";
import { slugify } from "../templates/layout.mjs";
import { renderWorksheetPage } from "../templates/worksheet.mjs";
import { renderLibraryPage } from "../templates/library.mjs";
import { renderHomepage } from "../templates/homepage.mjs";
import { renderStaticPage } from "../templates/static-page.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const DATA_DIR = path.join(ROOT, "data", "worksheets");
const PAGES_DIR = path.join(ROOT, "data", "pages");
const STATIC_DIR = path.join(ROOT, "static");
const OUT_DIR = path.join(ROOT, "dist");

const REQUIRED_FIELDS = ["slug", "title", "grade", "topic", "difficulty", "questions"];
const VALID_TYPES = ["text", "multiple-choice", "dropdown", "true-false", "matching"];

function fail(msg) {
  console.error(`\n❌ BUILD FAILED\n${msg}\n`);
  process.exit(1);
}

function loadWorksheets() {
  if (!fs.existsSync(DATA_DIR)) fail(`Can't find the data folder: ${DATA_DIR}`);

  const files = fs.readdirSync(DATA_DIR).filter((f) => f.endsWith(".json"));
  if (files.length === 0) fail(`No worksheet .json files found in ${DATA_DIR}`);

  const worksheets = [];
  const seenSlugs = new Set();

  for (const file of files) {
    const filePath = path.join(DATA_DIR, file);
    let raw;
    try {
      raw = JSON.parse(fs.readFileSync(filePath, "utf8"));
    } catch (e) {
      fail(`"${file}" is not valid JSON. Check for a missing comma or quote.\n\nDetails: ${e.message}`);
    }

    for (const field of REQUIRED_FIELDS) {
      if (raw[field] === undefined || raw[field] === null || raw[field] === "") {
        fail(`"${file}" is missing the required field "${field}".`);
      }
    }

    if (!Array.isArray(raw.questions) || raw.questions.length === 0) {
      fail(`"${file}" needs at least one question in the "questions" list.`);
    }

    raw.questions.forEach((q, i) => {
      if (!VALID_TYPES.includes(q.type)) {
        fail(`"${file}" question ${i + 1} has an unknown type "${q.type}". Valid types: ${VALID_TYPES.join(", ")}`);
      }
      if (q.type === "matching") {
        if (!Array.isArray(q.pairs) || q.pairs.length === 0) {
          fail(`"${file}" question ${i + 1} (matching) needs a "pairs" list.`);
        }
      } else if (q.type === "true-false") {
        if (typeof q.answer !== "boolean") {
          fail(`"${file}" question ${i + 1} (true-false) needs "answer" to be true or false (no quotes).`);
        }
      } else {
        if (q.answer === undefined || q.answer === "") {
          fail(`"${file}" question ${i + 1} is missing an "answer".`);
        }
        if ((q.type === "multiple-choice" || q.type === "dropdown") && (!Array.isArray(q.options) || q.options.length < 2)) {
          fail(`"${file}" question ${i + 1} (${q.type}) needs at least 2 "options".`);
        }
      }
    });

    if (seenSlugs.has(raw.slug)) {
      fail(`Two worksheets use the same slug "${raw.slug}". Each worksheet needs a unique slug.`);
    }
    seenSlugs.add(raw.slug);

    raw.gradeSlug = slugify(raw.grade);
    raw.topicSlug = slugify(raw.topic);
    worksheets.push(raw);
  }

  worksheets.sort((a, b) => a.title.localeCompare(b.title));
  return worksheets;
}

function write(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, "utf8");
}

function copyRecursive(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src)) {
      copyRecursive(path.join(src, entry), path.join(dest, entry));
    }
  } else {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }
}

function copyStatic() {
  const destDir = path.join(OUT_DIR, "assets");
  copyRecursive(STATIC_DIR, destDir);
}

const STATIC_PAGES = [
  {
    slug: "about",
    file: "about.html",
    title: "About MyTutBuddy",
    description: "Learn about MyTutBuddy's mission to make Maths practice interactive.",
  },
  {
    slug: "privacy",
    file: "privacy.html",
    title: "Privacy Policy | MyTutBuddy",
    description: "MyTutBuddy's privacy policy — what information is and isn't collected.",
  },
];

function buildStaticPages() {
  for (const page of STATIC_PAGES) {
    const filePath = path.join(PAGES_DIR, page.file);
    if (!fs.existsSync(filePath)) {
      fail(`Can't find "${page.file}" in ${PAGES_DIR}`);
    }
    const bodyHtml = fs.readFileSync(filePath, "utf8");
    const relPath = `/${page.slug}/`;
    const html = renderStaticPage({
      title: page.title,
      description: page.description,
      path: relPath,
      bodyHtml,
    });
    write(path.join(OUT_DIR, page.slug, "index.html"), html);
  }
}

function buildSitemap(worksheets) {
  const urls = [
    `${SITE_URL}/`,
    `${SITE_URL}/worksheets/`,
    ...STATIC_PAGES.map((p) => `${SITE_URL}/${p.slug}/`),
    ...worksheets.map((w) => `${SITE_URL}/worksheets/${w.gradeSlug}/${w.topicSlug}/${w.slug}/`),
  ];
  const body = urls.map((u) => `  <url><loc>${u}</loc></url>`).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

function buildRobots() {
  return `User-agent: *\nAllow: /\nSitemap: ${SITE_URL}/sitemap.xml\n`;
}

function main() {
  if (fs.existsSync(OUT_DIR)) fs.rmSync(OUT_DIR, { recursive: true, force: true });

  const worksheets = loadWorksheets();

  write(path.join(OUT_DIR, "index.html"), renderHomepage(worksheets, "/"));
  write(path.join(OUT_DIR, "worksheets", "index.html"), renderLibraryPage(worksheets, "/worksheets/"));
  buildStaticPages();

  for (const w of worksheets) {
    const relPath = `/worksheets/${w.gradeSlug}/${w.topicSlug}/${w.slug}/`;
    write(path.join(OUT_DIR, relPath, "index.html"), renderWorksheetPage(w, relPath));
  }

  write(path.join(OUT_DIR, "sitemap.xml"), buildSitemap(worksheets));
  write(path.join(OUT_DIR, "robots.txt"), buildRobots());
  write(path.join(OUT_DIR, ".nojekyll"), "");

  copyStatic();

  console.log(`✅ Build complete: ${worksheets.length} worksheet(s) -> ${path.relative(ROOT, OUT_DIR)}/`);
  worksheets.forEach((w) => {
    console.log(`   - ${w.title}  (${BASE_PATH}/worksheets/${w.gradeSlug}/${w.topicSlug}/${w.slug}/)`);
  });
}

main();