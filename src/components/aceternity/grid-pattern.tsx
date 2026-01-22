"use client";
import { cn } from "@/lib/utils";

export const GridPattern = ({
  width = 40,
  height = 40,
  x = -1,
  y = -1,
  strokeDasharray = "0",
  className,
  ...props
}: {
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  strokeDasharray?: string;
  className?: string;
  [key: string]: any;
}) => {
  return (
    <svg
      className={cn(
        "pointer-events-none absolute inset-0 h-full w-full stroke-white/10",
        className
      )}
      {...props}
    >
      <defs>
        <pattern
          id="grid-pattern"
          width={width}
          height={height}
          patternUnits="userSpaceOnUse"
          x={x}
          y={y}
        >
          <path
            d={`M.5 ${height}V.5H${width}`}
            fill="none"
            strokeDasharray={strokeDasharray}
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid-pattern)" />
    </svg>
  );
};
