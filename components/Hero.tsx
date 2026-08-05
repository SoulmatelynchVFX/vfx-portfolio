import { site } from "../data/site";

/**
 * 首屏 Hero：全屏自动播放的 Showreel 背景视频 + 居中姓名与头衔。
 */
export default function Hero() {
  return (
    <section className="relative flex h-svh min-h-[560px] w-full flex-col items-center justify-center overflow-hidden">
      {/* 背景视频：静音 / 自动播放 / 循环 */}
      <video
        className="absolute inset-0 h-full w-full object-cover"
        src={site.showreelVideo}
        poster={site.showreelPoster}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
      />

      {/* 上下渐变压暗：让文字清晰，并自然过渡到画廊区 */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/15 to-[#0a0a0a]" />

      {/* 居中文字 */}
      <div className="relative z-10 flex flex-col items-center px-6 text-center">
        <p className="text-[11px] uppercase tracking-[0.5em] text-white/50">
          Showreel — 2026
        </p>
        <h1 className="mt-6 text-5xl font-extralight tracking-tight text-white sm:text-7xl lg:text-8xl">
          {site.name}
        </h1>
        <p className="mt-6 text-xs uppercase tracking-[0.45em] text-white/75 sm:text-sm">
          {site.role}
        </p>
        <p className="mt-3 text-[11px] uppercase tracking-[0.3em] text-white/40">
          {site.tagline}
        </p>
      </div>

      {/* 向下滚动提示 */}
      <a
        href="#works"
        aria-label="向下滚动查看作品"
        className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-3 text-white/40 transition hover:text-white"
      >
        <span className="text-[10px] uppercase tracking-[0.4em]">Scroll</span>
        <span className="h-10 w-px animate-pulse bg-gradient-to-b from-white/70 to-transparent" />
      </a>
    </section>
  );
}
