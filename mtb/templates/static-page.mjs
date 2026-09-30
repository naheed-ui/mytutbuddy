import { renderHead, renderHeader, renderFooter } from "./layout.mjs";

export function renderStaticPage({ title, description, path, bodyHtml }) {
  const head = renderHead({ title, description, path });
  return `<!DOCTYPE html>
<html lang="en">
<head>
${head}
</head>
<body>
${renderHeader()}

<main class="section static-page">
${bodyHtml}
</main>

${renderFooter()}
</body>
</html>
`;
}
