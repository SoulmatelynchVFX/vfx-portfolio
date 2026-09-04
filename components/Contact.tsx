"use client";

import { motion } from "framer-motion";
import { site } from "../data/site";

export default function Contact() {
  return (
    <section id="contact" className="contact-section" aria-labelledby="contact-title">
      <div className="contact-inner">
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="contact-eyebrow"
        >
          接受精选合作
        </motion.p>
        <motion.h2
          id="contact-title"
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ delay: 0.08, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          让下一个镜头，
          <span>比想象更有力。</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ delay: 0.16, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="contact-copy"
        >
          广告、游戏过场、实时影像与技术美术合作，欢迎聊聊。
        </motion.p>
        <motion.a
          href={`mailto:${site.email}`}
          data-cursor="link"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ delay: 0.24, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="contact-email"
        >
          <span>{site.email}</span>
          <span aria-hidden="true">↗</span>
        </motion.a>
      </div>
    </section>
  );
}
