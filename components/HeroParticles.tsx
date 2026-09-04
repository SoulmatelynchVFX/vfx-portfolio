"use client";

import { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  phase: number;
  glyph: string;
  nextGlyphAt: number;
};

type Beam = {
  x: number;
  y: number;
  length: number;
  speed: number;
  alpha: number;
};

const between = (min: number, max: number) => min + Math.random() * (max - min);
const GLYPHS = Array.from("VEXFLIPPOPUSDUENUKE");
const glyph = () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)];

/** A lightweight canvas field that starts only after the hero video has begun playing. */
export default function HeroParticles({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    let width = 0;
    let height = 0;
    let frame = 0;
    let previous = performance.now();
    let running = true;
    let particles: Particle[] = [];
    let beams: Beam[] = [];
    let field = { left: 0, right: 0, top: 0, bottom: 0 };

    const reset = () => {
      const bounds = canvas.getBoundingClientRect();
      const ratio = 1;
      width = Math.max(1, Math.round(bounds.width));
      height = Math.max(1, Math.round(bounds.height));
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);

      field = {
        left: width / 6,
        right: width * (5 / 6),
        top: height / 6,
        bottom: height * (5 / 6),
      };
      const count = width < 768 ? 10 : 14;
      const now = performance.now();
      particles = Array.from({ length: count }, () => ({
        x: between(field.left, field.right),
        y: between(field.top, field.bottom),
        vx: 0,
        vy: between(0.018, 0.055),
        radius: between(1.1, 2.55),
        alpha: between(0.18, 0.66),
        phase: between(0, Math.PI * 2),
        glyph: glyph(),
        nextGlyphAt: now + between(300, 1400),
      }));
      beams = Array.from({ length: Math.max(2, Math.round(count / 6)) }, () => ({
        x: between(field.left, field.right),
        y: between(field.top, field.bottom),
        length: between(46, 118),
        speed: between(0.1, 0.25),
        alpha: between(0.14, 0.36),
      }));
    };

    const draw = (now: number) => {
      if (!running) return;
      const elapsed = now - previous;
      if (elapsed < 1000 / 30) {
        frame = requestAnimationFrame(draw);
        return;
      }
      const delta = Math.min(32, elapsed);
      previous = now;
      context.clearRect(0, 0, width, height);

      for (const beam of beams) {
        beam.y -= beam.speed * delta;
        if (beam.y + beam.length < field.top) {
          beam.y = field.bottom + beam.length;
          beam.x = between(field.left, field.right);
        }
        const glow = context.createLinearGradient(beam.x, beam.y, beam.x, beam.y + beam.length);
        glow.addColorStop(0, `rgba(255, 243, 205, ${beam.alpha})`);
        glow.addColorStop(0.4, `rgba(236, 186, 93, ${beam.alpha * 0.7})`);
        glow.addColorStop(1, "rgba(198, 135, 59, 0)");
        context.strokeStyle = glow;
        context.lineWidth = 1;
        context.beginPath();
        context.moveTo(beam.x, beam.y);
        context.lineTo(beam.x, beam.y + beam.length);
        context.stroke();
      }

      for (const particle of particles) {
        particle.x += particle.vx * delta;
        particle.y += particle.vy * delta;
        if (particle.y > field.bottom + 12) {
          particle.y = field.top - 12;
          particle.x = between(field.left, field.right);
        }
        if (now >= particle.nextGlyphAt) {
          particle.glyph = glyph();
          particle.nextGlyphAt = now + between(300, 1400);
        }

        const pulse = 0.82 + Math.sin(now * 0.0012 + particle.phase) * 0.18;
        const alpha = particle.alpha * pulse;
        context.font = `${Math.round(8 + particle.radius * 2.4)}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillStyle = `rgba(255, 229, 174, ${alpha})`;
        context.fillText(particle.glyph, particle.x, particle.y);
      }
      frame = requestAnimationFrame(draw);
    };

    reset();
    window.addEventListener("resize", reset, { passive: true });
    frame = requestAnimationFrame(draw);
    const onVisibilityChange = () => {
      running = !document.hidden;
      if (running) {
        previous = performance.now();
        frame = requestAnimationFrame(draw);
      } else {
        cancelAnimationFrame(frame);
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", reset);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [active]);

  return <canvas ref={canvasRef} className="hero-particles" aria-hidden="true" />;
}
