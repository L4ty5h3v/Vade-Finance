"use client";

import { motion, useReducedMotion } from "framer-motion";

type SloganRevealProps = {
  text: string;
  className?: string;
  onComplete?: () => void;
};

export default function SloganReveal({ text, className, onComplete }: SloganRevealProps) {
  const reducedMotion = useReducedMotion();
  const words = text.split(" ");
  const getAccentClass = (word: string) => {
    const cleanWord = word.toLowerCase().replace(/[^a-z]/g, "");
    return cleanWord === "liquidity"
      ? "text-[#9fd1ff] [text-shadow:0_0_24px_rgba(83,156,255,0.28)]"
      : "";
  };

  if (reducedMotion) {
    return (
      <h1 className={className}>
        {text.split(" ").map((word, idx) => (
          <span key={`${word}-${idx}`} className={`mr-[0.4ch] inline-block ${getAccentClass(word)}`}>
            {word}
          </span>
        ))}
      </h1>
    );
  }

  return (
    <motion.h1
      className={className}
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: {
          transition: {
            staggerChildren: 0.08,
          },
        },
      }}
      onAnimationComplete={onComplete}
    >
      {words.map((word, idx) => (
        <motion.span
          key={`${word}-${idx}`}
          className={`inline-block mr-[0.4ch] ${getAccentClass(word)}`}
          variants={{
            hidden: {
              opacity: 0,
              y: 24,
              filter: "blur(10px)",
            },
            show: {
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
              transition: {
                duration: 0.7,
                ease: "easeOut",
              },
            },
          }}
        >
          {word}
        </motion.span>
      ))}
    </motion.h1>
  );
}
