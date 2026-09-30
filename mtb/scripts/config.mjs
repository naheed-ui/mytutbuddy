// ---------------------------------------------------------------------------
// SITE CONFIG
// Change these two lines if your web address ever changes. Everything else
// in the site (links, sitemap, SEO tags) is generated from these values.
// ---------------------------------------------------------------------------

// The full web address where the site is (or will be) live.
export const SITE_URL = "https://naheed-ui.github.io/mytutbuddy";

// GitHub Pages project sites (username.github.io/REPO-NAME) live in a
// sub-folder named after the repo, so every internal link needs that
// prefix. If you later move to a custom domain (e.g. mytutbuddy.com),
// change this to an empty string "" and nothing else needs to change.
export const BASE_PATH = "/mytutbuddy";

export const SITE_NAME = "MyTutBuddy";

// Placeholder social links shown as icons in the footer.
// Replace these with your real profile URLs whenever you have them.
export const SOCIAL = {
  instagram: "https://instagram.com/mytutbuddy",
  youtube: "https://youtube.com/@mytutbuddy",
};

// ---------------------------------------------------------------------------
// FORMS (Free Demo Class + Teach With Us)
// ---------------------------------------------------------------------------
// Both forms are sent through FormSubmit (formsubmit.co) — a free service that
// emails each submission (and any uploaded CV) to you.
//
// SETUP, in 3 steps:
//   1. Replace the text below with the email address that should receive
//      submissions, then publish the site.
//   2. Fill in one form yourself as a test. FormSubmit emails you an
//      "Activate" link — click it (this only happens once).
//   3. That activation email also gives you a long random code (an "alias").
//      Paste that code below instead of your email, so your address isn't
//      visible in the page source where spammers can scrape it.
export const FORM_EMAIL = "PASTE-YOUR-EMAIL-OR-FORMSUBMIT-CODE-HERE";

// false = no "I'm not a robot" page after submitting (smoother, uses a hidden
// spam trap instead). Set to true if you start receiving spam.
export const FORM_USE_CAPTCHA = false;

// Optional: a real video for the homepage "See it in action" section.
// Put an .mp4 in the static/videos folder and set e.g. "/assets/videos/demo.mp4"
// (leave as "" to hide that section).
export const HERO_VIDEO_URL = "";
export const HERO_VIDEO_POSTER = "";
