import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const hashedPassword = await bcrypt.hash("admin123", 10);

  // Check if admin already exists
  const existingAdmin = await prisma.users.findFirst({
    where: { email: "admin@gmail.com" },
  });

  if (!existingAdmin) {
    const admin = await prisma.users.create({
      data: {
        name: "Admin",
        email: "admin@gmail.com",
        mobile: "01975-703216",
        password: hashedPassword,
        role: "admin",
        status: "approved",
        otp: "000000",
        permissions: JSON.stringify({
          pos: true,
          products: true,
          purchases: true,
          invoices: true,
          customers: true,
          suppliers: true,
          expenses: true,
          reports: true,
          users: true,
        }),
      },
    });
    console.log("Admin user created:", admin.email);
  } else {
    // Update password to admin123
    await prisma.users.update({
      where: { id: existingAdmin.id },
      data: {
        password: hashedPassword,
        status: "approved",
      },
    });
    console.log("Admin user updated with password 'admin123'");
  }

  // Create default Brand, Category, Unit if not present
  const adminUser = await prisma.users.findFirst({ where: { email: "admin@gmail.com" } });
  if (adminUser) {
    const brandCount = await prisma.brands.count();
    if (brandCount === 0) {
      await prisma.brands.create({
        data: {
          name: "General",
          status: "active",
          user_id: adminUser.id,
        },
      });
      console.log("Default brand created");
    }

    const catCount = await prisma.categories.count();
    if (catCount === 0) {
      await prisma.categories.create({
        data: {
          category_name: "General",
          status: "active",
          user_id: adminUser.id,
        },
      });
      console.log("Default category created");
    }

    const unitCount = await prisma.units.count();
    if (unitCount === 0) {
      await prisma.units.create({
        data: {
          unit_name: "Pcs",
          status: "active",
          user_id: adminUser.id,
        },
      });
      console.log("Default unit created");
    }

    // Seed Agricultural & Commercial Units if not present
    const standardUnits = ["Kg", "Bag", "Tray", "Dozen", "Gram", "Decimal"];
    for (const u of standardUnits) {
      const exists = await prisma.units.findFirst({ where: { unit_name: u } });
      if (!exists) {
        await prisma.units.create({
          data: {
            unit_name: u,
            status: "active",
            user_id: adminUser.id,
          },
        });
        console.log(`Unit created: ${u}`);
      }
    }

    // Seed Business Units (Egg, Fish, Feed, General)
    const businessUnits = [
      { code: "EGG", name: "ডিম উৎপাদন ও খামার (Egg Production & Sales)" },
      { code: "FISH", name: "পুকুরে মাছ চাষ (Own-Pond Fish Farming)" },
      { code: "FEED", name: "পোল্ট্রি ও মাছের খাদ্য ব্যবসা (Poultry Feed Trading)" },
      { code: "GENERAL", name: "সাধারণ ও কেন্দ্রীয় পরিচালনা (General Operations)" },
    ];

    for (const bu of businessUnits) {
      const exists = await prisma.business_units.findUnique({ where: { code: bu.code } });
      if (!exists) {
        await prisma.business_units.create({
          data: {
            code: bu.code,
            name: bu.name,
            status: "active",
            user_id: adminUser.id,
          },
        });
        console.log(`Business Unit created: ${bu.code} - ${bu.name}`);
      }
    }

    // Seed Core Financial Accounts
    const defaultAccounts = [
      { account_name: "নগদ ক্যাশ (Main Cash)", account_type: "CASH", balance: 0.00 },
      { account_name: "বিকাশ অ্যাকাউন্ট (bKash)", account_type: "MFS", balance: 0.00 },
      { account_name: "নগদ অ্যাকাউন্ট (Nagad)", account_type: "MFS", balance: 0.00 },
      { account_name: "ব্যাংক হিসাব (Islami Bank A/C)", account_type: "BANK", balance: 0.00 },
    ];

    for (const acc of defaultAccounts) {
      const exists = await prisma.financial_accounts.findFirst({
        where: { account_name: acc.account_name },
      });
      if (!exists) {
        await prisma.financial_accounts.create({
          data: {
            account_name: acc.account_name,
            account_type: acc.account_type,
            balance: acc.balance,
            status: "active",
            user_id: adminUser.id,
          },
        });
        console.log(`Financial Account created: ${acc.account_name}`);
      }
    }

    // Seed Standard Unit Conversions (e.g. Tray -> Pcs, Dozen -> Pcs, Bag -> Kg)
    const pcsUnit = await prisma.units.findFirst({ where: { unit_name: "Pcs" } });
    const dozenUnit = await prisma.units.findFirst({ where: { unit_name: "Dozen" } });
    const trayUnit = await prisma.units.findFirst({ where: { unit_name: "Tray" } });
    const kgUnit = await prisma.units.findFirst({ where: { unit_name: "Kg" } });
    const gramUnit = await prisma.units.findFirst({ where: { unit_name: "Gram" } });

    if (pcsUnit && dozenUnit) {
      const exists = await prisma.unit_conversions.findFirst({
        where: { from_unit_id: dozenUnit.id, to_unit_id: pcsUnit.id },
      });
      if (!exists) {
        await prisma.unit_conversions.create({
          data: {
            from_unit_id: dozenUnit.id,
            to_unit_id: pcsUnit.id,
            conversion_rate: 12.0000,
            operator: "MULTIPLY",
            note: "1 Dozen = 12 Pieces",
            user_id: adminUser.id,
          },
        });
        console.log("Unit conversion created: 1 Dozen = 12 Pieces");
      }
    }

    if (pcsUnit && trayUnit) {
      const exists = await prisma.unit_conversions.findFirst({
        where: { from_unit_id: trayUnit.id, to_unit_id: pcsUnit.id },
      });
      if (!exists) {
        await prisma.unit_conversions.create({
          data: {
            from_unit_id: trayUnit.id,
            to_unit_id: pcsUnit.id,
            conversion_rate: 30.0000,
            operator: "MULTIPLY",
            note: "1 Standard Tray = 30 Pieces (Configurable)",
            user_id: adminUser.id,
          },
        });
        console.log("Unit conversion created: 1 Tray = 30 Pieces");
      }
    }

    if (kgUnit && gramUnit) {
      const exists = await prisma.unit_conversions.findFirst({
        where: { from_unit_id: kgUnit.id, to_unit_id: gramUnit.id },
      });
      if (!exists) {
        await prisma.unit_conversions.create({
          data: {
            from_unit_id: kgUnit.id,
            to_unit_id: gramUnit.id,
            conversion_rate: 1000.0000,
            operator: "MULTIPLY",
            note: "1 Kilogram = 1000 Grams",
            user_id: adminUser.id,
          },
        });
        console.log("Unit conversion created: 1 Kg = 1000 Grams");
      }
    }

    // Seed Default Fish Species
    const defaultSpecies = [
      { species_name: "রুই (Rohu)", scientific_name: "Labeo rohita", default_culture_days: 180 },
      { species_name: "কাতলা (Catla)", scientific_name: "Gibelion catla", default_culture_days: 210 },
      { species_name: "পাঙ্গাশ (Pangas)", scientific_name: "Pangasianodon hypophthalmus", default_culture_days: 150 },
      { species_name: "তেলাপিয়া (Tilapia)", scientific_name: "Oreochromis niloticus", default_culture_days: 120 },
    ];

    for (const spec of defaultSpecies) {
      await prisma.fish_species.upsert({
        where: { species_name: spec.species_name },
        update: {},
        create: spec,
      });
    }
    console.log("Fish species seeded successfully.");

    // Seed Default Fish Pond
    const defaultPond = await prisma.fish_ponds.findFirst({ where: { pond_code: "POND-01" } });
    if (!defaultPond) {
      await prisma.fish_ponds.create({
        data: {
          pond_code: "POND-01",
          pond_name: "পুকুর ১ (Main Aquaculture Pond)",
          area_decimal: 50.00,
          water_depth_feet: 6.00,
          location: "North Farm Zone",
          status: "ACTIVE",
          user_id: adminUser.id,
        },
      });
      console.log("Default Fish Pond POND-01 seeded.");
    }
  }

  console.log("Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
