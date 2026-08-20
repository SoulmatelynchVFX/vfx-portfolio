"use client";

import { useEffect, useRef } from "react";
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

  // 液态玻璃高光：采样背景视频亮区重心，驱动标题三层浮雕的「亮边/暗边」偏移，
  // 让玻璃质感随画面流动。低频采样（~11fps）控制开销，不读取全分辨率帧。
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    // 固定浮雕方向：光来自左上（与 SVG 三层描边的暗/亮边一致）
    const titleDark = document.getElementById("title-dark");
    const titleLight = document.getElementById("title-light");
    const BASE_BX = 1.3;
    const BASE_BY = 1.3;

    const canvas = document.createElement("canvas");
    canvas.width = 24;
    canvas.height = 14; // 按 16:9 比例降采样，足够判断亮区方向
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    let raf = 0;
    let last = 0;
    const rootStyle = document.documentElement.style;

    const sample = (t: number) => {
      raf = requestAnimationFrame(sample);
      if (v.paused || v.ended) return;
      if (t - last < 90) return; // 约 11fps
      last = t;
      try {
        ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
        const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const W = canvas.width;
        const H = canvas.height;
        let gx = 0;
        let gy = 0;
        let n = 0;
        for (let y = 0; y < H; y++) {
          for (let x = 0; x < W; x++) {
            const i = (y * W + x) * 4;
            const lum = data[i] * 0.3 + data[i + 1] * 0.59 + data[i + 2] * 0.11;
            gx += (x - W / 2) * lum;
            gy += (y - H / 2) * lum;
            n++;
          }
        }
        // 亮区重心方向 -> 高光朝亮侧轻微游移（幅度小，仅作玻璃光泽呼吸）
        const gxN = gx / n;
        const gyN = gy / n;
        const mag = Math.hypot(gxN, gyN) || 1;
        const amp = Math.min(3, mag / 1500);
        const vhx = (gxN / mag) * amp * 0.5;
        const vhy = (gyN / mag) * amp * 0.5;
        rootStyle.setProperty("--glass-hx", vhx.toFixed(2) + "px");
        rootStyle.setProperty("--glass-hy", vhy.toFixed(2) + "px");
        const bx = BASE_BX + vhx;
        const by = BASE_BY + vhy;
        titleDark?.setAttribute("transform", `translate(${bx.toFixed(2)}, ${by.toFixed(2)})`);
        titleLight?.setAttribute("transform", `translate(${(-bx).toFixed(2)}, ${(-by).toFixed(2)})`);
      } catch {
        // 跨域或帧暂不可读时静默跳过，下一帧再试
      }
    };
    raf = requestAnimationFrame(sample);
    return () => cancelAnimationFrame(raf);
  }, []);

  // 滚动视差：向下滚动时 Hero 标题与 meta 淡出上移，形成「镜头推远」的电影感。
  // 直接操作 DOM，不触发 React 重渲染；尊重 prefers-reduced-motion。
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
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

      {/* 2. 压暗遮罩：上/下加重保证标签可读，中部仅轻压留给标题 */}
      <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-b from-black/60 via-black/30 to-black/75" />

      {/* 3. 标题：SVG 纯描边浮雕玻璃字（字心透空 + 三层描边做立体边 + 双投影），
              与下方小字拉开层级；浮雕高光方向由背景视频亮区驱动（见下方采样 effect） */}
      <div
        data-parallax="title"
        className="liquid-title-glow pointer-events-none absolute inset-0 z-20 flex items-center justify-center"
      >
        <motion.h1
          variants={titleItem}
          initial="hidden"
          animate="show"
          className="font-ios stroke-title"
          aria-label={site.name}
        >
          <svg
            className="title-svg"
            viewBox="0 0 800 130"
            preserveAspectRatio="xMidYMid meet"
            aria-hidden="true"
          >
            <text
              id="title-dark"
              x="400"
              y="65"
              textAnchor="middle"
              dominantBaseline="central"
              fill="none"
              stroke="rgba(0,0,0,0.6)"
              strokeWidth={1.8}
              fontSize={84}
              fontWeight={500}
              letterSpacing="-0.02em"
            >
              {site.name}
            </text>
            <text
              id="title-base"
              x="400"
              y="65"
              textAnchor="middle"
              dominantBaseline="central"
              fill="none"
              stroke="rgba(255,255,255,0.6)"
              strokeWidth={1.1}
              fontSize={84}
              fontWeight={500}
              letterSpacing="-0.02em"
            >
              {site.name}
            </text>
            <text
              id="title-light"
              x="400"
              y="65"
              textAnchor="middle"
              dominantBaseline="central"
              fill="none"
              stroke="rgba(255,255,255,0.98)"
              strokeWidth={0.5}
              fontSize={84}
              fontWeight={500}
              letterSpacing="-0.02em"
            >
              {site.name}
            </text>
          </svg>
        </motion.h1>
      </div>

      {/* 4. 标题上方标签（来自配置，液态玻璃文字） */}
      <motion.p
        variants={item}
        initial="hidden"
        animate="show"
        className="font-ios liquid-text absolute left-1/2 top-[18%] z-30 -translate-x-1/2 whitespace-nowrap text-[11px] uppercase tracking-[0.5em] text-white/70"
      >
        {site.heroLabel}
      </motion.p>

      {/* 5. 标题下方头衔 + 标语（液态玻璃文字） */}
      <motion.div
        data-parallax="meta"
        variants={container}
        initial="hidden"
        animate="show"
        className="absolute bottom-[16%] left-1/2 z-30 flex -translate-x-1/2 flex-col items-center text-center"
      >
        <motion.p
          variants={item}
          className="font-ios liquid-text whitespace-nowrap text-xs uppercase tracking-[0.45em] text-white/90 sm:text-sm"
        >
          {site.role}
        </motion.p>
        <motion.p
          variants={item}
          className="font-ios liquid-text mt-3 whitespace-nowrap text-[11px] uppercase tracking-[0.3em] text-white/55"
        >
          {site.tagline}
        </motion.p>
      </motion.div>

      {/* 6. 向下滚动提示 */}
      <motion.a
        href="#works"
        data-cursor="link"
        data-parallax="scroll"
        aria-label="向下滚动查看作品"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1, duration: 0.8 }}
        className="absolute bottom-[6%] left-1/2 z-30 flex -translate-x-1/2 flex-col items-center gap-3 text-white/40 transition hover:text-white"
      >
        <span className="text-[10px] uppercase tracking-[0.4em]">Scroll</span>
        <span className="h-10 w-px animate-pulse bg-gradient-to-b from-white/70 to-transparent" />
      </motion.a>
    </section>
  );
}
