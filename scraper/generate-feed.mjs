import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "..", "data");
const SNAPSHOT_DIR = join(DATA_DIR, "snapshots");

const MILESTONES = [100, 500, 1000, 5000, 10000];
const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

function readJSON(...parts) {
  const path = join(...parts);
  if (!existsSync(path)) return [];
  try {
    return JSON.parse(readFileSync(path, "utf-8"));
  } catch {
    return [];
  }
}

function now() {
  return new Date().toISOString();
}

function daysAgo(n) {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000).toISOString();
}

function dedupKey(entry) {
  return `${entry.type}::${entry.entity_id}::${entry.entity_type}`;
}

function fmtDownloads(n) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

/* ─── Detect milestone crossings ─── */

function detectMilestones(models, snapshots) {
  const entries = [];
  // Group snapshots by model_id
  const byModel = {};
  for (const s of snapshots) {
    if (!byModel[s.model_id]) byModel[s.model_id] = [];
    byModel[s.model_id].push(s);
  }

  for (const model of models) {
    const id = model.id || model.name;
    const currentDl = model.downloads_monthly || model.dl || 0;
    const snaps = (byModel[id] || []).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Previous snapshot value (snaps[1] is the second-newest = previous period)
    const prevDl = snaps.length > 1 ? snaps[1].downloads : 0;

    // Check which milestones were crossed
    for (const ms of MILESTONES) {
      if (currentDl >= ms && prevDl < ms) {
        entries.push({
          type: "milestone",
          title: `${model.name} crossed ${fmtDownloads(ms)} downloads`,
          description: `${model.name} reached ${fmtDownloads(currentDl)} monthly downloads.`,
          entity_id: id,
          entity_type: "model",
          metadata: { milestone: ms, downloads: currentDl },
          created_at: now(),
        });
      }
    }
  }
  return entries;
}

/* ─── Detect trending (download growth >20% WoW) ─── */

function detectTrending(models, snapshots) {
  const entries = [];
  const byModel = {};
  for (const s of snapshots) {
    if (!byModel[s.model_id]) byModel[s.model_id] = [];
    byModel[s.model_id].push(s);
  }

  for (const model of models) {
    const id = model.id || model.name;
    const currentDl = model.downloads_monthly || model.dl || 0;
    const snaps = (byModel[id] || []).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    if (snaps.length < 2) continue;

    // Compare current with snapshot from ~1 week ago
    const oneWeekAgo = Date.now() - SEVEN_DAYS;
    const prevSnap = snaps.find((s) => new Date(s.timestamp).getTime() <= oneWeekAgo) || snaps[1];
    const prevDl = prevSnap.downloads || 0;

    if (prevDl > 0) {
      const growth = ((currentDl - prevDl) / prevDl) * 100;
      if (growth > 20) {
        entries.push({
          type: "trending",
          title: `${model.name} downloads up ${Math.round(growth)}%`,
          description: `${model.name} grew from ${fmtDownloads(prevDl)} to ${fmtDownloads(currentDl)} downloads/month.`,
          entity_id: id,
          entity_type: "model",
          metadata: { growth: Math.round(growth), previous: prevDl, current: currentDl },
          created_at: now(),
        });
      }
    }
  }
  return entries;
}

/* ─── Detect new models/datasets (added in last 7 days) ─── */

function detectNew(items, type, label) {
  const entries = [];
  const cutoff = Date.now() - SEVEN_DAYS;

  for (const item of items) {
    const published = item.last_updated || item.added_at || item.created_at;
    if (published && new Date(published).getTime() >= cutoff) {
      entries.push({
        type: `new_${type}`,
        title: `New ${label}: ${item.name}`,
        description: item.description || item.desc || "",
        entity_id: item.id || item.name,
        entity_type: type,
        metadata: { name: item.name, author: item.org || item.author_name || "" },
        created_at: published,
      });
    }
  }
  return entries;
}

