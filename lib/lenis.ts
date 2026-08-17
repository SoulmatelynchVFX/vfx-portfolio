import type Lenis from "lenis";

/**
 * 全局 Lenis 实例单例。
 * SmoothScroll 初始化时写入；Lightbox 打开时 stop、关闭时 start，
 * 避免全屏播放器打开时页面在后台滚动。
 */
let lenis: Lenis | null = null;

export function setLenis(instance: Lenis | null) {
  lenis = instance;
}

export function getLenis(): Lenis | null {
  return lenis;
}
