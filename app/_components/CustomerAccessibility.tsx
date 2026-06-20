"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Type } from "lucide-react";

type TextSize = "normal" | "large";

export default function CustomerAccessibility() {
  const pathname = usePathname();
  const [textSize, setTextSize] = useState<TextSize>(() => {
    if (typeof window === "undefined") return "normal";
    return localStorage.getItem("easebrew-text-size") === "large" ? "large" : "normal";
  });
  const hidden = pathname.startsWith("/admin");

  useEffect(() => {
    document.documentElement.dataset.customerText = textSize;
  }, [textSize]);

  function changeTextSize(size: TextSize) {
    setTextSize(size);
    localStorage.setItem("easebrew-text-size", size);
    document.documentElement.dataset.customerText = size;
  }

  if (hidden) return null;

  return (
    <div className="customer-accessibility" aria-label="Laki ng teksto">
      <button
        type="button"
        aria-label="Karaniwang laki ng teksto"
        aria-pressed={textSize === "normal"}
        onClick={() => changeTextSize("normal")}
      >
        A
      </button>
      <button
        type="button"
        aria-label="Palakihin ang teksto"
        aria-pressed={textSize === "large"}
        onClick={() => changeTextSize("large")}
      >
        <Type size={22} strokeWidth={2.5} />
      </button>
    </div>
  );
}
