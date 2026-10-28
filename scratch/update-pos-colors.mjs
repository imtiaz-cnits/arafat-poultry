import fs from "fs";

const filePath = "app/pos/page.tsx";
let content = fs.readFileSync(filePath, "utf-8");

const replacements = [
  // Red gradient hover
  ["group-hover:from-[#991b1b] group-hover:to-[#dc2626]", "group-hover:from-[#14532d] group-hover:via-[#166534] group-hover:to-[#15803d]"],
  // Active/selected filters
  ['bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-900 text-rose-700 dark:text-rose-400', 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-900 text-emerald-700 dark:text-emerald-400'],
  ['bg-rose-50/80 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 font-bold', 'bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-bold'],
  ['text-rose-600 dark:text-rose-400 shrink-0', 'text-emerald-700 dark:text-emerald-400 shrink-0'],
  ['rotate-180 text-rose-600', 'rotate-180 text-emerald-700'],
  ['hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400', 'hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-400'],
  ['hover:text-rose-600', 'hover:text-emerald-700'],
  ['group-hover:text-rose-600', 'group-hover:text-emerald-700'],
  // Stock badges
  ['bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200/50 dark:border-rose-900/50', 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-900/50'],
  ['bg-rose-50 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300 border border-rose-200/60 dark:border-rose-900/60', 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-900/60'],
  ['text-rose-700 dark:text-rose-400 tracking-tight', 'text-emerald-700 dark:text-emerald-400 tracking-tight'],
  ['text-rose-700 dark:text-rose-400', 'text-emerald-700 dark:text-emerald-400'],
  ['UserCheck className="w-4 h-4 text-rose-600 shrink-0"', 'UserCheck className="w-4 h-4 text-emerald-700 shrink-0"'],
  ['ShoppingBag className="w-10 h-10 stroke-[1.5] mb-2 opacity-30 text-rose-500"', 'ShoppingBag className="w-10 h-10 stroke-[1.5] mb-2 opacity-30 text-emerald-500"'],
  ['ShoppingBag className="w-5 h-5 text-rose-400"', 'ShoppingBag className="w-5 h-5 text-emerald-400"'],
  ['bg-rose-600 text-white text-[10px]', 'bg-emerald-600 text-white text-[10px]'],
  ['text-xs font-black text-rose-400', 'text-xs font-black text-emerald-400'],
  ['bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400 border border-rose-200 dark:border-rose-900', 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900'],
  ['strong className="text-rose-600 font-bold"', 'strong className="text-emerald-700 font-bold"'],
  ['font-mono text-rose-600 dark:text-rose-400', 'font-mono text-emerald-700 dark:text-emerald-400'],
  ['text-[10px] text-rose-600 font-bold', 'text-[10px] text-emerald-700 font-bold'],
  ['font-black text-rose-700 dark:text-rose-400 text-sm', 'font-black text-emerald-700 dark:text-emerald-400 text-sm'],
  ['px-1.5 py-0.5 rounded bg-rose-100 hover:bg-rose-200 text-rose-800 dark:bg-rose-950 dark:hover:bg-rose-900 dark:text-rose-300 text-[10px] font-bold cursor-pointer', 'px-1.5 py-0.5 rounded bg-emerald-100 hover:bg-emerald-200 text-emerald-800 dark:bg-emerald-950 dark:hover:bg-emerald-900 dark:text-emerald-300 text-[10px] font-bold cursor-pointer'],
  ['border-rose-600 bg-white dark:bg-[#1e293b] text-rose-700 dark:text-rose-300', 'border-emerald-600 bg-white dark:bg-[#1e293b] text-emerald-700 dark:text-emerald-300'],
  ['font-bold text-rose-600 uppercase tracking-wider', 'font-bold text-emerald-700 uppercase tracking-wider'],
  ['bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-200 border border-rose-200 dark:border-rose-900', 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-900'],
  ['bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300', 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'],
  ['font-black text-rose-600 text-xs', 'font-black text-emerald-700 text-xs'],
  ['strong className="text-rose-700 dark:text-rose-400 font-bold"', 'strong className="text-emerald-700 dark:text-emerald-400 font-bold"'],
  ['bg-rose-50 group-hover:bg-gradient-to-r', 'bg-emerald-50 group-hover:bg-gradient-to-r'],
  ['text-rose-600 flex items-center justify-center transition-all shadow-2xs group-hover:shadow-xs', 'text-emerald-700 flex items-center justify-center transition-all shadow-2xs group-hover:shadow-xs'],
];

let count = 0;
for (const [from, to] of replacements) {
  if (content.includes(from)) {
    content = content.replaceAll(from, to);
    count++;
  }
}

fs.writeFileSync(filePath, content, "utf-8");
console.log(`Updated POS with ${count} theme styling changes.`);
