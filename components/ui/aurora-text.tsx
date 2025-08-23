"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface AuroraTextProps {
  children: React.ReactNode;
  className?: string;
  colors?: string[];
  speed?: number;
}

export function AuroraText({
  children,
  className,
  colors = ["#FF0080", "#7928CA", "#0070F3", "#38bdf8"],
  speed = 1,
}: AuroraTextProps) {
  const gradientColors = colors.join(", ");
  
  return (
    <span
      className={cn(
        "relative inline-block bg-gradient-to-r bg-clip-text text-transparent animate-aurora",
        className
      )}
      style={{
        backgroundImage: `linear-gradient(45deg, ${gradientColors})`,
        backgroundSize: "400% 400%",
        animationDuration: `${4 / speed}s`,
      }}
    >
      {children}
    </span>
  );
}