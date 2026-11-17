export type SystemRole = "admin" | "manager" | "staff";

export const SUPER_ADMIN_EMAIL = "dev@arafatpoultry.com";

export const ALLOWED_SYSTEM_ROLES: readonly SystemRole[] = [
  "admin",
  "manager",
  "staff",
] as const;

export function isValidSystemRole(role: string): role is SystemRole {
  return (ALLOWED_SYSTEM_ROLES as readonly string[]).includes(role);
}

export function isSuperAdminRole(role?: string | null): boolean {
  return (role || "").trim().toLowerCase() === "super_admin";
}

export function isAdminRole(role?: string | null): boolean {
  const normalized = (role || "").trim().toLowerCase();
  return normalized === "admin" || normalized === "super_admin";
}

export function isProtectedSuperAdmin(user?: {
  email?: string | null;
  role?: string | null;
} | null): boolean {
  if (!user) return false;
  const email = (user.email || "").trim().toLowerCase();
  return email === SUPER_ADMIN_EMAIL || isSuperAdminRole(user.role);
}

export const SYSTEM_ROLE_OPTIONS: {
  value: SystemRole;
  label: string;
  subLabel: string;
  badge: string;
}[] = [
  {
    value: "staff",
    label: "Staff (স্টাফ)",
    subLabel: "Sales, poultry, fish & stock operations",
    badge: "Operations",
  },
  {
    value: "manager",
    label: "Manager (ম্যানেজার)",
    subLabel: "Full operations & financial reports",
    badge: "Management",
  },
  {
    value: "admin",
    label: "Admin (অ্যাডমিন)",
    subLabel: "Full system access & user approvals",
    badge: "Full Access",
  },
];

export const SIDEBAR_MODULES: {
  key: string;
  label: string;
  desc: string;
  submenus?: { key: string; label: string; desc: string }[];
}[] = [
  { key: "dashboard", label: "ড্যাশবোর্ড (Dashboard)", desc: "মূল সার্বিক ড্যাশবোর্ড ওভারভিউ ও তথ্য" },
  { key: "sales-portal", label: "বিক্রয় পোর্টাল (Sales Portal)", desc: "পণ্য নির্বাচন, নগদ বিক্রয় ও দ্রুত ক্যাশ বিলিং" },
  { key: "purchases", label: "পণ্য ক্রয়", desc: "মাছ, ফিড ও অন্যান্য ক্রয় ও ইনওয়ার্ড স্টক" },
  { key: "poultry", label: "মুরগির হিসাব (Poultry Management)", desc: "শেডভিত্তিক ব্যাচ, বয়স, খাবার ও মৃত্যুর হিসাব" },
  { key: "fish", label: "মাছের হিসাব (Fisheries Management)", desc: "পুকুর ব্যবস্থাপনা, পোনা মজুদ, নমুনা ওজন ও আহরণ" },
  { key: "suppliers", label: "সরবরাহকারী (Suppliers & Vendors)", desc: "সরবরাহকারীর প্রোফাইল ও ক্রয় বকেয়া দেনা" },
  { key: "customers", label: "কাস্টমার (Customer Directory)", desc: "গ্রাহক তথ্য ও বাকির খাতা" },
  { key: "memo", label: "মেমো (Memo & Invoices)", desc: "বিক্রয় ইনভয়েস, চালান ও প্রিন্ট ভাউচার" },
  {
    key: "stock",
    label: "স্টক মডিউল (Stock Management)",
    desc: "সকল পণ্যের লাইভ গুদাম ও মজুদ নিয়ন্ত্রণ",
    submenus: [
      { key: "stock_eggs", label: "ডিমের স্টক (Egg Stock)", desc: "দৈনিক সংগ্রহ, ভালো ও ফাটা ডিমের হিসাব" },
      { key: "stock_fish", label: "মাছের স্টক (Fish Stock)", desc: "পুকুরভিত্তিক মাছের জীবন্ত মজুদ ও সাইজ" },
      { key: "stock_feed", label: "ফিডের স্টক (Feed Stock)", desc: "খাদ্যের বস্তা ও কেজিভিত্তিক মজুদ" },
      { key: "stock_chicken", label: "মুরগির স্টক (Chicken Stock)", desc: "শেডভিত্তিক বড়, মাঝারি ও বাচ্চার স্টক" },
    ],
  },
  { key: "medications", label: "ওষুধ ও ভ্যাকসিন (Medications & Vaccines)", desc: "টিকা সূচি, ডোজ ও ভ্যাকসিনের স্টক" },
  { key: "expenses", label: "খরচসমূহ (Expenses)", desc: "দৈনিক পরিচালন ও বিবিধ খামারের খরচ" },
  {
    key: "reports",
    label: "রিপোর্ট ও অ্যানালিটিক্স (Reports)",
    desc: "ব্যবসায়িক বিশ্লেষণ ও আর্থিক বিবরণী",
    submenus: [
      { key: "reports_income_expense", label: "আয় ও ব্যয় (Income & Expenses)", desc: "সার্বিক লাভ-ক্ষতি ও আয়-ব্যয়ের হিসাব" },
      { key: "reports_sales", label: "বিক্রয় রিপোর্ট (Sales Report)", desc: "দৈনিক ও তারিখভিত্তিক বিক্রয় বিবরণী" },
      { key: "reports_ledger", label: "দৈনিক লেজার (Daily Ledger)", desc: "গ্রাহক ও ভেন্ডর লেজার হিসাব" },
    ],
  },
  {
    key: "settings",
    label: "সেটিংস মডিউল (Settings)",
    desc: "সিস্টেম ও অ্যাকাউন্ট কনফিগারেশন",
    submenus: [
      { key: "settings_users", label: "ইউজার ও রোল (Users & Roles)", desc: "ব্যবহারকারী তৈরি ও পারমিশন নিয়ন্ত্রণ" },
      { key: "settings_profile", label: "প্রোফাইল (Profile)", desc: "ব্যবহারকারীর নিজস্ব প্রোফাইল ও পাসওয়ার্ড" },
    ],
  },
];

