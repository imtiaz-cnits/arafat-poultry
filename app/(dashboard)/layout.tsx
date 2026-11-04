"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";
import { Footer } from "@/components/footer";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("sidebar_collapsed");
      if (saved !== null) {
        setIsCollapsed(saved === "true");
      }
    } catch {
      // ignore
    }
  }, []);

  const handleToggleSidebar = () => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setSidebarOpen((prev) => !prev);
    } else {
      setIsCollapsed((prev) => {
        const next = !prev;
        try {
          localStorage.setItem("sidebar_collapsed", String(next));
        } catch {
          // ignore
        }
        return next;
      });
    }
  };

  const pathname = usePathname();
  const isSalesPortal =
    pathname === "/sales-portal" ||
    pathname?.startsWith("/sales-portal/") ||
    pathname === "/pos" ||
    pathname?.startsWith("/pos/");

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-[#0b0f19] transition-colors">
      {/* Sidebar: Expanded (195px) or Collapsed (70px) + Mobile Drawer */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => {
          setIsCollapsed((prev) => {
            const next = !prev;
            try {
              localStorage.setItem("sidebar_collapsed", String(next));
            } catch {
              // ignore
            }
            return next;
          });
        }}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
          isCollapsed ? "lg:ml-[70px]" : "lg:ml-[195px]"
        }`}
      >
        {/* Sticky Topbar */}
        <Topbar onToggleSidebar={handleToggleSidebar} />

        {/* Page Content Viewport */}
        <main
          className={`flex-1 transition-all ${
            isSalesPortal
              ? "p-2.5 sm:p-3.5 lg:p-4 overflow-y-auto lg:overflow-hidden flex flex-col min-h-0 lg:h-[calc(100vh-60px)] lg:max-h-[calc(100vh-60px)]"
              : "p-2.5 sm:p-4 md:p-6"
          }`}
        >
          {children}
        </main>

        {/* Global Footer */}
        <Footer />
      </div>
    </div>
  );
}
