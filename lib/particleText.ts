/**
 * ParticleText —— 框架无关的「粒子汇聚成字 / 淡出散回粒子」Canvas 2D 引擎。
 *
 * 原理（零依赖）：
 *  1. 把文字画到离屏 canvas，用 getImageData 读取像素，收集 alpha 超过阈值
 *     的像素点作为「文字目标坐标」；
 *  2. 每个粒子从随机散点出发，用弹簧/插值每帧逼近目标点 → 文字浮现；
 *  3. 切换到 disperse 时，目标改为随机散点 + 透明度衰减 → 文字化回粒子。
 *
 * 用法：
 *   const pt = new ParticleText(canvas, { text: "Seal Wang", fontSize: 120 });
 *   pt.converge(); // 汇聚成字
 *   pt.disperse(); // 散回粒子
 *   pt.destroy();  // 卸载时清理
 */

export interface ParticleTextOptions {
  /** 要汇聚成的文字（支持中文） */
  text: string;
  /** 可选第二行小字（暂未使用，预留） */
  subText?: string;
  /** 主文字字号（CSS px，未提供时按画布尺寸自适应） */
  fontSize?: number;
  /** 第二行小字字号（CSS px） */
  subFontSize?: number;
  /** 粒子颜色 */
  color?: string;
  /** 采样步长（px，越小粒子越多越密） */
  density?: number;
  /** 粒子数量上限（大屏防卡顿） */
  maxParticles?: number;
  /** 鼠标排斥半径（CSS px） */
  repelRadius?: number;
  /** 鼠标排斥强度，0 关闭 */
  repelStrength?: number;
  /** 是否用 additive 叠加发光（暗底更亮） */
  glow?: boolean;
  /** 字重 */
  fontWeight?: number;
  /** 汇聚/散开速度因子（1 为默认，<1 减慢，>1 加快） */
  speed?: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  tx: number; // 汇聚目标（文字像素）
  ty: number;
  dx: number; // 散开目标
  dy: number;
  size: number;
  alpha: number;
  tAlpha: number;
}

export class ParticleText {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private opts: Required<ParticleTextOptions>;
  private particles: Particle[] = [];
  private mode: "converge" | "disperse" = "converge";
  private raf = 0;
  private dpr = 1;
  private W = 0;
  private H = 0;
  private mouse = { x: -9999, y: -9999, active: false };
  private ro: ResizeObserver | null = null;
  private destroyed = false;

  constructor(canvas: HTMLCanvasElement, opts: ParticleTextOptions) {
    this.canvas = canvas;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("ParticleText: 无法获取 2D 上下文");
    this.ctx = ctx;
    this.opts = {
      text: opts.text,
      subText: opts.subText ?? "",
      fontSize: opts.fontSize ?? 0,
      subFontSize: opts.subFontSize ?? 0,
      color: opts.color ?? "#ffffff",
      density: opts.density ?? 5,
      maxParticles: opts.maxParticles ?? 7000,
      repelRadius: opts.repelRadius ?? 110,
      repelStrength: opts.repelStrength ?? 2.2,
      glow: opts.glow ?? true,
      fontWeight: opts.fontWeight ?? 700,
      speed: opts.speed ?? 1,
    };

    this.resize = this.resize.bind(this);
    this.frame = this.frame.bind(this);
    this.onMove = this.onMove.bind(this);
    this.onOut = this.onOut.bind(this);

    window.addEventListener("resize", this.resize);
    window.addEventListener("mousemove", this.onMove);
    window.addEventListener("mouseout", this.onOut);

    if (typeof ResizeObserver !== "undefined") {
      this.ro = new ResizeObserver(() => this.resize());
      this.ro.observe(canvas);
    }

    this.resize();
    this.raf = requestAnimationFrame(this.frame);
  }

