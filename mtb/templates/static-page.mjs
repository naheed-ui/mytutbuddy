import { renderHead, renderHeader, renderFooter } from "./layout.mjs";

// A simple static page: a title and a block of pre-written HTML content.
export function renderStaticPage({ title, description, path, bodyHtml }) {
  const head = renderHead({ title, description, path });

  return `<!DOCTYPE html>
<html lang="en">
<head>
${head}
</head>
<body>
${renderHeader()}

<main class="section" style="max-width:760px;">
  ${bodyHtml}
</main>

${renderFooter()}
</body>
</html>
`;
}