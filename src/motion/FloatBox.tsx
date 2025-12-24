import React from "react";
import { motion, useReducedMotion } from "framer-motion";

type Props = {
  children: React.ReactNode;
  className?: string;
};

export default function FloatBox({ children, className = "" }: Props) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      dir="rtl"
      className={`transform-gpu ${className}`}
      style={{ willChange: "transform" }}
      animate={reduce ? undefined : { y: -10 }}
      transition={
        reduce
          ? undefined
          : {
              duration: 1.2,
              repeat: Infinity,
              repeatType: "mirror",
              ease: "easeInOut",
            }
      }
    >
      {children}
    </motion.div>
  );
}
