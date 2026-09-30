import { renderHead, renderHeader, renderFooter, escapeHtml } from "./layout.mjs";
import { SITE_URL, BASE_PATH, FORM_EMAIL, FORM_USE_CAPTCHA } from "../scripts/config.mjs";

export const formsConfigured = () => !String(FORM_EMAIL).startsWith("PASTE-");

// ---------------------------------------------------------------------------
// Small helpers that build labelled form fields
// ---------------------------------------------------------------------------

function req(required) {
  return required ? ' <span class="req" aria-hidden="true">*</span><span class="sr-only"> (required)</span>' : "";
}

function field({ label, name, type = "text", required = false, placeholder = "", autocomplete = "", help = "", inputmode = "", list = "", maxlength = 150 }) {
  const id = `f-${name}`;
  return `<div class="form-field">
    <label for="${id}">${label}${req(required)}</label>
    <input id="${id}" name="${name}" type="${type}"${required ? " required" : ""}${placeholder ? ` placeholder="${escapeHtml(placeholder)}"` : ""}${
    autocomplete ? ` autocomplete="${autocomplete}"` : ""
  }${inputmode ? ` inputmode="${inputmode}"` : ""}${list ? ` list="${list}"` : ""} maxlength="${maxlength}">
    ${help ? `<p class="field-help">${help}</p>` : ""}
  </div>`;
}

function select({ label, name, options, required = false, help = "" }) {
  const id = `f-${name}`;
  return `<div class="form-field">
    <label for="${id}">${label}${req(required)}</label>
    <select id="${id}" name="${name}"${required ? " required" : ""}>
      <option value="">Select…</option>
      ${options.map((o) => `<option value="${escapeHtml(o)}">${escapeHtml(o)}</option>`).join("\n      ")}
    </select>
    ${help ? `<p class="field-help">${help}</p>` : ""}
  </div>`;
}

function textarea({ label, name, required = false, placeholder = "", rows = 4, help = "", maxlength = 1500 }) {
  const id = `f-${name}`;
  return `<div class="form-field">
    <label for="${id}">${label}${req(required)}</label>
    <textarea id="${id}" name="${name}" rows="${rows}"${required ? " required" : ""}${placeholder ? ` placeholder="${escapeHtml(placeholder)}"` : ""} maxlength="${maxlength}"></textarea>
    ${help ? `<p class="field-help">${help}</p>` : ""}
  </div>`;
}

function consent(text) {
  return `<label class="consent">
    <input type="checkbox" name="consent" value="Yes" required>
    <span>${text} <a href="${BASE_PATH}/privacy/" target="_blank" rel="noopener">Privacy Policy</a>.<span class="req" aria-hidden="true"> *</span><span class="sr-only"> (required)</span></span>
  </label>`;
}

const COUNTRIES = [
  "United Kingdom", "India", "United Arab Emirates", "United States", "Canada", "Australia", "Singapore", "Pakistan",
  "Bangladesh", "Sri Lanka", "Nepal", "Saudi Arabia", "Qatar", "Kuwait", "Oman", "Bahrain", "Malaysia", "Hong Kong",
  "Ireland", "New Zealand", "South Africa", "Nigeria", "Kenya", "Ghana", "Egypt", "Germany", "France", "Netherlands",
];

const countryList = `<datalist id="country-list">${COUNTRIES.map((c) => `<option value="${escapeHtml(c)}">`).join("")}</datalist>`;

// ---------------------------------------------------------------------------
// The <form> wrapper: posts to FormSubmit, includes the spam trap + redirect
// ---------------------------------------------------------------------------

function formWrapper({ id, subject, multipart, inner, submitLabel }) {
  const ok = formsConfigured();
  return `${
    ok
      ? ""
      : `<div class="form-notice" role="note"><strong>Preview mode:</strong> this form isn't connected to an email address yet, so it can't be submitted. Site owner: set <code>FORM_EMAIL</code> in <code>scripts/config.mjs</code>.</div>`
  }
  <form id="${id}" class="mtb-form" action="https://formsubmit.co/${encodeURIComponent(FORM_EMAIL)}" method="POST"${
    multipart ? ' enctype="multipart/form-data"' : ""
  }>
    <input type="hidden" name="_subject" value="${escapeHtml(subject)}">
    <input type="hidden" name="_next" value="${SITE_URL}/thank-you/">
    <input type="hidden" name="_template" value="table">
    <input type="hidden" name="_captcha" value="${FORM_USE_CAPTCHA ? "true" : "false"}">
    <input type="text" name="_honey" class="hp-field" tabindex="-1" autocomplete="off" aria-hidden="true">
    ${inner}
    <p class="form-error" id="${id}-error" role="alert" hidden></p>
    <button class="btn-warm form-submit" type="submit"${ok ? "" : " disabled"}>${submitLabel}</button>
  </form>`;
}

