"use client";

import { useEffect, type ReactNode } from "react";
import Lenis from "lenis";
import { setLenis } from "../lib/lenis";

/**
 * 全局平滑滚动：用 Lenis 接管原生滚动，带来带阻尼的「原生 App」手感。
 * 同时拦截站内锚点跳转（#works），交给 Lenis 平滑滚动。
 */
export default function SmoothScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    const lenis = new Lenis({
      // 用 lerp（线性插值）模式，而非 duration 模式。
      // duration + easeInOutCubic 会在每次滚轮时启动一个头尾极慢的 1 秒长动画，
      // 表现为「泥里拖、阻力感强」。lerp 每帧按固定比例逼近目标，手感跟手且顺滑。
      // 0.1 是平滑与跟手的平衡点：调高更跟手（更快抵达），调低更飘。
      lerp: 0.1,
      smoothWheel: true,
      touchMultiplier: 1.5,
      respectReducedMotion: false,
    });
    setLenis(lenis);

    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    // 锚点跳转 → 交给 Lenis 完成一段可感知的章节过渡。
    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const anchor = target?.closest?.('a[href^="#"]') as HTMLAnchorElement | null;
      if (!anchor) return;
      const hash = anchor.getAttribute("href");
      if (!hash || hash === "#") return;
      const el = document.querySelector<HTMLElement>(hash);
      if (!el) return;
      event.preventDefault();
      window.history.pushState(null, "", hash);
      lenis.scrollTo(el, {
        offset: 0,
        duration: 1.05,
        easing: (t) => 1 - Math.pow(1 - t, 4),
      });
    };
    document.addEventListener("click", onClick);

    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener("click", onClick);
      lenis.destroy();
      setLenis(null);
    };
  }, []);

  return <>{children}</>;
}
