"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface VideoPlayerProps {
  src: string;
  poster: string;
  /** 是否显示控件（由外层 Lightbox 的空闲计时器驱动） */
  controlsVisible: boolean;
  /** 播放状态变化回调（供外层判断「暂停时保持控件可见」） */
  onPlayingChange?: (playing: boolean) => void;
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "00:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/**
 * 自定义沉浸式视频播放器（替代原生 controls）：
 * 纯黑背景 + 中央播放键 + 底部进度条/时间/静音，可随外层空闲状态淡入淡出。
 */
export default function VideoPlayer({
  src,
  poster,
  controlsVisible,
  onPlayingChange,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const scrubbing = useRef(false);

  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    onPlayingChange?.(playing);
  }, [playing, onPlayingChange]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onTime = () => setCurrent(video.currentTime);
    const onMeta = () => setDuration(video.duration || 0);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);

    video.addEventListener("timeupdate", onTime);
    video.addEventListener("loadedmetadata", onMeta);
    video.addEventListener("durationchange", onMeta);
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);

    return () => {
      video.removeEventListener("timeupdate", onTime);
      video.removeEventListener("loadedmetadata", onMeta);
      video.removeEventListener("durationchange", onMeta);
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
    };
  }, []);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) void video.play();
    else video.pause();
  }, []);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  }, []);

  const seekToRatio = useCallback(
    (ratio: number) => {
      const video = videoRef.current;
      if (!video || !duration) return;
      const clamped = Math.min(1, Math.max(0, ratio));
      video.currentTime = clamped * duration;
      setCurrent(clamped * duration);
    },
    [duration]
  );

  const handleBarDown = (e: React.PointerEvent<HTMLDivElement>) => {
    scrubbing.current = true;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    const rect = e.currentTarget.getBoundingClientRect();
    seekToRatio((e.clientX - rect.left) / rect.width);
  };
  const handleBarMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!scrubbing.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    seekToRatio((e.clientX - rect.left) / rect.width);
  };
  const handleBarUp = () => {
    scrubbing.current = false;
  };

  const progress = duration ? (current / duration) * 100 : 0;
  // 暂停时控件始终保持可见
  const uiVisible = controlsVisible || !playing;

  return (
    <div className="glass-player relative aspect-video w-full overflow-hidden rounded-[22px]">
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        autoPlay
        playsInline
        preload="auto"
        onClick={togglePlay}
        className="h-full w-full object-contain"
      />

      {/* 中央大播放键（暂停时显示） */}
      <button
        type="button"
        onClick={togglePlay}
        aria-label={playing ? "暂停" : "播放"}
        className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 ${
          uiVisible && !playing ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <span className="glass-button h-16 w-16 rounded-full">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M8 5.5v13l11-6.5-11-6.5z" />
          </svg>
        </span>
      </button>

      {/* 底部玻璃控制条 */}
      <div
        className={`glass-control-bar absolute inset-x-3 bottom-3 z-10 rounded-2xl px-4 py-3 transition-opacity duration-500 ${
          uiVisible ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        {/* 进度条（可点击 / 拖拽） */}
        <div
          className="group relative mb-3 h-1.5 w-full cursor-pointer overflow-hidden rounded-full bg-white/20"
          onPointerDown={handleBarDown}
          onPointerMove={handleBarMove}
          onPointerUp={handleBarUp}
          onPointerCancel={handleBarUp}
          role="slider"
          aria-label="播放进度"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress)}
        >
          <div
            className="absolute left-0 top-0 h-full rounded-full bg-white"
            style={{ width: `${progress}%` }}
          />
          <div
            className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white opacity-0 shadow transition-opacity group-hover:opacity-100"
            style={{ left: `${progress}%` }}
          />
        </div>

        {/* 按钮行 */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={togglePlay}
            aria-label={playing ? "暂停" : "播放"}
            className="glass-button h-8 w-8 rounded-full"
          >
            {playing ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M8 5.5v13l11-6.5-11-6.5z" />
              </svg>
            )}
          </button>

          <span className="text-xs tabular-nums text-white/80">
            {formatTime(current)} / {formatTime(duration)}
          </span>

          <div className="flex-1" />

          <button
            type="button"
            onClick={toggleMute}
            aria-label={muted ? "取消静音" : "静音"}
            className="glass-button h-8 w-8 rounded-full"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M11 5L6 9H2v6h4l5 4V5z" fill="currentColor" stroke="none" />
              {muted ? (
                <path d="M22 9l-6 6M16 9l6 6" />
              ) : (
                <path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" />
              )}
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
