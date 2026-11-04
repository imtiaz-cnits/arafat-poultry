"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Layers,
  Tag,
  Boxes,
  Truck,
  Users,
  Receipt,
  RotateCcw,
  Wallet,
  FileSpreadsheet,
  Settings,
  Barcode,
  ChevronRight,
  ChevronLeft,
  X,
  AlertTriangle,
  User,
  Egg,
  Fish,
  Scale,
  Activity,
} from "lucide-react";
import { useState, useEffect, useRef, useMemo } from "react";

interface NavSubItem {
  label: string;
  href: string;
  icon: any;
}

interface NavItem {
  id: string;
  label: string;
  href?: string;
  icon: any;
  children?: NavSubItem[];
}

export const NAV_ITEMS: NavItem[] = [
  {
    id: "dashboard",
    label: "ড্যাশবোর্ড",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    id: "sales-portal",
    label: "বিক্রয় পোর্টাল",
    href: "/sales-portal",
    icon: ShoppingCart,
  },
  {
    id: "purchases",
    label: "ক্রয়",
    href: "/purchases",
    icon: Truck,
  },
  {
    id: "poultry",
    label: "মুরগির হিসাব",
    href: "/chicken",
    icon: Egg,
  },
  {
    id: "fish",
    label: "মাছের হিসাব",
    href: "/fish",
    icon: Fish,
  },
  {
    id: "suppliers",
    label: "সরবরাহকারী",
    href: "/suppliers",
    icon: Users,
  },
  {
    id: "customers",
    label: "কাস্টমার",
    href: "/customers",
    icon: Users,
  },
  {
    id: "memo",
    label: "মেমো",
    href: "/invoices",
    icon: Receipt,
  },
  {
    id: "stock",
    label: "স্টক",
    icon: Package,
    children: [
      { label: "ডিমের স্টক", href: "/stock/eggs", icon: Egg },
      { label: "মাছের স্টক", href: "/stock/fish", icon: Fish },
      { label: "ফিডের স্টক", href: "/feed", icon: Boxes },
      { label: "মুরগির স্টক", href: "/stock/chicken", icon: Package },
    ],
  },
  {
    id: "medications",
    label: "ওষুধ ও ভ্যাকসিন",
    href: "/medications",
    icon: Activity,
  },
  {
    id: "expenses",
    label: "খরচসমূহ",
    href: "/expenses",
    icon: Wallet,
  },
  {
    id: "reports",
    label: "রিপোর্ট",
    icon: FileSpreadsheet,
    children: [
      { label: "আয় ও ব্যয়", href: "/reports/income-expense", icon: Wallet },
      { label: "বিক্রয় রিপোর্ট", href: "/reports/sales", icon: FileSpreadsheet },
      { label: "লেজার", href: "/reports/daily-ledger", icon: Scale },
    ],
  },
  {
    id: "settings",
    label: "সেটিংস",
    icon: Settings,
    children: [
      { label: "ইউজার ও রোল", href: "/users", icon: Users },
      { label: "প্রোফাইল", href: "/profile", icon: User },
    ],
  },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function Sidebar({
  isOpen,
  onClose,
  isCollapsed = false,
}: SidebarProps) {
  const pathname = usePathname();

  // Find active parent ID dynamically from current pathname
  const activeParentId = useMemo(() => {
    for (const item of NAV_ITEMS) {
      if (item.children) {
        if (
          item.children.some(
            (c) => pathname === c.href || pathname.startsWith(c.href + "/")
          )
        ) {
          return item.id;
        }
      }
    }
    return null;
  }, [pathname]);

  // Expanded Drilling navigation state
  const [drilledParent, setDrilledParent] = useState<string | null>(null);

  // Sync drilled parent on route change
  useEffect(() => {
    if (activeParentId) {
      setDrilledParent(activeParentId);
    } else {
      setDrilledParent(null);
    }
  }, [pathname, activeParentId]);

  // Collapsed Mode Flyout state
  const [hoveredFlyoutId, setHoveredFlyoutId] = useState<string | null>(null);
  const [pinnedFlyoutId, setPinnedFlyoutId] = useState<string | null>(null);
  const [flyoutTop, setFlyoutTop] = useState<number>(0);
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);
  const triggerRefs = useRef<{ [key: string]: HTMLElement | null }>({});

  // User Role & Permissions State
  const [userRole, setUserRole] = useState<string>("admin");
  const [userPermissions, setUserPermissions] = useState<Record<string, boolean> | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("user");
      if (stored) {
        const u = JSON.parse(stored);
        if (u.role) setUserRole(u.role);
        if (u.permissions) setUserPermissions(u.permissions);
      }
    } catch { }
  }, []);

  const hasAccess = (item: NavItem) => {
    if (userRole === "admin") return true;
    if (!userPermissions) return true;
    const permKeyMap: Record<string, string> = {
      dashboard: "dashboard",
      "sales-portal": "pos",
      pos: "pos",
      poultry: "products",
      fish: "products",
      stock: "products",
      memo: "pos",
      suppliers: "purchases",
      purchases: "purchases",
      customers: "customers",
      expenses: "expenses",
      reports: "reports",
      settings: "users",
    };
    const key = permKeyMap[item.id];
    if (!key) return true;
    return userPermissions[key] !== false;
  };

  // Close flyouts on outside click or Escape
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-flyout-container]")) {
        setPinnedFlyoutId(null);
        setHoveredFlyoutId(null);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setPinnedFlyoutId(null);
        setHoveredFlyoutId(null);
      }
    };

    document.addEventListener("click", handleGlobalClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("click", handleGlobalClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Compute smart vertical position for floating flyout
  const handleTriggerHover = (id: string) => {
    if (!isCollapsed) return;
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);

    const el = triggerRefs.current[id];
    if (el) {
      const rect = el.getBoundingClientRect();
      const parentItem = NAV_ITEMS.find((n) => n.id === id);
      const isSingle = !parentItem?.children || parentItem.children.length === 0;
      const childCount = parentItem?.children ? parentItem.children.length : 0;
      const flyoutHeight = isSingle ? 48 : (childCount * 36 + 60);
      let top = rect.top;

      if (top + flyoutHeight > window.innerHeight - 15) {
        top = Math.max(10, window.innerHeight - flyoutHeight - 15);
      }
      setFlyoutTop(top);
    }
    setHoveredFlyoutId(id);
  };

  const handleTriggerLeave = (id: string) => {
    if (!isCollapsed) return;
    hoverTimerRef.current = setTimeout(() => {
      setHoveredFlyoutId((cur) => (cur === id ? null : cur));
    }, 160);
  };

  const handleFlyoutEnter = () => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
  };

  const handleFlyoutLeave = (id: string) => {
    hoverTimerRef.current = setTimeout(() => {
      setHoveredFlyoutId((cur) => (cur === id ? null : cur));
    }, 160);
  };

  const handleTriggerClick = (id: string) => {
    if (isCollapsed) {
      setPinnedFlyoutId((cur) => (cur === id ? null : id));
      handleTriggerHover(id);
    } else {
      setDrilledParent(id);
    }
  };

  // Check if a path is active
  const isActive = (path?: string) => path && pathname === path;

  // Active flyout menu object
  const activeFlyoutMenuId = pinnedFlyoutId || hoveredFlyoutId;
  const activeFlyoutItem = NAV_ITEMS.find((n) => n.id === activeFlyoutMenuId);

  // Main scrollable items (Dashboard through Reports filtered by access)
  const scrollableItems = useMemo(() => {
    return NAV_ITEMS.filter((item) => item.id !== "settings" && hasAccess(item));
  }, [userRole, userPermissions]);
  const settingsItem = NAV_ITEMS.find((item) => item.id === "settings")!;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          data-sidebar-backdrop="true" className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Main Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 bg-gradient-to-b from-[#14532d] via-[#166534] to-[#0f3d20] text-white flex flex-col transition-all duration-300 ease-in-out border-r border-white/10 shadow-2xl select-none ${isCollapsed
          ? "w-[70px] -translate-x-full lg:translate-x-0"
          : "w-[195px] " +
          (isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0")
          }`}
      >
        {/* Brand Header */}
        <div className="h-[60px] px-3 flex items-center justify-between border-b border-white/10 shrink-0">
          <Link
            href="/dashboard"
            className={`flex items-center gap-2 ${isCollapsed ? "justify-center w-full" : ""
              }`}
          >
            <div className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0 shadow-xs overflow-hidden">
              <Image
                src="/logo1.png"
                alt="Arafat Poultry & Fisheries"
                width={28}
                height={28}
                className="w-full h-full object-contain rounded-md"
                priority
              />
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <h1 className="text-[11.5px] font-black tracking-wider text-white leading-none truncate">
                  ARAFAT POULTRY
                </h1>
                <p className="text-[9.5px] text-emerald-200/90 tracking-tight mt-1 font-medium truncate">
                  Poultry &amp; Fisheries
                </p>
              </div>
            )}
          </Link>
          {!isCollapsed && (
            <button
              onClick={onClose}
              className="lg:hidden p-1 text-emerald-200 hover:text-white rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* ============================================================ */}
        {/* EXPANDED VIEW: Drilling Navigation Panels                    */}
        {/* ============================================================ */}
        {!isCollapsed && (
          <div className="relative flex-1 overflow-hidden w-full">
            {/* 1. Main Navigation Panel (Slides Left when drilled) */}
            <div
              className={`absolute inset-0 w-full h-full overflow-y-auto px-2 py-2 space-y-1 text-[13px] transition-transform duration-300 ease-in-out sidebar-scrollbar ${drilledParent !== null
                ? "-translate-x-full pointer-events-none"
                : "translate-x-0 pointer-events-auto"
                }`}
            >
              {scrollableItems.map((item) => {
                const Icon = item.icon;
                const isSingleActive = isActive(item.href);
                const isParentActive = activeParentId === item.id;

                // A. Menu with children (Drilldown trigger)
                if (item.children && item.children.length > 0) {
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleTriggerClick(item.id)}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-[16px] font-semibold transition-all duration-200 cursor-pointer group text-start ${isParentActive
                        ? "bg-white/15 text-white font-bold border-l-[3px] border-white shadow-xs"
                        : "text-emerald-100 hover:bg-white/10 hover:text-white"
                        }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Icon className="w-4 h-4 shrink-0 opacity-90 group-hover:scale-110 transition-transform" />
                        <span className="truncate">{item.label}</span>
                      </div>
                      <span className="shrink-0 w-4.5 h-4.5 rounded-md bg-white/10 flex items-center justify-center text-white/70 group-hover:text-white group-hover:bg-white/20 transition-all">
                        <ChevronRight className="w-3 h-3" />
                      </span>
                    </button>
                  );
                }

                // B. Single Item (Dashboard, Sales Portal, Customers, etc.)
                return (
                  <Link
                    key={item.id}
                    href={item.href || "#"}
                    onClick={() => {
                      if (isOpen) onClose();
                    }}
                    className={`flex items-center justify-between px-2.5 py-2 rounded-xl text-[16px] font-semibold transition-all ${isSingleActive
                      ? "bg-white text-emerald-950 shadow-md font-bold"
                      : "text-emerald-100 hover:bg-white/10 hover:text-white"
                      }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Icon className="w-4 h-4 shrink-0 opacity-90" />
                      <span className="truncate">{item.label}</span>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* 2. Submenu Drilldown Panels (Slide In from Right) */}
            {NAV_ITEMS.filter((item) => item.children).map((parent) => (
              <div
                key={parent.id}
                className={`absolute inset-0 w-full h-full overflow-y-auto px-2 py-2.5 space-y-1 text-xs transition-transform duration-300 ease-in-out sidebar-scrollbar ${drilledParent === parent.id
                  ? "translate-x-0 pointer-events-auto"
                  : "translate-x-full pointer-events-none"
                  }`}
              >
                {/* Back Button matching MARSS reference layout */}
                <button
                  type="button"
                  onClick={() => setDrilledParent(null)}
                  className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-emerald-100 bg-white/10 hover:bg-white/20 border border-white/15 font-bold text-[16px] transition-all shadow-xs mb-2 cursor-pointer group"
                >
                  <ChevronLeft className="w-4 h-4 text-emerald-200 group-hover:text-white transition-transform group-hover:-translate-x-0.5" />
                  <span className="truncate">{parent.label}</span>
                </button>

                {/* Submenu Item List */}
                <div className="space-y-1 pt-0.5">
                  {parent.children?.map((child) => {
                    const ChildIcon = child.icon;
                    const isChildActive = isActive(child.href);
                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={() => {
                          if (isOpen) onClose();
                        }}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-[16px] transition-all ${isChildActive
                          ? "bg-white text-emerald-950 font-bold shadow-md"
                          : "text-emerald-100/90 hover:text-white hover:bg-white/10"
                          }`}
                      >
                        <ChildIcon className="w-3.5 h-3.5 shrink-0 opacity-80" />
                        <span className="truncate">{child.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ============================================================ */}
        {/* COLLAPSED VIEW: Icon Rail (No native tooltips, uses flyout)  */}
        {/* ============================================================ */}
        {isCollapsed && (
          <div
            className="flex-1 overflow-y-auto px-2 py-3 space-y-2 scrollbar-none"
            data-flyout-container
          >
            {scrollableItems.map((item) => {
              const Icon = item.icon;
              const hasSubmenu = Boolean(item.children && item.children.length > 0);
              const isParentActive = activeParentId === item.id;
              const isSingleActive = isActive(item.href);
              const isFlyoutOpen = activeFlyoutMenuId === item.id;

              return (
                <div
                  key={item.id}
                  ref={(el) => {
                    triggerRefs.current[item.id] = el;
                  }}
                  onMouseEnter={() => handleTriggerHover(item.id)}
                  onMouseLeave={() => handleTriggerLeave(item.id)}
                  className="relative flex justify-center"
                >
                  {hasSubmenu ? (
                    // Menu with Submenu -> Trigger button
                    <button
                      type="button"
                      onClick={() => handleTriggerClick(item.id)}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${isFlyoutOpen || isParentActive
                        ? "bg-white text-emerald-950 shadow-md font-bold"
                        : "text-emerald-100 hover:bg-white/15 hover:text-white"
                        }`}
                    >
                      <Icon className="w-5 h-5 shrink-0" />
                    </button>
                  ) : (
                    // Single Item (Dashboard, POS, Customers) -> Direct link
                    <Link
                      href={item.href || "#"}
                      onClick={() => {
                        if (isOpen) onClose();
                      }}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isSingleActive
                        ? "bg-white text-emerald-950 shadow-md font-bold"
                        : "text-emerald-100 hover:bg-white/15 hover:text-white"
                        }`}
                    >
                      <Icon className="w-5 h-5 shrink-0" />
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ============================================================ */}
        {/* SIDEBAR FOOTER: Settings Menu Only (No version text)         */}
        {/* ============================================================ */}
        <div
          data-flyout-container
          className="p-2 border-t border-white/10 shrink-0"
        >
          <div
            ref={(el) => {
              triggerRefs.current["settings"] = el;
            }}
            onMouseEnter={() => handleTriggerHover("settings")}
            onMouseLeave={() => handleTriggerLeave("settings")}
            className="relative"
          >
            {settingsItem.children && settingsItem.children.length > 0 ? (
              <button
                type="button"
                onClick={() => handleTriggerClick("settings")}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-semibold transition-all text-xs cursor-pointer ${activeParentId === "settings" || pathname === "/users" || pathname === "/profile"
                  ? "bg-white/15 text-white font-bold border-l-[3px] border-white shadow-xs"
                  : "text-emerald-100 hover:bg-white/10 hover:text-white"
                  } ${isCollapsed ? "justify-center w-10 h-10 mx-auto px-0" : "w-full text-start"}`}
              >
                <Settings className={`shrink-0 ${isCollapsed ? "w-5 h-5" : "w-4 h-4 opacity-90"}`} />
                {!isCollapsed && <span className="truncate">{settingsItem.label}</span>}
                {!isCollapsed && (
                  <span className="ml-auto w-5 h-5 rounded-md bg-white/10 flex items-center justify-center text-white/70">
                    <ChevronRight className="w-3 h-3" />
                  </span>
                )}
              </button>
            ) : (
              <Link
                href={settingsItem.href || "/users"}
                onClick={() => {
                  if (isOpen) onClose();
                }}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-semibold transition-all text-xs cursor-pointer ${isActive(settingsItem.href)
                  ? "bg-white text-emerald-950 shadow-md font-bold"
                  : "text-emerald-100 hover:bg-white/10 hover:text-white"
                  } ${isCollapsed ? "justify-center w-10 h-10 mx-auto px-0" : "w-full"}`}
              >
                <Settings className={`shrink-0 ${isCollapsed ? "w-5 h-5" : "w-4 h-4 opacity-90"}`} />
                {!isCollapsed && <span>{settingsItem.label}</span>}
              </Link>
            )}
          </div>
        </div>
      </aside>

      {/* ============================================================ */}
      {/* FLOATING DRILLING FLYOUT / TOOLTIP POPOVER (For Collapsed)   */}
      {/* ============================================================ */}
      {isCollapsed && activeFlyoutItem && (
        <div
          data-flyout-container
          style={{ top: flyoutTop }}
          onMouseEnter={handleFlyoutEnter}
          onMouseLeave={() => handleFlyoutLeave(activeFlyoutItem.id)}
          className={`fixed left-[72px] z-[99999] p-2 rounded-2xl bg-gradient-to-b from-[#14532d] via-[#166534] to-[#0f3d20] dark:from-[#0a2312] dark:via-[#07190d] dark:to-[#030d06] border border-emerald-500/35 shadow-2xl shadow-black/60 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150 ${activeFlyoutItem.children && activeFlyoutItem.children.length > 0
            ? "w-56"
            : "min-w-[150px] w-auto max-w-[210px]"
            }`}
        >
          {/* Invisible Hover Bridge between Sidebar rail and Popover */}
          <div className="absolute -left-3 top-0 bottom-0 w-3.5 pointer-events-auto" />

          {/* Caret Pointer Arrow pointing back to icon */}
          <div className="absolute -left-1.5 top-3.5 w-3 h-3 bg-[#14532d] dark:bg-[#0a2312] border-l border-b border-emerald-500/35 rotate-45 pointer-events-none" />

          {/* If item has children: Render Full Submenu List */}
          {activeFlyoutItem.children && activeFlyoutItem.children.length > 0 ? (
            <>
              {/* Flyout Header */}
              <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-emerald-400/25 mb-1.5">
                <span className="text-[10px] font-bold tracking-wider text-emerald-200 uppercase flex items-center gap-1.5 truncate">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399] shrink-0" />
                  {activeFlyoutItem.label}
                </span>
                <span className="text-[9px] font-semibold text-emerald-200/80 bg-emerald-500/20 px-1.5 py-0.5 rounded border border-emerald-400/30 shrink-0">
                  Menu
                </span>
              </div>

              {/* Flyout Submenu List */}
              <ul className="space-y-0.5">
                {activeFlyoutItem.children.map((child) => {
                  const ChildIcon = child.icon;
                  const isChildActive = isActive(child.href);
                  return (
                    <li key={child.href}>
                      <Link
                        href={child.href}
                        onClick={() => {
                          setPinnedFlyoutId(null);
                          setHoveredFlyoutId(null);
                          if (isOpen) onClose();
                        }}
                        className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-colors ${isChildActive
                          ? "bg-white/20 text-white font-bold"
                          : "text-emerald-100/90 hover:text-white hover:bg-white/10"
                          }`}
                      >
                        <ChildIcon className="w-3.5 h-3.5 shrink-0 opacity-80" />
                        <span className="truncate">{child.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </>
          ) : (
            /* Single Menu Item (Dashboard, POS, Customers, Settings): Sleek Floating Card */
            <Link
              href={activeFlyoutItem.href || "#"}
              onClick={() => {
                setPinnedFlyoutId(null);
                setHoveredFlyoutId(null);
                if (isOpen) onClose();
              }}
              className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${isActive(activeFlyoutItem.href)
                ? "bg-white text-emerald-950 shadow-md font-bold"
                : "text-emerald-100 hover:text-white hover:bg-white/15"
                }`}
            >
              <activeFlyoutItem.icon className="w-4 h-4 shrink-0 text-emerald-200" />
              <span className="whitespace-nowrap">{activeFlyoutItem.label}</span>
            </Link>
          )}
        </div>
      )}
    </>
  );
}