// Page shell shared by both form pages: warm header block + form card + side note
function formPage({ title, description, path, emoji, heading, lead, sideTitle, sidePoints, formHtml }) {
  const head = renderHead({ title, description, path });
  return `<!DOCTYPE html>
<html lang="en">
<head>
${head}
</head>
<body class="warm">
${renderHeader()}

<main class="form-page">
  <div class="form-intro">
    <span class="form-emoji" aria-hidden="true">${emoji}</span>
    <h1>${heading}</h1>
    <p class="form-lead">${lead}</p>
  </div>

  <div class="form-layout">
    <section class="form-card" aria-label="${escapeHtml(heading)}">
      ${formHtml}
    </section>
    <aside class="form-side">
      <h2>${sideTitle}</h2>
      <ul>
        ${sidePoints.map((p) => `<li>${p}</li>`).join("\n        ")}
      </ul>
    </aside>
  </div>
</main>

${renderFooter()}
<script src="${BASE_PATH}/assets/forms.js"></script>
</body>
</html>
`;
}

// ---------------------------------------------------------------------------
// 1. Free demo class (students / parents)
// ---------------------------------------------------------------------------

export function renderFreeDemoPage(path) {
  const inner = `
    <div class="form-grid">
      ${field({ label: "Student's name", name: "student_name", required: true, autocomplete: "name", placeholder: "e.g. Aisha Khan" })}
      ${field({ label: "Parent / guardian name", name: "parent_name", autocomplete: "off", placeholder: "If the student is under 18", help: "Recommended for students under 18." })}
    </div>

    <div class="form-grid">
      ${select({
        label: "Grade / year",
        name: "grade",
        required: true,
        options: ["Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12", "Year 7", "Year 8", "Year 9", "Year 10 (GCSE)", "Year 11 (GCSE)", "A-Level (Year 12/13)", "SAT preparation", "Other"],
      })}
      ${select({
        label: "Board / curriculum",
        name: "board",
        required: true,
        options: ["GCSE – AQA", "GCSE – Edexcel", "GCSE – OCR", "GCSE – WJEC / Eduqas", "IGCSE – Cambridge", "IGCSE – Edexcel", "A-Level", "IB (MYP / DP)", "CBSE", "ICSE / ISC", "US Common Core", "SAT / AP", "Other / not sure"],
      })}
    </div>

    <div class="form-grid">
      ${field({ label: "Country", name: "country", required: true, autocomplete: "country-name", list: "country-list", placeholder: "Start typing…" })}
      ${field({ label: "Preferred days / times (with time zone)", name: "preferred_time", placeholder: "e.g. Weekdays after 5pm IST" })}
    </div>

    <div class="form-grid">
      ${field({ label: "Email", name: "email", type: "email", required: true, autocomplete: "email", placeholder: "you@example.com" })}
      ${field({ label: "Phone / WhatsApp", name: "phone", type: "tel", autocomplete: "tel", inputmode: "tel", placeholder: "+44 7700 900000", help: "Include the country code." })}
    </div>

    ${textarea({
      label: "Anything you'd like us to know?",
      name: "notes",
      placeholder: "e.g. topics your child finds tricky, exam dates, goals, or questions for us…",
      rows: 5,
    })}

    ${consent("I'm a parent/guardian, or I'm 18 or over, and I agree to MyTutBuddy contacting me about a free demo class. I've read the")}
    ${countryList}
  `;

  return formPage({
    title: "Book a Free Demo Class | MyTutBuddy",
    description: "Book a free Maths demo class with MyTutBuddy. Tell us the student's grade, board and country and we'll get in touch to arrange a time.",
    path,
    emoji: "🎈",
    heading: "Book a free demo class",
    lead: "Tell us a little about the student and we'll reach out to arrange a friendly first session.",
    sideTitle: "What happens next?",
    sidePoints: [
      "<strong>1.</strong> Send the form — it only takes a couple of minutes.",
      "<strong>2.</strong> We'll contact you to arrange a demo class time that suits you.",
      "<strong>3.</strong> Try a class and see if it's the right fit.",
      "Your details are only used to contact you about the demo class.",
    ],
    formHtml: formWrapper({ id: "demo-form", subject: "MyTutBuddy – Free demo class request", multipart: false, inner, submitLabel: "Request my free demo class" }),
  });
}

