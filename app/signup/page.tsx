import type { Metadata } from "next";
import SignupForm from "./signup-form";

export const metadata: Metadata = {
  title: "User Registration | Arafat Poultry & Fisheries",
  description: "Create an account for Arafat Poultry & Fisheries Management System",
  robots: {
    index: false,
    follow: false,
  },
};

export default function SignupPage() {
  return <SignupForm />;
}
