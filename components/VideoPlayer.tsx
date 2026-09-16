"use client";

import { useEffect, useRef, useState } from "react";

interface VideoPlayerProps { src: string; poster: string; }
function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "00:00";
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
}

export default function VideoPlayer({ src, poster }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    void video.play().catch(() => { setPlaying(false); setLoading(false); });
  }, []);

  const play = () => {
    const video = videoRef.current;
    if (!video) return;
    void video.play().catch(() => {
      setPlaying(false);
      setLoading(false);
      setError("视频无法播放，请检查网络后重试。");
    });
  };
  const retry = () => {
    const video = videoRef.current;
    if (!video) return;
    setError(""); setLoading(true); setCurrent(0); setDuration(0);
    video.src = src;
    video.load();
    play();
  };

  return (
    <div className="glass-player overflow-hidden rounded-[22px]">
      <div className="relative aspect-video w-full bg-black">
        <video
          ref={videoRef} src={src} poster={poster} playsInline muted={muted} preload="metadata"
          className="h-full w-full object-contain"
          onTimeUpdate={(e) => setCurrent(e.currentTarget.currentTime)}
          onDurationChange={(e) => setDuration(Number.isFinite(e.currentTarget.duration) ? e.currentTarget.duration : 0)}
          onLoadedData={() => setLoading(false)}
          onCanPlay={() => setLoading(false)}
          onWaiting={() => setLoading(true)}
          onPlaying={() => { setPlaying(true); setLoading(false); setError(""); }}
          onPause={() => setPlaying(false)}
          onEnded={() => setPlaying(false)}
          onError={() => { setError("视频加载失败，请检查网络后重试。"); setLoading(false); setPlaying(false); }}
        />
        {loading && !error && <p role="status" className="absolute inset-x-0 top-3 text-center text-sm text-white">视频加载中…</p>}
      </div>
      {error && <div className="bg-black px-4 py-3 text-sm text-white">
        <p role="alert">{error}</p>
        <button type="button" onClick={retry} className="glass-button mt-3 rounded-full px-4 py-2">重试播放</button>
      </div>}
      <div className="glass-control-bar px-4 py-3">
        <input type="range" aria-label="播放进度" min={0} max={duration || 0} step={0.1}
          value={current} disabled={!duration || !!error}
          aria-valuetext={`${formatTime(current)} / ${formatTime(duration)}`}
          className="mb-2 block h-6 w-full accent-white"
          onChange={(e) => { const time = Number(e.target.value); if (videoRef.current) videoRef.current.currentTime = time; setCurrent(time); }}
        />
        <div className="flex items-center gap-3">
          <button type="button" disabled={!!error} onClick={() => playing ? videoRef.current?.pause() : play()}
            aria-label={playing ? "暂停" : "播放"} className="glass-button h-11 min-w-11 rounded-full px-3 text-sm">
            {playing ? "暂停" : "播放"}
          </button>
          <span className="text-xs tabular-nums text-white/80">{formatTime(current)} / {formatTime(duration)}</span>
          <button type="button" onClick={() => setMuted(!muted)} aria-label={muted ? "取消静音" : "静音"}
            className="glass-button ml-auto h-11 shrink-0 rounded-full px-3 text-xs">{muted ? "开启声音" : "静音"}</button>
        </div>
      </div>
    </div>
  );
}