// ---------------------------------------------------------------------------
// 2. Teach with us (teacher applications, with CV upload)
// ---------------------------------------------------------------------------

export function renderTeacherPage(path) {
  const inner = `
    <div class="form-grid">
      ${field({ label: "Full name", name: "full_name", required: true, autocomplete: "name" })}
      ${field({ label: "Country / city", name: "location", required: true, autocomplete: "country-name", placeholder: "e.g. Leeds, United Kingdom" })}
    </div>

    <div class="form-grid">
      ${field({ label: "Email", name: "email", type: "email", required: true, autocomplete: "email" })}
      ${field({ label: "Phone / WhatsApp", name: "phone", type: "tel", required: true, autocomplete: "tel", inputmode: "tel", placeholder: "+44 7700 900000", help: "Include the country code." })}
    </div>

    <div class="form-grid">
      ${select({
        label: "Highest qualification",
        name: "qualification",
        required: true,
        options: ["Bachelor's degree", "Master's degree", "PhD / Doctorate", "PGCE / teaching certificate", "Diploma", "Other"],
      })}
      ${field({ label: "Degree subject & university", name: "degree_details", required: true, placeholder: "e.g. BSc Mathematics, University of Leeds" })}
    </div>

    <div class="form-grid">
      ${field({ label: "Subject(s) & levels you teach", name: "subjects", required: true, placeholder: "e.g. Maths – GCSE, A-Level, SAT" })}
      ${select({
        label: "Years of teaching / tutoring experience",
        name: "experience_years",
        required: true,
        options: ["Less than 1 year", "1–2 years", "3–5 years", "6–10 years", "More than 10 years"],
      })}
    </div>

    ${field({ label: "Boards / curricula you've taught", name: "boards", placeholder: "e.g. AQA, Edexcel, CBSE, IB" })}

    ${textarea({
      label: "Tell us about your teaching experience",
      name: "experience_details",
      required: true,
      placeholder: "Where you've taught, the age groups you enjoy, online teaching experience, and anything else you'd like to share…",
      rows: 5,
    })}

    ${field({ label: "Availability", name: "availability", placeholder: "e.g. Weekday evenings and weekends (GMT)" })}

    <div class="form-field">
      <label for="f-cv">Upload your CV${req(true)}</label>
      <input id="f-cv" name="attachment" type="file" required accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" data-max-mb="5">
      <p class="field-help">PDF, DOC or DOCX, up to 5&nbsp;MB. Please don't include ID numbers, bank details or photos of documents.</p>
    </div>

    ${consent("I agree to MyTutBuddy using the details and CV I've provided to consider my application and contact me about it. I've read the")}
  `;

  return formPage({
    title: "Teach With Us – Apply to Tutor Maths | MyTutBuddy",
    description: "Apply to teach Maths with MyTutBuddy. Share your education, subjects, experience and contact details, and upload your CV.",
    path,
    emoji: "🍎",
    heading: "Teach with MyTutBuddy",
    lead: "Love helping students click with Maths? Tell us about your background and upload your CV — we'd love to hear from you.",
    sideTitle: "Before you apply",
    sidePoints: [
      "Have your CV ready as a <strong>PDF, DOC or DOCX</strong> (up to 5&nbsp;MB).",
      "Tell us which subjects, levels and exam boards you're comfortable teaching.",
      "We'll review your application and contact you if it's a good fit.",
      "Your details and CV are only used to consider your application.",
    ],
    formHtml: formWrapper({ id: "teacher-form", subject: "MyTutBuddy – Teacher application", multipart: true, inner, submitLabel: "Submit my application" }),
  });
}

// ---------------------------------------------------------------------------
// 3. Thank-you page (FormSubmit sends people here after a successful submit)
// ---------------------------------------------------------------------------

export function renderThankYouPage(path) {
  const head = renderHead({
    title: "Thank you | MyTutBuddy",
    description: "Thanks for getting in touch with MyTutBuddy.",
    path,
    noindex: true,
  });
  return `<!DOCTYPE html>
<html lang="en">
<head>
${head}
</head>
<body class="warm">
${renderHeader()}

<main class="form-page thanks">
  <div class="thanks-card">
    <div class="thanks-emoji" aria-hidden="true">🎉</div>
    <h1>Thank you!</h1>
    <p>We've received your details and will be in touch soon.</p>
    <p class="thanks-note">While you wait, why not try a worksheet?</p>
    <a class="btn-warm" href="${BASE_PATH}/worksheets/">Browse worksheets</a>
    <a class="btn-ghost" href="${BASE_PATH}/">Back to home</a>
  </div>
</main>

${renderFooter()}
</body>
</html>
`;
}