/* ─── Detect new papers ─── */

function detectNewPapers(papers, existing) {
  const entries = [];
  const existingIds = new Set(existing.filter((e) => e.type === "new_paper").map((e) => e.entity_id));

  for (const paper of papers) {
    if (existingIds.has(paper.arxiv_id)) continue;
    entries.push({
      type: "new_paper",
      title: `New paper: ${paper.title}`,
      description: (paper.authors || []).slice(0, 3).join(", ") + " — " + (paper.abstract || "").slice(0, 120),
      entity_id: paper.arxiv_id,
      entity_type: "paper",
      metadata: { title: paper.title, authors: paper.authors, categories: paper.categories },
      created_at: paper.published_date || now(),
    });
  }
  return entries;
}

/* ─── Main ─── */

async function main() {
  console.log("╔══════════════════════════════════════╗");
  console.log("║   goha.et — Activity Feed Generator  ║");
  console.log("╚══════════════════════════════════════╝\n");

  if (!existsSync(DATA_DIR)) {
    console.log("  No scraper data found. Run scraper/index.mjs first.");
    process.exit(0);
  }

  // Read from db.json
  const db = readJSON(DATA_DIR, "db.json");
  const models = db?.models || [];
  const datasets = db?.datasets || [];
  const papers = db?.papers || [];

  // Read snapshots from snapshots/ directory (flatten into flat array)
  const snapshots = [];
  let snapshotFiles = 0;
  if (existsSync(SNAPSHOT_DIR)) {
    const files = readdirSync(SNAPSHOT_DIR)
      .filter((f) => f.endsWith(".json"))
      .sort();
    snapshotFiles = files.length;
    for (const file of files) {
      const snap = readJSON(SNAPSHOT_DIR, file);
      if (!snap || !snap.models) continue;
      for (const m of snap.models) {
        snapshots.push({ model_id: m.id, downloads: m.downloads, likes: m.likes, timestamp: snap.date });
      }
    }
  }

  console.log(`  Models:    ${models.length}`);
  console.log(`  Datasets:  ${datasets.length}`);
  console.log(`  Papers:    ${papers.length}`);
  console.log(`  Snapshots: ${snapshots.length} (${snapshotFiles} files)\n`);

  // Read existing feed for dedup
  const feedPath = join(DATA_DIR, "activity_feed.json");
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  const existingFeed = readJSON(feedPath);
  const seen = new Set(existingFeed.map(dedupKey));

  // Generate candidates
  const candidates = [
    ...detectNew(models, "model", "model"),
    ...detectNew(datasets, "dataset", "dataset"),
    ...detectTrending(models, snapshots),
    ...detectMilestones(models, snapshots),
    ...detectNewPapers(papers, existingFeed),
  ];

  // Deduplicate
  const newEntries = candidates.filter((e) => {
    const key = dedupKey(e);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  if (newEntries.length === 0) {
    console.log("  No new activity feed entries to add.");
    process.exit(0);
  }

  // Assign IDs and save
  let nextId = existingFeed.length > 0 ? Math.max(...existingFeed.map((e) => e.id || 0)) + 1 : 1;
  const withIds = newEntries.map((e, i) => ({ id: nextId + i, ...e }));

  const updated = [...existingFeed, ...withIds];
  writeFileSync(feedPath, JSON.stringify(updated, null, 2));

  console.log(`  Generated ${newEntries.length} new entries:\n`);
  for (const e of withIds) {
    const icon =
      e.type === "new_model" ? "🟢" :
      e.type === "new_dataset" ? "📊" :
      e.type === "new_paper" ? "📄" :
      e.type === "trending" ? "📈" : "🏆";
    console.log(`  ${icon} [${e.type}] ${e.title}`);
    console.log(`     ${e.description.slice(0, 80)}`);
    console.log();
  }

  console.log(`  Total feed entries: ${updated.length}`);
  console.log("Done.");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
