import fs from "node:fs";
import path from "node:path";

const targetDirs = ["app", "components"];

function updateBadges(filePath) {
  if (filePath.includes("node_modules") || filePath.includes(".next")) return;

  let content = fs.readFileSync(filePath, "utf-8");
  let modified = false;

  // Header icon badges
  const roseBadgePattern = /w-9 h-9 rounded-xl bg-rose-50 text-rose-600/g;
  if (roseBadgePattern.test(content)) {
    content = content.replace(
      /w-9 h-9 rounded-xl bg-rose-50 text-rose-600 dark:bg-emerald-950\/50 dark:text-emerald-400 border border-rose-100/g,
      "w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-100"
    );
    content = content.replace(
      /w-9 h-9 rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950\/50 dark:text-rose-400 border border-rose-100/g,
      "w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-100"
    );
    content = content.replace(
      /w-9 h-9 rounded-xl bg-rose-50 text-rose-600 border border-rose-100/g,
      "w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100"
    );
    modified = true;
  }

  // Also replace w-10 h-10 header badges
  if (content.includes("w-10 h-10 rounded-xl bg-rose-50")) {
    content = content.replaceAll(
      "w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400",
      "w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400"
    );
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(filePath, content, "utf-8");
    console.log(`Updated badges in: ${filePath}`);
  }
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== "node_modules" && entry.name !== ".next") walk(fullPath);
    } else if (entry.name.endsWith(".tsx") || entry.name.endsWith(".ts")) {
      updateBadges(fullPath);
    }
  }
}

for (const d of targetDirs) {
  walk(d);
}
console.log("✓ Icon badge update complete.");
