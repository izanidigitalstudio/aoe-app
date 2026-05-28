import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const distIndexPath = join(process.cwd(), "dist", "index.html");

const seo = {
  title: "AOE Connect | Art of Entrepreneurship Africa",
  description:
    "AOE Connect is the Art of Entrepreneurship Africa platform for AI entrepreneurs, events, conferences, funders, tools, projects, and member networking across Africa.",
  siteName: "AOE Connect",
  locale: "en_ZA",
  themeColor: "#0D0D0D",
};

const tags = [
  `<title>${seo.title}</title>`,
  `<meta name="description" content="${seo.description}" />`,
  `<meta name="robots" content="index, follow" />`,
  `<meta name="theme-color" content="${seo.themeColor}" />`,
  `<meta property="og:title" content="${seo.title}" />`,
  `<meta property="og:description" content="${seo.description}" />`,
  `<meta property="og:type" content="website" />`,
  `<meta property="og:site_name" content="${seo.siteName}" />`,
  `<meta property="og:locale" content="${seo.locale}" />`,
  `<meta name="twitter:card" content="summary" />`,
  `<meta name="twitter:title" content="${seo.title}" />`,
  `<meta name="twitter:description" content="${seo.description}" />`,
].join("\n    ");

let html = readFileSync(distIndexPath, "utf8");

html = html
  .replace(/<title>[\s\S]*?<\/title>\s*/i, "")
  .replace(/\s*<meta\s+(?:name|property)=["'](?:description|robots|theme-color|og:title|og:description|og:type|og:site_name|og:locale|twitter:card|twitter:title|twitter:description)["'][^>]*>\s*/gi, "\n    ");

html = html.replace(/<\/head>/i, `\n    ${tags}\n  </head>`);

writeFileSync(distIndexPath, html);
