"use client";

import type { Category, CategoryId } from "../types";

interface FilterBarProps {
  categories: Category[];
  active: CategoryId;
  onChange: (id: CategoryId) => void;
}

/** 分类过滤标签栏（作品集编辑式分段控件） */
export default function FilterBar({ categories, active, onChange }: FilterBarProps) {
  return (
    <div className="film-filter no-scrollbar -mx-4 flex gap-1 overflow-x-auto px-4 py-1 sm:mx-0 sm:px-1">
      {categories.map((c) => {
        const isActive = c.id === active;
        return (
          <button
            key={c.id}
            type="button"
            onClick={() => onChange(c.id)}
            aria-pressed={isActive}
            className={`film-filter-button shrink-0 whitespace-nowrap px-4 py-2 text-[11px] uppercase tracking-[0.16em] transition-all duration-300 ${
              isActive
                ? "film-filter-active"
                : "text-white/45 hover:text-white"
            }`}
          >
            {c.label}
          </button>
        );
      })}
    </div>
  );
}
