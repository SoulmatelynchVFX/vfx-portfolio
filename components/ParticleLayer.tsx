"use client";

import { useEffect, useRef } from "react";
import { ParticleText } from "../lib/particleText";

interface ParticleLayerProps {
  /** 要汇聚成的文字 */
  text: string;
  /** 可选第二行小字（预留） */
  subText?: string;
  className?: string;
  fontSize?: number;
  subFontSize?: number;
  color?: string;
  density?: number;
  maxParticles?: number;
  repelRadius?: number;
  repelStrength?: number;
  glow?: boolean;
  fontWeight?: number;
  speed?: number;
  /** inview：进入视口汇聚、离开散开（默认）；manual：手动控制 */
  triggerMode?: "inview" | "manual";
  /** 汇聚触发所需可见比例 */
  amount?: number;
}

/**
 * 粒子文字层：把一段文字以「粒子汇聚成字 / 离开时散回粒子」的方式渲染。
 * 可作为标题的背景层（z 层夹在背景与标题之间），或直接取代某处标题文字。
 */
export default function ParticleLayer({
  text,
  subText,
  className,
  fontSize,
  subFontSize,
  color,
  density,
  maxParticles,
  repelRadius,
  repelStrength,
  glow,
  fontWeight,
  speed,
  triggerMode = "inview",
  amount = 0.15,
}: ParticleLayerProps) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    const pt = new ParticleText(canvas, {
      text,
      subText,
      fontSize,
      subFontSize,
      color,
      density,
      maxParticles,
      repelRadius,
      repelStrength,
      glow,
      fontWeight,
      speed,
    });

    let io: IntersectionObserver | null = null;
    if (triggerMode === "inview" && typeof IntersectionObserver !== "undefined") {
      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((en) => {
            if (en.isIntersecting) pt.converge();
            else pt.disperse();
          });
        },
        { threshold: amount },
      );
      io.observe(canvas);
    }

    return () => {
      if (io) io.disconnect();
      pt.destroy();
    };
  }, [
    text,
    subText,
    fontSize,
    subFontSize,
    color,
    density,
    maxParticles,
    repelRadius,
    repelStrength,
    glow,
    fontWeight,
    speed,
    triggerMode,
    amount,
  ]);

  return <canvas ref={ref} className={className} aria-hidden="true" />;
}
