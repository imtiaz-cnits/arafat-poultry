import { getFishFarmingDashboardData } from "../lib/fish-service.js";

async function main() {
  try {
    const data = await getFishFarmingDashboardData();
    console.log("Success! Data:", data ? Object.keys(data) : null);
  } catch (err) {
    console.error("Fish Dashboard Error:", err);
  }
}

main().catch(console.error);
