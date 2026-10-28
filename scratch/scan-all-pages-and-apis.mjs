const pagesToTest = [
  "/dashboard",
  "/pos",
  "/inventory",
  "/products",
  "/categories",
  "/brands",
  "/feed",
  "/eggs",
  "/fish",
  "/invoices",
  "/returns",
  "/purchases",
  "/purchase-returns",
  "/suppliers",
  "/supplier-dues",
  "/customers",
  "/customer-dues",
  "/expenses",
  "/expense-types",
  "/staff",
  "/reports/accounting",
  "/reports/income-expense",
  "/reports/sales",
  "/reports/daily-ledger",
  "/reports/stock-out"
];

const apisToTest = [
  "/api/dashboard/stats",
  "/api/products",
  "/api/categories",
  "/api/brands",
  "/api/inventory",
  "/api/feed/internal-issue",
  "/api/egg/flocks",
  "/api/egg/collections",
  "/api/fish",
  "/api/fish/ponds",
  "/api/fish/batches",
  "/api/orders",
  "/api/invoices",
  "/api/returns",
  "/api/purchases",
  "/api/suppliers",
  "/api/suppliers/due-collection",
  "/api/customers",
  "/api/customers/due-collection",
  "/api/expenses",
  "/api/expense-types",
  "/api/staff",
  "/api/accounting/pnl",
  "/api/accounting/receivables",
  "/api/accounting/payables"
];

async function scan() {
  console.log("=== SCANNING PAGES ===");
  for (const page of pagesToTest) {
    try {
      const res = await fetch(`http://localhost:3000${page}`);
      console.log(`PAGE [${res.status}] ${page}`);
    } catch (err) {
      console.error(`PAGE [ERROR] ${page}:`, err.message);
    }
  }

  console.log("\n=== SCANNING APIS ===");
  for (const api of apisToTest) {
    try {
      const res = await fetch(`http://localhost:3000${api}`);
      const json = await res.json().catch(() => null);
      const isOk = res.status === 200 && json?.status !== "fail";
      console.log(`API [${res.status}] ${api}: ${isOk ? "OK" : "FAILED (" + (json?.message || "status " + json?.status) + ")"}`);
    } catch (err) {
      console.error(`API [ERROR] ${api}:`, err.message);
    }
  }
}

scan();