export const DEFAULT_PERMISSIONS: Record<string, boolean> = {
  dashboard: true,
  "sales-portal": true,
  purchases: true,
  poultry: true,
  fish: true,
  suppliers: true,
  customers: true,
  memo: true,
  stock: true,
  stock_eggs: true,
  stock_fish: true,
  stock_feed: true,
  stock_chicken: true,
  medications: true,
  expenses: true,
  reports: true,
  reports_income_expense: true,
  reports_sales: true,
  reports_ledger: true,
  settings: true,
  settings_users: true,
  settings_profile: true,
};

export const ROLE_PRESETS: Record<SystemRole, Record<string, boolean>> = {
  admin: {
    dashboard: true,
    "sales-portal": true,
    purchases: true,
    poultry: true,
    fish: true,
    suppliers: true,
    customers: true,
    memo: true,
    stock: true,
    stock_eggs: true,
    stock_fish: true,
    stock_feed: true,
    stock_chicken: true,
    medications: true,
    expenses: true,
    reports: true,
    reports_income_expense: true,
    reports_sales: true,
    reports_ledger: true,
    settings: true,
    settings_users: true,
    settings_profile: true,
  },
  manager: {
    dashboard: true,
    "sales-portal": true,
    purchases: true,
    poultry: true,
    fish: true,
    suppliers: true,
    customers: true,
    memo: true,
    stock: true,
    stock_eggs: true,
    stock_fish: true,
    stock_feed: true,
    stock_chicken: true,
    medications: true,
    expenses: true,
    reports: true,
    reports_income_expense: true,
    reports_sales: true,
    reports_ledger: true,
    settings: true,
    settings_users: false,
    settings_profile: true,
  },
  staff: {
    dashboard: true,
    "sales-portal": true,
    purchases: false,
    poultry: true,
    fish: true,
    suppliers: false,
    customers: true,
    memo: true,
    stock: true,
    stock_eggs: true,
    stock_fish: true,
    stock_feed: true,
    stock_chicken: true,
    medications: true,
    expenses: true,
    reports: false,
    reports_income_expense: false,
    reports_sales: false,
    reports_ledger: false,
    settings: false,
    settings_users: false,
    settings_profile: true,
  },
};
