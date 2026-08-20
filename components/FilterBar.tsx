"use client";

import { LiquidGlass } from "@persian-caesar/liquid-glass";
import type { Category, CategoryId } from "../types";

interface FilterBarProps {
  categories: Category[];
  active: CategoryId | "all";
  onChange: (id: CategoryId | "all") => void;
}

/** 分类过滤标签栏（液态玻璃条，移动端可横向滑动） */
export default function FilterBar({ categories, active, onChange }: FilterBarProps) {
  return (
    <LiquidGlass
      borderRadius={999}
      blur={0.6}
      saturation={1.3}
      displacementScale={1.2}
      elasticity={0.7}
      shadowIntensity={0.3}
      className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0"
      style={{ background: "rgba(255,255,255,0.08)", padding: "10px 12px" }}
    >
      {categories.map((c) => {
        const isActive = c.id === active;
        return (
          <button
            key={c.id}
            type="button"
            onClick={() => onChange(c.id)}
            aria-pressed={isActive}
            className={`shrink-0 whitespace-nowrap rounded-full border px-4 py-1.5 text-xs tracking-wide transition-colors duration-200 ${
              isActive
                ? "border-white bg-white text-black"
                : "border-white/15 text-white/60 hover:border-white/40 hover:text-white"
            }`}
          >
            {c.label}
          </button>
        );
      })}
    </LiquidGlass>
  );
}
