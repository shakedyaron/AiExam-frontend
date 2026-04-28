import React, { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

type Props = {
  children: React.ReactNode;
  className?: string;
};

export default function FloatBox({ children, className = "" }: Props) {
  const reduce = useReducedMotion();
  const [isDesktop] = useState(() =>
    typeof window !== "undefined" &&
    window.matchMedia("(min-width: 768px)").matches,
  );

  const shouldAnimate = !reduce && isDesktop;

  return (
    <motion.div
      dir="rtl"
      className={`transform-gpu ${className}`}
      style={{ willChange: shouldAnimate ? "transform" : "auto" }}
      animate={shouldAnimate ? { y: -10 } : undefined}
      transition={
        shouldAnimate
          ? {
              duration: 1.2,
              repeat: Infinity,
              repeatType: "mirror",
              ease: "easeInOut",
            }
          : undefined
      }
    >
      {children}
    </motion.div>
  );
}
