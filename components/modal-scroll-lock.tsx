"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function ModalScrollLock() {
  const pathname = usePathname();

  useEffect(() => {
    let isLocked = false;
    let savedScrollY = 0;

    const checkModalState = () => {
      const fixedOverlays = document.querySelectorAll<HTMLElement>("div.fixed.inset-0");
      let hasOpenModal = false;

      for (let i = 0; i < fixedOverlays.length; i++) {
        const el = fixedOverlays[i];
        if (el.hasAttribute("data-sidebar-backdrop")) continue;
        const style = window.getComputedStyle(el);
        if (
          style.display !== "none" &&
          style.visibility !== "hidden" &&
          parseFloat(style.opacity || "1") > 0
        ) {
          const zIndex = parseInt(style.zIndex, 10);
          if (!isNaN(zIndex) && zIndex >= 40) {
            hasOpenModal = true;
            break;
          }
        }
      }

      if (hasOpenModal && !isLocked) {
        savedScrollY = window.scrollY;
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        
        document.documentElement.style.overflow = "hidden";
        document.body.style.overflow = "hidden";
        if (scrollbarWidth > 0) {
          document.body.style.paddingRight = `${scrollbarWidth}px`;
        }
        isLocked = true;
      } else if (!hasOpenModal && isLocked) {
        document.documentElement.style.overflow = "";
        document.body.style.overflow = "";
        document.body.style.paddingRight = "";
        isLocked = false;
      }
    };

    checkModalState();

    const observer = new MutationObserver(() => {
      checkModalState();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["style", "class"],
    });

    return () => {
      observer.disconnect();
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
      isLocked = false;
    };
  }, [pathname]);

  return null;
}

