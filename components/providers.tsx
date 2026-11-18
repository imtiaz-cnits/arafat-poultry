"use client";

import React from "react";
import { ToastProvider } from "@/components/ui/toast";
import { ModalScrollLock } from "@/components/modal-scroll-lock";

// Suppress React 19 false-positive warning for theme initializer inline script in dev
if (typeof window !== "undefined") {
  const originalError = console.error;
  console.error = (...args: unknown[]) => {
    if (
      typeof args[0] === "string" &&
      args[0].includes("Encountered a script tag")
    ) {
      return;
    }
    originalError.apply(console, args);
  };
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <ModalScrollLock />
      {children}
    </ToastProvider>
  );
}
