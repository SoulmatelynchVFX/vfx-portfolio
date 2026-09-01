"use client";

import About from "../components/About";
import Hero from "../components/Hero";
import Gallery from "../components/Gallery";
import { motion } from "framer-motion";
import { projects } from "../data/projects";
import { site } from "../data/site";

export default function Home() {
  return (
    <main>
      <Hero />

      {/* 个人介绍 */}
      <About />

      {/* 作品画廊 */}
      <section
        id="works"
        className="mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-4 py-24 sm:px-6 lg:px-8"
      >
        <motion.header
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="mb-12 flex flex-wrap items-end justify-between gap-4"
        >
          <div>
            <p className="text-[11px] uppercase tracking-[0.4em] text-white/40">
              Selected Works
            </p>
            <h2 className="mt-4 text-3xl font-light tracking-tight text-white sm:text-4xl">
              作品集
            </h2>
          </div>
          <p className="text-xs tabular-nums text-white/40">
            {projects.length} 部作品 · 2024–2026
          </p>
        </motion.header>

        <Gallery />

      </section>

      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-10 text-center sm:flex-row sm:px-6 sm:text-left lg:px-8">
          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} {site.name}
          </p>
          <a
            href={`mailto:${site.email}`}
            data-cursor="link"
            className="text-xs text-white/60 underline-offset-4 transition hover:text-white hover:underline"
          >
            {site.email}
          </a>
        </div>
      </footer>
    </main>
  );
}
