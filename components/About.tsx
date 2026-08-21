"use client";

import { motion, type Variants } from "framer-motion";
import { site } from "../data/site";

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 40, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] },
  },
};

/**
 * 个人介绍页（占位效果）：
 * - 左侧头像 + 姓名 / 头衔 / 经历 / 座右铭
 * - 右侧状态标签 + 简介 + 技能标签 + 联系按钮
 * - 延续暗黑极简与液态玻璃材质语言
 *
 * 位置：Hero 与 Works 之间，先建立人格信任再看作品。
 */
export default function About() {
  const { name, role, email, about } = site;

  return (
    <section
      id="about"
      className="relative flex min-h-screen items-center bg-[#0a0a0a] py-36 sm:py-52"
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12 lg:gap-16">
          {/* 左侧：头像与身份 */}
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: false, amount: 0.2 }}
            className="lg:col-span-5"
          >
            <motion.div
              variants={item}
              className="glass-panel inline-block w-auto max-w-full rounded-2xl p-2"
            >
              <div className="relative aspect-square w-40 overflow-hidden rounded-xl bg-[#111] sm:w-52">
                {about.avatar ? (
                  <img
                    src={about.avatar}
                    alt={name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-white/10 to-white/[0.02] text-center">
                    <span className="font-ios text-3xl font-light text-white/30">
                      头像
                    </span>
                    <span className="font-ios mt-2 text-[10px] uppercase tracking-[0.2em] text-white/30">
                      占位符
                    </span>
                  </div>
                )}
              </div>
            </motion.div>

            <motion.h2
              variants={item}
              className="font-ios mt-8 text-3xl font-light tracking-tight text-white sm:text-4xl"
            >
              {name}
            </motion.h2>
            <motion.p
              variants={item}
              className="font-ios mt-2 text-xs uppercase tracking-[0.3em] text-white/50"
            >
              {role}
            </motion.p>
            <motion.p
              variants={item}
              className="font-ios mt-3 text-sm text-white/60"
            >
              {about.experience}
            </motion.p>
            <motion.p
              variants={item}
              className="font-ios mt-6 text-sm italic text-white/50"
            >
              “{about.motto}”
            </motion.p>
          </motion.div>

          {/* 右侧：状态、简介、技能 */}
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: false, amount: 0.2 }}
            className="lg:col-span-7"
          >
            <motion.div
              variants={item}
              className="glass-tag inline-flex items-center gap-2 rounded-full px-4 py-2"
            >
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
              <span className="font-ios text-xs tracking-wide text-white/90">
                {about.status}
              </span>
            </motion.div>

            <motion.div variants={item} className="mt-10">
              <p className="text-[11px] uppercase tracking-[0.4em] text-white/40">
                简介
              </p>
              <div className="mt-4 space-y-4 text-sm leading-relaxed text-white/70">
                {about.bio.map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
            </motion.div>

            <motion.div variants={item} className="mt-10">
              <p className="text-[11px] uppercase tracking-[0.4em] text-white/40">
                技能
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {about.skills.map((skill) => (
                  <span
                    key={skill}
                    className="glass-tag rounded-full px-3 py-1.5 text-xs text-white/80"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </motion.div>

            <motion.div variants={item} className="mt-10">
              <a
                href={`mailto:${email}`}
                data-cursor="link"
                className="glass-button inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs tracking-wide"
              >
                <span>联系我</span>
                <span aria-hidden="true">→</span>
              </a>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
