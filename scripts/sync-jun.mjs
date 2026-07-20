import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const args = process.argv.slice(2);
const checkOnly = args.includes("--check");
const sourceArg = valueAfter("--source");
const candidates = [
  sourceArg,
  process.env.JUN_TIMELINE_SOURCE,
  "jun-archive/JumpstyleTimeline/Global/global-timeline.md",
  "../JumpstyleUnitedNations/JumpstyleTimeline/Global/global-timeline.md"
].filter(Boolean);
const source = candidates.map((candidate) => path.resolve(root, candidate)).find(fs.existsSync);

if (!source) {
  console.error("sync:jun: canonical Global Timeline not found; pass --source <path> or set JUN_TIMELINE_SOURCE");
  process.exit(1);
}

const target = path.join(root, "src/data/global-timeline.md");
const manifestPath = path.join(root, "manifests/jun-source-manifest.json");
const junDataPath = path.join(root, "src/data/jun-data.json");
const archiveRoot = path.resolve(path.dirname(source), "../..");
const keyFiguresSourcePath = path.join(archiveRoot, "JUNToolkit/KeyFiguresWorldwide/Dance/README.md");
const canonical = fs.readFileSync(source, "utf8");
const current = fs.readFileSync(target, "utf8");
const keyFiguresMarkdown = fs.readFileSync(keyFiguresSourcePath, "utf8");
const junData = JSON.parse(fs.readFileSync(junDataPath, "utf8"));
const expectedFigures = parseKeyFigures(keyFiguresMarkdown, junData);
const eventCount = (canonical.match(/^[ ]{2}-[ ]+/gm) || []).length;

