"use client";

import type { Category, CategoryId } from "../types";

interface FilterBarProps {
  categories: Category[];
  active: CategoryId | "all";
  onChange: (id: CategoryId | "all") => void;
}

/** 分类过滤标签栏（液态玻璃条，移动端可横向滑动） */
export default function FilterBar({ categories, active, onChange }: FilterBarProps) {
  return (
    <div className="glass-panel no-scrollbar -mx-4 flex gap-2 overflow-x-auto rounded-full px-4 py-2.5 sm:mx-0 sm:flex-wrap sm:px-3">
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
                : "border-white/15 bg-transparent text-white/60 hover:border-white/40 hover:text-white"
            }`}
          >
            {c.label}
          </button>
        );
      })}
    </div>
  );
}
