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
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] } },
};

export default function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    video.loop = true;
    const play = () => void video.play().catch(() => {});
    play();
    video.addEventListener("canplay", play, { once: true });
    return () => video.removeEventListener("canplay", play);
  }, []);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const title = hero.querySelector<HTMLElement>("[data-parallax='title']");
    const meta = hero.querySelector<HTMLElement>("[data-parallax='meta']");
    const onScroll = () => {
      const progress = Math.min(1, Math.max(0, window.scrollY / (window.innerHeight || 1)));
      if (title) {
        title.style.opacity = (1 - progress * 0.95).toFixed(3);
        title.style.transform = `translateY(${(-progress * 70).toFixed(1)}px) scale(${(1 - progress * 0.06).toFixed(3)})`;
      }
      if (meta) {
        meta.style.opacity = (1 - progress * 1.2).toFixed(3);
        meta.style.transform = `translateY(${(-progress * 40).toFixed(1)}px)`;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section ref={heroRef} className="relative h-svh min-h-[560px] w-full select-none overflow-hidden bg-[#0a0a0a]">
      <video
        ref={videoRef}
        className="absolute inset-0 z-0 h-full w-full object-cover"
        src={site.heroVideo}
        poster={site.heroPoster}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden="true"
      />
      <div className="pointer-events-none absolute inset-0 z-10 bg-[linear-gradient(180deg,rgba(2,8,13,.62)_0%,rgba(3,8,12,.14)_44%,rgba(2,5,8,.76)_100%)]" />

      <nav aria-label="主页导航" className="absolute inset-x-4 top-4 z-30 mx-auto flex max-w-7xl items-center justify-between sm:inset-x-6 sm:top-6 lg:px-2">
        <span className="film-wordmark">SW / VFX</span>
        <a href="#about" data-cursor="link" className="film-nav-link">
          关于
        </a>
      </nav>

      <div data-parallax="title" className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center px-6">
        <motion.h1 variants={titleItem} initial="hidden" animate="show" className="font-ios stroke-title" aria-label={site.name}>
          <svg className="title-svg" viewBox="0 0 800 130" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
            <text x="400" y="65" textAnchor="middle" dominantBaseline="central" fill="none" stroke="rgba(0,0,0,0.6)" strokeWidth={1.8} fontSize={84} fontWeight={500} letterSpacing="-0.02em">{site.name}</text>
            <text x="400" y="65" textAnchor="middle" dominantBaseline="central" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth={1.1} fontSize={84} fontWeight={500} letterSpacing="-0.02em">{site.name}</text>
            <text x="400" y="65" textAnchor="middle" dominantBaseline="central" fill="none" stroke="rgba(255,255,255,0.98)" strokeWidth={0.5} fontSize={84} fontWeight={500} letterSpacing="-0.02em">{site.name}</text>
          </svg>
        </motion.h1>
      </div>

      <motion.a
        href="#works"
        data-cursor="link"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.15, duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        className="reel-cta absolute left-1/2 top-[65%] z-30 -translate-x-1/2"
      >
        <span className="reel-cta-dot" aria-hidden="true" />
        查看精选作品
        <span className="reel-cta-arrow" aria-hidden="true">→</span>
      </motion.a>

      <motion.p variants={item} initial="hidden" animate="show" className="hero-kicker absolute left-1/2 top-[18%] z-30 -translate-x-1/2 whitespace-nowrap text-[10px] uppercase tracking-[0.32em] text-white/70 sm:text-[11px]">
        {site.heroLabel}
      </motion.p>

      <motion.div data-parallax="meta" variants={container} initial="hidden" animate="show" className="absolute bottom-[16%] left-1/2 z-30 flex -translate-x-1/2 flex-col items-center text-center">
        <motion.p variants={item} className="hero-role whitespace-nowrap text-xs font-medium uppercase tracking-[0.22em] text-white/90 sm:text-sm">{site.role}</motion.p>
        <motion.p variants={item} className="hero-tagline mt-2.5 whitespace-nowrap text-[10px] uppercase tracking-[0.16em] text-white/60 sm:text-[11px]">{site.tagline}</motion.p>
      </motion.div>
    </section>
  );
}
