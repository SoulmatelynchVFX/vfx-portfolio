"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

type CursorMode = "default" | "play" | "link";

/**
 * 定制光标：一个带弹簧跟随的小圆点。
 * - 悬浮在视频卡片（data-cursor="play"）上 → 放大为圆环并显示 PLAY
 * - 悬浮在文字链接（data-cursor="link"）上 → 磁性吸附 + 反色（mix-blend difference）
 * - 播放器沉浸模式会通过 cursor-show / cursor-hide 事件控制其显隐
 */
export default function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const [mode, setMode] = useState<CursorMode>("default");
  const [hidden, setHidden] = useState(true);
  const [pressed, setPressed] = useState(false);

  const magneticEl = useRef<HTMLElement | null>(null);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const springX = useSpring(x, { stiffness: 600, damping: 42, mass: 0.4 });
  const springY = useSpring(y, { stiffness: 600, damping: 42, mass: 0.4 });

  useEffect(() => {
    // 仅在桌面「精细指针」设备上启用，触屏设备不做定制光标
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!fine) return;
    setEnabled(true);

    const onMove = (e: MouseEvent) => {
      let tx = e.clientX;
      let ty = e.clientY;
      const el = magneticEl.current;
      if (el) {
        // 磁性吸附：目标位置向元素中心轻微靠拢
        const r = el.getBoundingClientRect();
        const strength = 0.35;
        tx += (r.left + r.width / 2 - tx) * strength;
        ty += (r.top + r.height / 2 - ty) * strength;
      }
      x.set(tx);
      y.set(ty);
    };

    const onOver = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest('[data-cursor="play"]')) {
        setMode("play");
        magneticEl.current = null;
        return;
      }
      const link = t.closest<HTMLElement>('[data-cursor="link"]');
      if (link) {
        setMode("link");
        magneticEl.current = link;
        return;
      }
      if (t.closest("a, button, [role='button']")) {
        setMode("link");
        magneticEl.current = null;
        return;
      }
      setMode("default");
      magneticEl.current = null;
    };

    const onDown = () => setPressed(true);
    const onUp = () => setPressed(false);
    const onLeave = () => setHidden(true);
    const onEnter = () => setHidden(false);
    const onShow = () => setHidden(false);
    const onHide = () => setHidden(true);

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseover", onOver);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    document.documentElement.addEventListener("mouseleave", onLeave);
    document.documentElement.addEventListener("mouseenter", onEnter);
    window.addEventListener("cursor-show", onShow);
    window.addEventListener("cursor-hide", onHide);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      document.documentElement.removeEventListener("mouseenter", onEnter);
      window.removeEventListener("cursor-show", onShow);
      window.removeEventListener("cursor-hide", onHide);
    };
  }, [x, y]);

  if (!enabled) return null;

  const isPlay = mode === "play";
  const size = isPlay ? 76 : mode === "link" ? 40 : 10;

  return (
    <motion.div
      className="pointer-events-none fixed left-0 top-0 z-[9999]"
      style={{ x: springX, y: springY }}
      aria-hidden="true"
    >
      <motion.div
        className="absolute left-0 top-0 flex items-center justify-center overflow-hidden rounded-full"
        style={{
          backgroundColor: "#ffffff",
          mixBlendMode: isPlay ? "normal" : "difference",
          x: "-50%",
          y: "-50%",
        }}
        animate={{
          width: size,
          height: size,
          opacity: hidden ? 0 : 1,
          scale: pressed ? 0.85 : 1,
        }}
        transition={{ type: "spring", stiffness: 350, damping: 26, mass: 0.6 }}
      >
        <span
          className={`select-none text-[10px] font-medium uppercase tracking-[0.18em] transition-opacity duration-200 ${
            isPlay ? "text-black opacity-100" : "opacity-0"
          }`}
        >
          Play
        </span>
      </motion.div>
    </motion.div>
  );
}
