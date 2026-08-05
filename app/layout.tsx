import type { Metadata, Viewport } from "next";
import "./globals.css";
import { site } from "../data/site";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: `${site.name} — VFX Artist`,
  description:
    "个人视觉特效（VFX）与三维渲染作品集：Houdini 粒子与流体 / UE5 实时渲染 / Nuke 影视合成。",
  openGraph: {
    title: `${site.name} — VFX Artist`,
    description:
      "个人视觉特效（VFX）与三维渲染作品集：Houdini 粒子与流体 / UE5 实时渲染 / Nuke 影视合成。",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a0a0a",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" className="bg-[#0a0a0a]">
      <body className="min-h-screen">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
