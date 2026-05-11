"use client";

import { HTMLMotionProps, motion, useReducedMotion } from "framer-motion";

type SectionRevealProps = {
  delay?: number;
} & HTMLMotionProps<"section">;

export function SectionReveal({ children, delay = 0, ...props }: SectionRevealProps) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.section
      {...props}
      initial={reducedMotion ? false : { opacity: 0, y: 28 }}
      whileInView={reducedMotion ? {} : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: 0.7, ease: "easeOut", delay }}
    >
      {children}
    </motion.section>
  );
}
