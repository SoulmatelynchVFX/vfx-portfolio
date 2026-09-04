"use client";

import { motion } from "framer-motion";
import { site } from "../data/site";

const headlineLines = ["让下一个镜头", "比想象更有力"];

const headline: Parameters<typeof motion.h2>[0]["variants"] = {
  hidden: {},
  show: { transition: { staggerChildren: 0.045, delayChildren: 0.12 } },
};

const character: Parameters<typeof motion.span>[0]["variants"] = {
  hidden: { y: "115%", opacity: 0, filter: "blur(5px)" },
  show: {
    y: "0%",
    opacity: 1,
    filter: "blur(0px)",
    transition: { duration: 0.78, ease: [0.16, 1, 0.3, 1] },
  },
};

export default function Contact() {
  return (
    <section id="contact" className="contact-section" aria-labelledby="contact-title">
      <div className="contact-inner">
        <motion.h2
          id="contact-title"
          variants={headline}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.35 }}
          className="contact-title-reveal"
        >
          {headlineLines.map((line, lineIndex) => (
            <span key={line} className="contact-title-line">
              {Array.from(line).map((glyph, glyphIndex) => (
                <span key={`${glyph}-${glyphIndex}`} className="contact-title-mask">
                  <motion.span variants={character} className="contact-title-glyph">
                    {glyph}
                  </motion.span>
                </span>
              ))}
            </span>
          ))}
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
