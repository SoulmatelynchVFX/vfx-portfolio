"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * 进入视口时触发淡入上移动画（作品区入场）。
 * 无 IntersectionObserver 支持时直接显示，避免内容永久隐藏。
 */
export default function Reveal({
  children,
  className = "",
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setInView(true);
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      id={id}
      className={`reveal ${inView ? "in-view" : ""} ${className}`.trim()}
    >
      {children}
    </div>
  );
}
