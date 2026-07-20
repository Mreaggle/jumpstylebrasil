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
const canonical = fs.readFileSync(source, "utf8");
const current = fs.readFileSync(target, "utf8");
const eventCount = (canonical.match(/^[ ]{2}-[ ]+/gm) || []).length;

if (eventCount === 0) {
  console.error(`sync:jun: canonical source has no detailed events: ${source}`);
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const globalSource = manifest.priority_sources.find(
  (entry) => entry.path === "JumpstyleTimeline/Global/global-timeline.md"
);

if (!globalSource) {
  console.error("sync:jun: source manifest does not declare the canonical Global Timeline");
  process.exit(1);
}

const canonicalBlobSha = gitBlobSha(canonical);
const contentMatches = current === canonical;
const manifestMatches = globalSource.observed_blob_sha === canonicalBlobSha;

if (checkOnly) {
  if (!contentMatches || !manifestMatches) {
    console.error(
      `sync:jun: site copy is stale (canonical=${eventCount} events, content=${contentMatches ? "ok" : "different"}, manifest=${manifestMatches ? "ok" : "different"})`
    );
    process.exit(1);
  }
  console.log(`sync:jun: ok — repository and site expose the same ${eventCount} detailed events`);
  process.exit(0);
}

if (!contentMatches) fs.writeFileSync(target, canonical);
globalSource.observed_blob_sha = canonicalBlobSha;
manifest.synchronization = {
  canonical_path: "JumpstyleTimeline/Global/global-timeline.md",
  generated_copy: "src/data/global-timeline.md",
  rule: "The deployed JUN page must be built from the canonical archive checkout; never update the displayed count independently."
};
fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

console.log(`sync:jun: copied ${eventCount} canonical events into the site build input`);

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
