"use client";

import { useCallback, useMemo, useState } from "react";
import { motion, type Variants } from "framer-motion";
import type { CategoryId } from "../types";
import { categories, projects } from "../data/projects";
import FilterBar from "./FilterBar";
import Lightbox from "./Lightbox";
import ProjectCard from "./ProjectCard";

const gridVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 40, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
  },
};

/**
 * 作品画廊：分类过滤（项目 / 练习）+ 错落入场动画 + 缩略图网格 + 沉浸式播放弹窗。
 */
export default function Gallery() {
  const [active, setActive] = useState<CategoryId>("project");
  const [selected, setSelected] = useState<number | null>(null);

  const visible = useMemo(
    () => projects.filter((p) => p.category === active),
    [active]
  );

  const open = useCallback((index: number) => setSelected(index), []);
  const close = useCallback(() => setSelected(null), []);
  const navigate = useCallback((index: number) => setSelected(index), []);

  return (
    <>
      <FilterBar categories={categories} active={active} onChange={setActive} />

      {/* key={active} 让切换分类时重新触发错落入场动画 */}
      <motion.div
        key={active}
        variants={gridVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: false, amount: 0.1 }}
        className="portfolio-grid mt-10 grid grid-cols-1 gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-12 lg:gap-x-8 lg:gap-y-16"
      >
        {visible.map((project, i) => (
          <motion.div
            key={project.id}
            variants={itemVariants}
            className={i === 0 ? "portfolio-feature lg:col-span-7 lg:row-span-2" : "lg:col-span-5"}
          >
            <ProjectCard project={project} onOpen={() => open(i)} />
          </motion.div>
        ))}
      </motion.div>

      {visible.length === 0 && (
        <p className="mt-12 text-sm text-white/40">该分类下暂无作品。</p>
      )}

      {selected !== null && visible[selected] && (
        <Lightbox
          projects={visible}
          index={selected}
          onClose={close}
          onNavigate={navigate}
        />
      )}
    </>
  );
}
