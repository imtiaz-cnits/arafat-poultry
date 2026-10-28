import fs from "fs";

const filePath = "app/pos/page.tsx";
let content = fs.readFileSync(filePath, "utf-8");

content = content.replace(
  'placeholder="🔍 Scan barcode gun or type code / product name... (F2)"',
  'placeholder="🔍 Search product code or name... (F2)"'
);

content = content.replace(
  "Scan a barcode or click any product from the catalog to add items.",
  "Click any product from the catalog to add items."
);

fs.writeFileSync(filePath, content, "utf-8");
console.log("Updated POS barcode text references.");
