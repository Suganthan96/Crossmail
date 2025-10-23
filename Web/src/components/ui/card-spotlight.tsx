"use client";
import React, { useRef, useState } from "react";
import { cn } from "@/lib/utils";

export const CardSpotlight = ({
  children,
  radius = 350,
  className,
  ...props
}: {
  radius?: number;
  color?: string;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>) => {
  const divRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current || isFocused) return;

    const div = divRef.current;
    const rect = div.getBoundingClientRect();

    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleFocus = () => {
    setIsFocused(true);
    setOpacity(1);
  };

  const handleBlur = () => {
    setIsFocused(false);
    setOpacity(0);
  };

  const handleMouseEnter = () => {
    setOpacity(1);
  };

  const handleMouseLeave = () => {
    setOpacity(0);
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "relative flex items-center justify-center overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md p-8",
        className
      )}
      {...props}
    >
      {/* Spotlight overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500"
        style={{
          opacity: opacity,
          background: `radial-gradient(${radius}px circle at ${position.x}px ${position.y}px, rgba(91, 71, 219, 0.4), rgba(147, 51, 234, 0.2) 40%, transparent 80%)`,
        }}
      />
      
      {/* Content */}
      <div className="relative z-20 w-full">
        {children}
      </div>
    </div>
  );
};
