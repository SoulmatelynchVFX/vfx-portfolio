"use client";

import { motion, type Variants } from "framer-motion";
import { site } from "../data/site";

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.3 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] } },
};

/**
 * 首屏 Hero：
 * - 底层视频定位到标题区域（稍往下、稍放大），适配文字大小
 * - 黑底 multiply 蒙版让视频透过「Seal Wang」字形显示
 * - 上层再叠一层半透明白字，保证视频暗处字形依旧可辨识
 */
export default function Hero() {
  return (
    <section className="relative h-svh min-h-[560px] w-full overflow-hidden bg-[#0a0a0a]">
      {/* 1. 底层视频：定位标题区域，稍往下、稍放大 */}
      <div className="absolute left-1/2 top-[52%] z-0 h-[260px] w-[720px] -translate-x-1/2 -translate-y-1/2 overflow-hidden">
        <video
          className="h-full w-full object-cover"
          src={site.heroVideo}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden="true"
        />
      </div>

      {/* 2. 文字蒙版层：黑底 multiply，视频只透过标题字形显示 */}
      <div className="absolute inset-0 z-10 flex items-center justify-center bg-black mix-blend-multiply">
        <h1 className="whitespace-nowrap px-6 text-center text-8xl font-normal tracking-tight text-white">
          {site.name}
        </h1>
      </div>

      {/* 3. 上层半透明白字：保证字形在视频暗处依旧清晰可辨 */}
      <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
        <h1 className="whitespace-nowrap px-6 text-center text-8xl font-normal tracking-tight text-white/40">
          {site.name}
        </h1>
      </div>

      {/* 4. 标题上方标签 */}
      <motion.p
        variants={item}
        initial="hidden"
        animate="show"
        className="absolute left-1/2 top-[18%] z-30 -translate-x-1/2 whitespace-nowrap text-[11px] uppercase tracking-[0.5em] text-white/60"
      >
        Showreel — 2026
      </motion.p>

      {/* 5. 标题下方头衔 + 标语 */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="absolute bottom-[14%] left-1/2 z-30 flex -translate-x-1/2 flex-col items-center text-center"
      >
        <motion.p
          variants={item}
          className="whitespace-nowrap text-xs uppercase tracking-[0.45em] text-white/80 sm:text-sm"
        >
          {site.role}
        </motion.p>
        <motion.p
          variants={item}
          className="mt-3 whitespace-nowrap text-[11px] uppercase tracking-[0.3em] text-white/45"
        >
          {site.tagline}
        </motion.p>
      </motion.div>

      {/* 6. 向下滚动提示 */}
      <motion.a
        href="#works"
        data-cursor="link"
        aria-label="向下滚动查看作品"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 z-30 flex -translate-x-1/2 flex-col items-center gap-3 text-white/40 transition hover:text-white"
      >
        <span className="text-[10px] uppercase tracking-[0.4em]">Scroll</span>
        <span className="h-10 w-px animate-pulse bg-gradient-to-b from-white/70 to-transparent" />
      </motion.a>
    </section>
  );
}
