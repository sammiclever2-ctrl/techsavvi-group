// Simple static site builder: wraps each page in src/pages with the shared
// layout, header and footer, then copies public/ into dist/.
// Usage: node build.mjs   (Tailwind CSS is compiled separately by `npm run build`)
import { readFileSync, writeFileSync, mkdirSync, readdirSync, cpSync, rmSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const site = JSON.parse(readFileSync(join(root, "site.config.json"), "utf8"));
const dist = join(root, "dist");
const partial = (name) => readFileSync(join(root, "src/partials", `${name}.html`), "utf8");

if (existsSync(dist)) rmSync(dist, { recursive: true });
mkdirSync(dist, { recursive: true });
cpSync(join(root, "public"), dist, { recursive: true });

function parsePage(raw) {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) throw new Error("Page is missing its --- front matter --- block");
  const meta = {};
  for (const line of m[1].split("\n")) {
    const i = line.indexOf(":");
    if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return { meta, body: m[2] };
}

function fill(template, vars) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, k) => (k in vars ? vars[k] : `{{${k}}}`));
}

const layout = partial("layout");
const header = partial("header");
const footer = partial("footer");
const sitemap = [];

for (const file of readdirSync(join(root, "src/pages")).filter((f) => f.endsWith(".html"))) {
  const { meta, body } = parsePage(readFileSync(join(root, "src/pages", file), "utf8"));
  const path = meta.path || "/";
  const vars = {
    ...site,
    title: meta.title ? `${meta.title} | ${site.name}` : `${site.name} | ${site.tagline}`,
    description: meta.description || site.description,
    canonical: site.url + (path === "/" ? "/" : path),
    year: String(new Date().getFullYear()),
  };

  // Mark the current page in the navigation
  let head = fill(header, vars);
  if (meta.nav) {
    head = head.replace(new RegExp(`data-nav="${meta.nav}"`, "g"), `data-nav="${meta.nav}" aria-current="page"`);
  }

  const html = fill(layout, {
    ...vars,
    header: head,
    footer: fill(footer, vars),
    content: fill(body, vars),
    robots: meta.noindex ? "noindex, follow" : "index, follow",
  });

  const outDir = file === "index.html" || file === "404.html" ? dist : join(dist, file.replace(/\.html$/, ""));
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, file === "404.html" ? "404.html" : "index.html"), html);
  if (!meta.noindex) sitemap.push(vars.canonical);
}

writeFileSync(
  join(dist, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemap
    .map((u) => `  <url><loc>${u}</loc></url>`)
    .join("\n")}\n</urlset>\n`
);
writeFileSync(join(dist, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${site.url}/sitemap.xml\n`);
console.log(`Built ${sitemap.length} pages into dist/`);
