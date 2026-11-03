import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

const CACHE_KEY = "medication_schedules_v1";

const DEFAULT_SCHEDULES = [
  {
    id: 1,
    medicine_name: "রানিখেত ভ্যাকসিন (RDV / Lasota)",
    target_type: "POULTRY",
    target_name: "শেড #১ (লেয়ার শেড)",
    disease: "রানিখেত রোগ প্রতিরোধ",
    dosage: "১ ফোঁটা চোখে অথবা প্রতি ১০০০ পাখির জন্য ১০ লিটার ঠান্ডা পানিতে",
    frequency: "MONTHLY", // DAILY, WEEKLY, MONTHLY, YEARLY
    time_of_day: "MORNING", // MORNING, NOON, AFTERNOON, NIGHT
    status: "SCHEDULED",
    last_applied_date: "2026-10-15",
    next_due_date: "2026-11-15",
    note: "ভ্যাকসিন তৈরির ২ ঘণ্টার মধ্যে পানি শেষ করতে হবে। ক্লোরিনমুক্ত পানিতে মিশাতে হবে।",
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    medicine_name: "গামবোরো ভ্যাকসিন (IBDV Intermediate Plus)",
    target_type: "POULTRY",
    target_name: "শেড #৩ (বাচ্চা শেড)",
    disease: "গামবোরো রোগ প্রতিরোধ",
    dosage: "১ ফোঁটা চোখে ড্রপার দিয়ে",
    frequency: "WEEKLY",
    time_of_day: "MORNING",
    status: "SCHEDULED",
    last_applied_date: "2026-10-25",
    next_due_date: "2026-11-05",
    note: "বাচ্চার ১০ম ও ১৮তম দিনে বুস্টার ডোজ প্রয়োগ করতে হবে।",
    created_at: new Date().toISOString(),
  },
  {
    id: 3,
    medicine_name: "ভিটামিন ও অ্যামাইনো এসিড (ACI Vitamino Plus)",
    target_type: "POULTRY",
    target_name: "সকল শেড (মুরগি ও বাচ্চা)",
    disease: "গ্রোথ ও ডিম উৎপাদন বৃদ্ধি",
    dosage: "১ মিলি প্রতি ২ লিটার খাবার পানিতে",
    frequency: "DAILY",
    time_of_day: "NOON",
    status: "ACTIVE",
    last_applied_date: "2026-11-03",
    next_due_date: "2026-11-04",
    note: "দুপুরের নরমাল খাবার পানির সাথে ৫-৬ ঘণ্টা খেতে দিতে হবে।",
    created_at: new Date().toISOString(),
  },
  {
    id: 4,
    medicine_name: "পুকুর শোধন চুন ও জিওলাইট (Agro Lime & Zeolite)",
    target_type: "FISH",
    target_name: "পুকুর #১ ও #২ (তেলাপিয়া ও রুই)",
    disease: "পানির পিএইচ (pH) নিয়ন্ত্রণ ও গ্যাস শোধন",
    dosage: "১ কেজি চুন + ৫০০ গ্রাম জিওলাইট প্রতি শতাংশে",
    frequency: "MONTHLY",
    time_of_day: "MORNING",
    status: "SCHEDULED",
    last_applied_date: "2026-10-10",
    next_due_date: "2026-11-10",
    note: "চুন ভিজিয়ে ঠান্ডা করে সকাল ৯টায় পুরো পুকুরে ছিটিয়ে দিতে হবে।",
    created_at: new Date().toISOString(),
  },
  {
    id: 5,
    medicine_name: "অক্সিজেন পাউডার / অক্সিফ্লো (Oxyflow)",
    target_type: "FISH",
    target_name: "পুকুর #১ (লাইভ ফিশ স্টক)",
    disease: "পানিতে তাৎক্ষণিক দ্রবীভূত অক্সিজেন বৃদ্ধি",
    dosage: "২০০ গ্রাম প্রতি শতাংশে",
    frequency: "DAILY",
    time_of_day: "NIGHT",
    status: "ACTIVE",
    last_applied_date: "2026-11-02",
    next_due_date: "2026-11-03",
    note: "মেঘলা দিনে বা ভোররাতে মাছ ভেসে উঠলে প্রয়োগ করতে হবে।",
    created_at: new Date().toISOString(),
  },
  {
    id: 6,
    medicine_name: "কৃমিনাশক ও লিভার টনিক (Levamisole + Livavit)",
    target_type: "POULTRY",
    target_name: "শেড #১ ও #২ (প্রাপ্তবয়স্ক লেয়ার)",
    disease: "কৃমি দমন ও লিভার সুরক্ষা",
    dosage: "২ মিলি প্রতি লিটার পানিতে",
    frequency: "MONTHLY",
    time_of_day: "AFTERNOON",
    status: "SCHEDULED",
    last_applied_date: "2026-10-05",
    next_due_date: "2026-11-05",
    note: "কৃমিনাশক দেওয়ার পরদিন টানা ৩ দিন লিভার টনিক দিতে হবে।",
    created_at: new Date().toISOString(),
  },
];

