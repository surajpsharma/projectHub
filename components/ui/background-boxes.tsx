"use client";
import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const BoxesCore = ({ className, ...rest }: { className?: string }) => {
  const colors = [
    "rgba(59, 130, 246, 0.1)", // blue
    "rgba(147, 51, 234, 0.1)", // purple
    "rgba(236, 72, 153, 0.1)", // pink
    "rgba(34, 197, 94, 0.1)",  // green
    "rgba(251, 191, 36, 0.1)", // yellow
    "rgba(239, 68, 68, 0.1)",  // red
  ];

  const getRandomColor = () => {
    return colors[Math.floor(Math.random() * colors.length)];
  };

  return (
    <div
      className={cn(
        "absolute inset-0 w-full h-full overflow-hidden opacity-40",
        className
      )}
      style={{
        backgroundImage: `
          linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
      }}
      {...rest}
    >
      <div className="absolute inset-0">
        {Array.from({ length: 200 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-12 h-12 border border-gray-300/30 dark:border-gray-600/30 rounded-lg bg-white/20 dark:bg-gray-800/20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            whileHover={{
              backgroundColor: getRandomColor(),
              scale: 1.1,
              transition: { duration: 0.3 },
            }}
            animate={{
              opacity: [0.2, 0.5, 0.2],
              scale: [1, 1.02, 1],
              transition: {
                duration: 4 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 3,
              },
            }}
          />
        ))}
      </div>
    </div>
  );
};

export const Boxes = React.memo(BoxesCore);
