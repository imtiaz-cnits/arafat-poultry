import fs from "fs";

const filePath = "app/(dashboard)/products/page.tsx";
let content = fs.readFileSync(filePath, "utf-8");

// 1. Remove Barcodes column header
content = content.replace(
  /\r?\n\s*<th className="p-\[10px\]">Barcodes<\/th>/,
  ""
);

// 2. Remove Barcodes column data td
content = content.replace(
  /\r?\n\s*<td className="p-\[10px\] font-mono text-\[11px\] text-slate-600 dark:text-slate-300">[\s\S]*?<\/td>/,
  ""
);

// 3. Update colSpan from 10 to 9
content = content.replace(/colSpan=\{10\}/g, "colSpan={9}");

// 4. Update placeholder
content = content.replace(
  'placeholder="Search product, barcode..."',
  'placeholder="Search product name..."'
);

// 5. Clean print table header
content = content.replace(
  '<th className="p-1.5">Code / Barcode</th>',
  '<th className="p-1.5">Category & Brand</th>'
);

// 6. Clean print table td
content = content.replace(
  /<td className="p-1.5 font-mono text-\[10px\]">[\s\S]*?<\/td>/,
  '<td className="p-1.5">{p.category} - {p.brand}</td>'
);

fs.writeFileSync(filePath, content, "utf-8");
console.log("Successfully cleaned Barcode from products/page.tsx!");