async function getStoredSchedules(): Promise<any[]> {
  try {
    const row = await prisma.cache.findUnique({
      where: { key: CACHE_KEY },
    });
    if (row && row.value) {
      return JSON.parse(row.value);
    }
  } catch (err) {
    console.error("Failed to read medication cache:", err);
  }

  // Seed default if not existing
  try {
    await prisma.cache.upsert({
      where: { key: CACHE_KEY },
      create: {
        key: CACHE_KEY,
        value: JSON.stringify(DEFAULT_SCHEDULES),
        expiration: 2147483647,
      },
      update: {},
    });
  } catch (e) {}

  return DEFAULT_SCHEDULES;
}

async function saveSchedules(schedules: any[]) {
  await prisma.cache.upsert({
    where: { key: CACHE_KEY },
    create: {
      key: CACHE_KEY,
      value: JSON.stringify(schedules),
      expiration: 2147483647,
    },
    update: {
      value: JSON.stringify(schedules),
      expiration: 2147483647,
    },
  });
}

// GET: List all medication schedules
export async function GET(req: NextRequest) {
  try {
    const list = await getStoredSchedules();
    return NextResponse.json({
      status: "success",
      data: list,
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: "fail", message: error?.message || "Failed to load medications" },
      { status: 500 }
    );
  }
}

// POST: Add new medication schedule
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      medicine_name,
      target_type,
      target_name,
      disease,
      dosage,
      frequency,
      time_of_day,
      last_applied_date,
      next_due_date,
      note,
    } = body;

    if (!medicine_name || !target_name || !dosage) {
      return NextResponse.json(
        { status: "fail", message: "ওষুধের নাম, শেড/পুকুর এবং ডোজ আবশ্যক" },
        { status: 400 }
      );
    }

    const currentList = await getStoredSchedules();
    const newId = currentList.length > 0 ? Math.max(...currentList.map((x: any) => x.id || 0)) + 1 : 1;

    const newRecord = {
      id: newId,
      medicine_name: String(medicine_name).trim(),
      target_type: target_type || "POULTRY",
      target_name: String(target_name).trim(),
      disease: disease ? String(disease).trim() : "নিয়মিত পরিচর্যা ও রোগ প্রতিরোধ",
      dosage: String(dosage).trim(),
      frequency: frequency || "DAILY",
      time_of_day: time_of_day || "MORNING",
      status: "ACTIVE",
      last_applied_date: last_applied_date || new Date().toISOString().split("T")[0],
      next_due_date: next_due_date || new Date().toISOString().split("T")[0],
      note: note ? String(note).trim() : "",
      created_at: new Date().toISOString(),
    };

    currentList.unshift(newRecord);
    await saveSchedules(currentList);

    return NextResponse.json({
      status: "success",
      message: "ওষুধ ও ভ্যাকসিন শিডিউল সফলভাবে সংরক্ষিত হয়েছে",
      data: newRecord,
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: "fail", message: error?.message || "Failed to record medication" },
      { status: 500 }
    );
  }
}

// DELETE: Delete a schedule
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = Number(searchParams.get("id"));
    if (!id) {
      return NextResponse.json({ status: "fail", message: "ID is required" }, { status: 400 });
    }

    let currentList = await getStoredSchedules();
    currentList = currentList.filter((x: any) => Number(x.id) !== id);
    await saveSchedules(currentList);

    return NextResponse.json({
      status: "success",
      message: "ওষুধ শিডিউল সফলভাবে মুছে ফেলা হয়েছে",
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: "fail", message: error?.message || "Failed to delete" },
      { status: 500 }
    );
  }
}

