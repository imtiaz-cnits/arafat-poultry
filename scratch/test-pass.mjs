import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.users.findFirst({ where: { email: "admin@gmail.com" } });
  console.log("Admin email:", admin?.email);
  console.log("Admin hash:", admin?.password);
  
  const passwordsToTest = ["admin123", "123456", "12345678", "password", "admin", "admin@123", "arafat123", "arafat"];
  for (const p of passwordsToTest) {
    const isMatch = await bcrypt.compare(p, admin.password);
    console.log(`Password "${p}": ${isMatch ? "MATCH!" : "No"}`);
  }

  await prisma.$disconnect();
}

main().catch(console.error);
