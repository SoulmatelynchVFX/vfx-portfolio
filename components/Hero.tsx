"use client";

import { useEffect, useRef, useState } from "react";
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

const titleItem: Variants = {
  hidden: { opacity: 0, y: 28, scale: 0.96 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] },
  },
};

/**
 * 首屏 Hero（v0.0.5）：
 * - 底层金翅大鹏视频全屏铺满（首帧前用 poster 兜底；首尾淡变，循环无硬跳；已去音频流 + faststart 兼容自动播放）
 * - 标题采用 SVG 纯描边浮雕玻璃字（字心透空 + 三层描边做立体边 + 双投影），叠加压暗遮罩保证可读
 * - 背景视频始终循环播放（作品集核心展示，不再因系统「减少动态」而暂停）
 */
export default function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    // React 不会把 JSX 的 muted 写到真实 DOM 属性，手动强制静音，否则浏览器按
    // 「有声自动播放」拦截，视频会停在第一帧。
    v.muted = true;
    v.loop = true; // 双保险，确保循环播放
    // 背景视频是作品集的核心展示，始终循环播放（不再因系统「减少动态」而暂停）。
    const tryPlay = () => {
      const p = v.play();
      if (p && typeof p.catch === "function") p.catch(() => {});
    };
    tryPlay();
    // 个别浏览器需在「可播放」事件后才允许 play，兜底再触发一次
    v.addEventListener("canplay", tryPlay, { once: true });
    return () => v.removeEventListener("canplay", tryPlay);
  }, []);

  // 滚动视差：向下滚动时 Hero 标题与 meta 淡出上移，形成「镜头推远」的电影感。
  // 直接操作 DOM，不触发 React 重渲染（用户明确要动效，不跟随系统减少动画设置）。
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hero = heroRef.current;
    if (!hero) return;
    const titleWrap = hero.querySelector<HTMLElement>("[data-parallax='title']");
    const meta = hero.querySelector<HTMLElement>("[data-parallax='meta']");
    const scrollHint = hero.querySelector<HTMLElement>("[data-parallax='scroll']");

    const onScroll = () => {
      const vh = window.innerHeight || 1;
      const p = Math.min(1, Math.max(0, window.scrollY / vh));
      if (titleWrap) {
        titleWrap.style.opacity = (1 - p * 0.95).toFixed(3);
        titleWrap.style.transform = `translateY(${(-p * 70).toFixed(1)}px) scale(${(1 - p * 0.06).toFixed(3)})`;
      }
      if (meta) {
        meta.style.opacity = (1 - p * 1.2).toFixed(3);
        meta.style.transform = `translateY(${(-p * 40).toFixed(1)}px)`;
      }
      if (scrollHint) {
        scrollHint.style.opacity = (1 - p * 1.6).toFixed(3);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Scroll 按钮两阶段引导：Hero → About → Works，到达 Works 后渐隐；回到顶部时恢复。
  // 阶段由「滚动位置」驱动（而非点击计数），因此渐隐在「到达 Works」时必然可见；
  // 真正的平滑滚动交给 SmoothScroll 的全局锚点拦截（已验证可用），这里不拦截点击。
  const [scrollPhase, setScrollPhase] = useState<"about" | "works" | "done">("about");
  const [scrollReady, setScrollReady] = useState(false);

  useEffect(() => {
    const about = document.getElementById("about");
    const works = document.getElementById("works");
    if (!about || !works) return;
    const onScroll = () => {
      const y = window.scrollY;
      const aboutTop = about.getBoundingClientRect().top + y;
      const worksTop = works.getBoundingClientRect().top + y;
      if (y < aboutTop - 120) setScrollPhase("about");
      else if (y < worksTop - 120) setScrollPhase("works");
      else setScrollPhase("done");
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // 首屏入场后 1.1s 再淡入按钮，避免与 Hero 标题动画抢戏
  useEffect(() => {
    const t = window.setTimeout(() => setScrollReady(true), 1100);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative h-svh min-h-[560px] w-full select-none overflow-hidden bg-[#0a0a0a]"
    >
      {/* 1. 底层视频：全屏铺满（金翅大鹏 golden-wing），poster 兜底首帧 */}
      <video
        ref={videoRef}
        className="absolute inset-0 z-0 h-full w-full object-cover"
        src={site.heroVideo}
        poster={site.heroPoster}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
      />

      {/* 保持影像为主角：只用一层底片保证文字可读，不在内容上叠加装饰性玻璃。 */}
      <div className="pointer-events-none absolute inset-0 z-10 bg-[linear-gradient(180deg,rgba(2,8,13,.62)_0%,rgba(3,8,12,.14)_44%,rgba(2,5,8,.76)_100%)]" />

      {/* 3. 原始 SVG 三层描边玻璃字 */}
      <div
        data-parallax="title"
        className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center px-6"
      >
        <motion.h1
          variants={titleItem}
          initial="hidden"
          animate="show"
          className="font-ios stroke-title"
          aria-label={site.name}
        >
          <svg className="title-svg" viewBox="0 0 800 130" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
            <text x="400" y="65" textAnchor="middle" dominantBaseline="central" fill="none" stroke="rgba(0,0,0,0.6)" strokeWidth={1.8} fontSize={84} fontWeight={500} letterSpacing="-0.02em">
              {site.name}
            </text>
            <text x="400" y="65" textAnchor="middle" dominantBaseline="central" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth={1.1} fontSize={84} fontWeight={500} letterSpacing="-0.02em">
              {site.name}
            </text>
            <text x="400" y="65" textAnchor="middle" dominantBaseline="central" fill="none" stroke="rgba(255,255,255,0.98)" strokeWidth={0.5} fontSize={84} fontWeight={500} letterSpacing="-0.02em">
              {site.name}
            </text>
          </svg>
        </motion.h1>
      </div>

      {/* 4. 标题上方标签 */}
      <motion.p
        variants={item}
        initial="hidden"
        animate="show"
        className="hero-kicker absolute left-1/2 top-[18%] z-30 -translate-x-1/2 whitespace-nowrap text-[10px] uppercase tracking-[0.32em] text-white/70 sm:text-[11px]"
      >
        {site.heroLabel}
      </motion.p>

      {/* 5. 标题下方头衔 + 标语 */}
      <motion.div
        data-parallax="meta"
        variants={container}
        initial="hidden"
        animate="show"
        className="absolute bottom-[16%] left-1/2 z-30 flex -translate-x-1/2 flex-col items-center text-center"
      >
        <motion.p
          variants={item}
          className="hero-role whitespace-nowrap text-xs font-medium uppercase tracking-[0.22em] text-white/90 sm:text-sm"
        >
          {site.role}
        </motion.p>
        <motion.p
          variants={item}
          className="hero-tagline mt-2.5 whitespace-nowrap text-[10px] uppercase tracking-[0.16em] text-white/60 sm:text-[11px]"
        >
          {site.tagline}
        </motion.p>
      </motion.div>

      {/* 6. 向下滚动提示：固定悬浮，Hero → About → Works，到达 Works 后渐隐 */}
      <a
        href={scrollPhase === "about" ? "#about" : "#works"}
        data-cursor="link"
        aria-label={
          scrollPhase === "about"
            ? "向下滚动查看个人介绍"
            : scrollPhase === "works"
              ? "向下滚动查看作品集"
              : "已到达作品集"
        }
        className="fixed bottom-[6%] left-1/2 z-30 flex -translate-x-1/2 flex-col items-center gap-3 text-white/40 transition-[opacity,color] duration-700 ease-out hover:text-white"
        style={{
          opacity: scrollReady && scrollPhase !== "done" ? 1 : 0,
          pointerEvents: scrollReady && scrollPhase !== "done" ? "auto" : "none",
        }}
      >
        <span className="text-[10px] uppercase tracking-[0.4em]">Scroll</span>
        <span className="h-10 w-px animate-pulse bg-gradient-to-b from-white/70 to-transparent" />
      </a>
    </section>
  );
}
