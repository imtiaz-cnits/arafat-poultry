import fs from "node:fs";
import path from "node:path";

const targetDirs = ["app", "components"];

function processFile(filePath) {
  // Exclude delete-confirm-modal as delete action should remain semantic red
  if (filePath.includes("delete-confirm-modal")) return;
  // Exclude node_modules, .next
  if (filePath.includes("node_modules") || filePath.includes(".next")) return;

  let content = fs.readFileSync(filePath, "utf-8");
  let modified = false;

  // Pattern 1: Red modal header / table header: from-[#881337] via-[#991b1b] to-[#b91c1c]
  if (content.includes("from-[#881337] via-[#991b1b] to-[#b91c1c]")) {
    content = content.replaceAll(
      "from-[#881337] via-[#991b1b] to-[#b91c1c]",
      "from-[#14532d] via-[#166534] to-[#15803d]"
    );
    modified = true;
  }

  // Pattern 2: from-[#881337] via-[#991b1b] to-[#dc2626]
  if (content.includes("from-[#881337] via-[#991b1b] to-[#dc2626]")) {
    content = content.replaceAll(
      "from-[#881337] via-[#991b1b] to-[#dc2626]",
      "from-[#14532d] via-[#166534] to-[#15803d]"
    );
    modified = true;
  }

  // Pattern 3: hover:from-[#7f1d1d] hover:to-[#b91c1c]
  if (content.includes("hover:from-[#7f1d1d] hover:to-[#b91c1c]")) {
    content = content.replaceAll(
      "hover:from-[#7f1d1d] hover:to-[#b91c1c]",
      "hover:from-[#0f3d21] hover:to-[#14532d]"
    );
    modified = true;
  }

  // Pattern 4: hover:from-[#700e2b] hover:to-[#b91c1c]
  if (content.includes("hover:from-[#700e2b] hover:to-[#b91c1c]")) {
    content = content.replaceAll(
      "hover:from-[#700e2b] hover:to-[#b91c1c]",
      "hover:from-[#0f3d21] hover:to-[#14532d]"
    );
    modified = true;
  }

  // Pattern 5: from-[#991b1b] to-[#dc2626]
  if (content.includes("from-[#991b1b] to-[#dc2626]")) {
    content = content.replaceAll(
      "from-[#991b1b] to-[#dc2626]",
      "from-[#14532d] via-[#166534] to-[#15803d]"
    );
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(filePath, content, "utf-8");
    console.log(`Updated theme colors in: ${filePath}`);
  }
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== "node_modules" && entry.name !== ".next") {
        walk(fullPath);
      }
    } else if (entry.name.endsWith(".tsx") || entry.name.endsWith(".ts")) {
      processFile(fullPath);
    }
  }
}

for (const d of targetDirs) {
  walk(d);
}
console.log("✓ Theme color migration complete.");