  /** 采样文字像素点作为目标坐标 */
  private sample(): { x: number; y: number }[] {
    const { text, subText, density, maxParticles, fontWeight } = this.opts;
    const off = document.createElement("canvas");
    off.width = this.W;
    off.height = this.H;
    const o = off.getContext("2d");
    if (!o) return [];
    o.fillStyle = "#fff";
    o.textAlign = "center";
    o.textBaseline = "middle";

    const cssW = this.W / this.dpr;
    const cssH = this.H / this.dpr;
    const fs =
      (this.opts.fontSize || Math.min(cssW, cssH) * 0.16) * this.dpr;

    const hasSub = !!subText;
    o.font = `${fontWeight} ${fs}px -apple-system, "SF Pro Display", "Helvetica Neue", "Segoe UI", system-ui, Arial, sans-serif`;
    o.fillText(text, this.W / 2, this.H / 2 - (hasSub ? fs * 0.3 : 0));
    if (hasSub) {
      const sfs = (this.opts.subFontSize || this.opts.fontSize! * 0.42) * this.dpr;
      o.font = `500 ${sfs}px -apple-system, "SF Pro Display", Arial, sans-serif`;
      o.fillText(subText, this.W / 2, this.H / 2 + fs * 0.55);
    }

    const data = o.getImageData(0, 0, this.W, this.H).data;
    const step = Math.max(3, Math.round(density * this.dpr));
    const pts: { x: number; y: number }[] = [];
    for (let y = 0; y < this.H; y += step) {
      for (let x = 0; x < this.W; x += step) {
        if (data[(y * this.W + x) * 4 + 3] > 128) pts.push({ x, y });
      }
    }
    if (pts.length > maxParticles) {
      const out: { x: number; y: number }[] = [];
      const stride = pts.length / maxParticles;
      for (let i = 0; i < maxParticles; i++) out.push(pts[Math.floor(i * stride)]);
      return out;
    }
    return pts;
  }

  private build() {
    const pts = this.sample();
    this.particles = pts.map((t) => {
      const a = Math.random() * Math.PI * 2;
      const r = Math.max(this.W, this.H) * (0.4 + Math.random() * 0.5);
      return {
        x: this.W / 2 + Math.cos(a) * r,
        y: this.H / 2 + Math.sin(a) * r,
        vx: 0,
        vy: 0,
        tx: t.x,
        ty: t.y,
        dx: Math.random() * this.W,
        dy: Math.random() * this.H,
        size: (Math.random() * 1.1 + 0.5) * this.dpr,
        alpha: 0,
        tAlpha: 0.85,
      };
    });
  }

  private resize() {
    if (this.destroyed) return;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = this.canvas.getBoundingClientRect();
    const w = Math.max(1, Math.floor((rect.width || this.canvas.clientWidth || window.innerWidth) * this.dpr));
    const h = Math.max(1, Math.floor((rect.height || this.canvas.clientHeight || window.innerHeight) * this.dpr));
    if (w === this.W && h === this.H) return;
    this.W = w;
    this.H = h;
    this.canvas.width = w;
    this.canvas.height = h;
    this.build();
  }

  converge() {
    this.mode = "converge";
  }
  disperse() {
    this.mode = "disperse";
  }
  setMode(mode: "converge" | "disperse") {
    this.mode = mode;
  }

  private onMove(e: MouseEvent) {
    const rect = this.canvas.getBoundingClientRect();
    this.mouse.x = (e.clientX - rect.left) * this.dpr;
    this.mouse.y = (e.clientY - rect.top) * this.dpr;
    this.mouse.active = true;
  }
  private onOut() {
    this.mouse.active = false;
  }

  private frame() {
    if (this.destroyed) return;
    const c = this.ctx;
    c.clearRect(0, 0, this.W, this.H);
    if (this.opts.glow) c.globalCompositeOperation = "lighter";
    const k = (this.mode === "converge" ? 0.022 : 0.012) * this.opts.speed;
    const damp = 0.9;
    const R = this.opts.repelRadius * this.dpr;
    const col = this.opts.color;
    for (const p of this.particles) {
      const tgx = this.mode === "converge" ? p.tx : p.dx;
      const tgy = this.mode === "converge" ? p.ty : p.dy;
      p.vx += (tgx - p.x) * k;
      p.vy += (tgy - p.y) * k;
      if (this.opts.repelStrength > 0 && this.mouse.active) {
        const ddx = p.x - this.mouse.x;
        const ddy = p.y - this.mouse.y;
        const d2 = ddx * ddx + ddy * ddy;
        if (d2 < R * R) {
          const d = Math.sqrt(d2) || 1;
          const f = ((R - d) / R) * this.opts.repelStrength;
          p.vx += (ddx / d) * f;
          p.vy += (ddy / d) * f;
        }
      }
      p.vx *= damp;
      p.vy *= damp;
      p.x += p.vx;
      p.y += p.vy;
      p.tAlpha = this.mode === "converge" ? 0.85 : 0.2;
      p.alpha += (p.tAlpha - p.alpha) * 0.05;
      c.globalAlpha = p.alpha;
      c.fillStyle = col;
      c.beginPath();
      c.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      c.fill();
    }
    c.globalAlpha = 1;
    c.globalCompositeOperation = "source-over";
    this.raf = requestAnimationFrame(this.frame);
  }

  destroy() {
    this.destroyed = true;
    cancelAnimationFrame(this.raf);
    window.removeEventListener("resize", this.resize);
    window.removeEventListener("mousemove", this.onMove);
    window.removeEventListener("mouseout", this.onOut);
    if (this.ro) {
      this.ro.disconnect();
      this.ro = null;
    }
  }
}
