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
 * - 「金翅大鹏」视频作为全屏背景
 * - 标题「Seal Wang」用动态字标 webm（黑底，mix-blend-screen 透明化后只留流光文字）
 * - 标签 / 头衔 / 标语作为普通白字围绕标题排布
 */
export default function Hero() {
  return (
    <section className="relative flex h-svh min-h-[560px] w-full flex-col items-center justify-center overflow-hidden bg-[#0a0a0a]">
      {/* 1. 底层背景视频 */}
      <video
        className="absolute inset-0 h-full w-full object-cover"
        src={site.heroVideo}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
      />

      {/* 2. 渐变压暗：让文字清晰，并自然过渡到画廊区 */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/15 to-[#0a0a0a]" />

      {/* 3. 标题动态字标（webm 黑底，mix-blend-screen 让黑底透明、只留流光文字） */}
      <video
        className="absolute left-1/2 top-1/2 z-10 h-auto w-[560px] -translate-x-1/2 -translate-y-1/2 mix-blend-screen"
        src={site.heroTitleVideo}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-label={site.name}
      />

      {/* 4. 标签（标题上方） */}
      <motion.p
        variants={item}
        initial="hidden"
        animate="show"
        className="absolute left-1/2 top-[18%] z-20 -translate-x-1/2 whitespace-nowrap text-[11px] uppercase tracking-[0.5em] text-white/75"
      >
        Showreel — 2026
      </motion.p>

      {/* 5. 头衔 + 标语（标题下方） */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="absolute bottom-[14%] left-1/2 z-20 flex -translate-x-1/2 flex-col items-center text-center"
      >
        <motion.p
          variants={item}
          className="whitespace-nowrap text-sm uppercase tracking-[0.45em] text-white/90"
        >
          {site.role}
        </motion.p>
        <motion.p
          variants={item}
          className="mt-3 whitespace-nowrap text-xs uppercase tracking-[0.3em] text-white/65"
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
        className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-3 text-white/50 transition hover:text-white"
      >
        <span className="text-[10px] uppercase tracking-[0.4em]">Scroll</span>
        <span className="h-10 w-px animate-pulse bg-gradient-to-b from-white/70 to-transparent" />
      </motion.a>
    </section>
  );
}
