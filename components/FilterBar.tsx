"use client";

import type { Category, CategoryId } from "../types";

interface FilterBarProps {
  categories: Category[];
  active: CategoryId;
  onChange: (id: CategoryId) => void;
}

/** 分类过滤标签栏（液态玻璃条，仅保留「项目 / 练习」两个大类） */
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
            className={`shrink-0 whitespace-nowrap rounded-full px-4 py-1.5 text-xs tracking-wide transition-all duration-200 ${
              isActive
                ? "border border-white bg-white text-black"
                : "glass-button"
            }`}
          >
            {c.label}
          </button>
        );
      })}
    </div>
  );
}