if (eventCount === 0) {
  console.error(`sync:jun: canonical source has no detailed events: ${source}`);
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const globalSource = manifest.priority_sources.find(
  (entry) => entry.path === "JumpstyleTimeline/Global/global-timeline.md"
);
const keyFiguresSource = manifest.priority_sources.find(
  (entry) => entry.path === "JUNToolkit/KeyFiguresWorldwide/Dance/README.md"
);

if (!globalSource || !keyFiguresSource) {
  console.error("sync:jun: source manifest does not declare the canonical timeline and Key Figures dataset");
  process.exit(1);
}

const canonicalBlobSha = gitBlobSha(canonical);
const keyFiguresBlobSha = gitBlobSha(keyFiguresMarkdown);
const contentMatches = current === canonical;
const manifestMatches = globalSource.observed_blob_sha === canonicalBlobSha;
const figuresMatch = JSON.stringify(junData.figures) === JSON.stringify(expectedFigures);
const figuresManifestMatches = keyFiguresSource.observed_blob_sha === keyFiguresBlobSha;

if (checkOnly) {
  if (!contentMatches || !manifestMatches || !figuresMatch || !figuresManifestMatches) {
    console.error(
      `sync:jun: site copy is stale (canonical=${eventCount} events, content=${contentMatches ? "ok" : "different"}, timeline-manifest=${manifestMatches ? "ok" : "different"}, figures=${figuresMatch ? "ok" : "different"}, figures-manifest=${figuresManifestMatches ? "ok" : "different"})`
    );
    process.exit(1);
  }
  console.log(`sync:jun: ok — repository and site expose ${eventCount} detailed events and all ${expectedFigures.length} key figures`);
  process.exit(0);
}

if (!contentMatches) fs.writeFileSync(target, canonical);
if (!figuresMatch) {
  junData.figures = expectedFigures;
  fs.writeFileSync(junDataPath, `${JSON.stringify(junData, null, 2)}\n`);
}
globalSource.observed_blob_sha = canonicalBlobSha;
keyFiguresSource.observed_blob_sha = keyFiguresBlobSha;
manifest.synchronization = {
  canonical_path: "JumpstyleTimeline/Global/global-timeline.md",
  generated_copy: "src/data/global-timeline.md",
  key_figures_path: "JUNToolkit/KeyFiguresWorldwide/Dance/README.md",
  generated_key_figures: "src/data/jun-data.json#figures",
  rule: "The deployed JUN page must be built from the canonical archive checkout; never update the displayed count independently."
};
fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

console.log(`sync:jun: copied ${eventCount} canonical events and all ${expectedFigures.length} key figures into the site build input`);

function valueAfter(flag) {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : undefined;
}

function gitBlobSha(content) {
  const payload = Buffer.from(content);
  return crypto
    .createHash("sha1")
    .update(`blob ${payload.length}\0`)
    .update(payload)
    .digest("hex");
}

function parseKeyFigures(markdown, data) {
  const countriesByCode = new Map(data.countries.map((country) => [country.code, country]));
  const codesByFlag = new Map(data.countries.map((country) => [flagEmoji(country.code), country.code]));
  const existing = new Map(data.figures.map((figure) => [normalizeName(figure.name), figure]));
  const figures = new Map();
  let era = "Community index";
  let countryCode = "";
  let inCountryIndex = false;

  for (const rawLine of markdown.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (/^##\s+🏆 Key Figures by Country/.test(line)) {
      inCountryIndex = true;
      continue;
    }
    if (/^---/.test(line) && inCountryIndex) break;

    if (!inCountryIndex && /^#{3,4}\s+/.test(line)) {
      if (/Patrick Jumpen Era/i.test(line)) era = "2007-2008";
      else if (/2008-2009/.test(line)) era = "2008-2009";
      else if (/2010-2012/.test(line)) era = "2010-2012";
      else if (/Modern Era/i.test(line)) era = "2012-now";
    }

    if (inCountryIndex && /^###\s+/.test(line)) {
      countryCode = [...codesByFlag.entries()].find(([flag]) => line.includes(flag))?.[1] || "";
      continue;
    }

    if (!/^[-*]\s+/.test(line)) continue;
    let itemCountryCode = countryCode;
    if (!inCountryIndex) {
      itemCountryCode = [...codesByFlag.entries()].find(([flag]) => line.includes(flag))?.[1] || "";
      if (!itemCountryCode) continue;
    }
    if (!itemCountryCode) continue;

    const parsed = parseFigureLine(line);
    if (!parsed?.name) continue;
    const key = normalizeName(parsed.name);
    const previous = figures.get(key);
    const enriched = existing.get(key);
    const country = countriesByCode.get(itemCountryCode);
    const url = parsed.url && parsed.url !== "#"
      ? parsed.url
      : `${data.figuresUrl}#${slug(country.name)}`;
    const figure = {
      name: parsed.name,
      country: country.name,
      code: itemCountryCode,
      era: enriched?.era || parsed.era || era,
      note: enriched?.note || `Community-indexed figure whose work contributed to the ${country.name} scene and to Jumpstyle's international development.`,
      url: enriched?.url || url
    };

    if (!previous || (previous.url.includes("#") && !figure.url.includes("#"))) figures.set(key, figure);
  }

  return [...figures.values()];
}

function parseFigureLine(line) {
  const markdownLabel = line.match(/\[([^\]]+)\]/)?.[1];
  const prefixName = line.match(/^[-*]\s+(?:[\p{Regional_Indicator}]{2}\s+)?([^:[\]]+):\s+\[/u)?.[1];
  const rawName = prefixName || markdownLabel;
  if (!rawName) return null;
  const name = rawName
    .replaceAll("**", "")
    .replace(/:$/, "")
    .replace(/\s+(?:19|20)\d{2}$/, "")
    .trim();
  const urls = [...line.matchAll(/https?:\/\/[^)\]\s]+/g)].map((match) => match[0]);
  const href = line.match(/\]\(([^)]*)\)/)?.[1];
  const explicitYear = rawName.match(/((?:19|20)\d{2})/)?.[1];
  return { name, era: explicitYear || undefined, url: urls[0] || href || "#" };
}

function normalizeName(name) {
  return String(name).normalize("NFKD").replace(/\p{M}/gu, "").toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function flagEmoji(code) {
  if (!/^[A-Z]{2}$/.test(code)) return "";
  return [...code].map((letter) => String.fromCodePoint(127397 + letter.charCodeAt(0))).join("");
}

function slug(value) {
  return String(value).normalize("NFKD").replace(/\p{M}/gu, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
