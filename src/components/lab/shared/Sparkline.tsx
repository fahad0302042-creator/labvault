"use client";

import { useMemo } from "react";

type SparklineProps = {
  /** Data points — last N values */
  data: number[];
  /** Width in pixels */
  width?: number;
  /** Height in pixels */
  height?: number;
  /** Stroke color — defaults to current text color */
  color?: string;
  /** Fill under the line? */
  fill?: boolean;
  className?: string;
};

/**
 * Minimal inline SVG sparkline — no dependencies.
 * Renders a smooth line from the data points, scaled to fit.
 */
export function Sparkline({
  data,
  width = 80,
  height = 24,
  fill = true,
  className,
}: SparklineProps) {
  const { path, areaPath } = useMemo(() => {
    if (data.length < 2) return { path: "", areaPath: "" };
    const max = Math.max(...data, 1);
    const min = Math.min(...data, 0);
    const range = max - min || 1;
    const stepX = width / (data.length - 1);

    const points = data.map((v, i) => {
      const x = i * stepX;
      const y = height - ((v - min) / range) * (height - 4) - 2;
      return [x, y] as const;
    });

    const path = points
      .map(([x, y], i) => (i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`))
      .join(" ");

    const areaPath = `${path} L ${width} ${height} L 0 ${height} Z`;

    return { path, areaPath };
  }, [data, width, height]);

  if (data.length < 2) {
    return <div style={{ width, height }} className={className} />;
  }

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      fill="none"
    >
      {fill && (
        <path
          d={areaPath}
          fill="currentColor"
          opacity={0.12}
        />
      )}
      <path
        d={path}
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Dot at the end */}
      <circle
        cx={width}
        cy={height - ((data[data.length - 1] - Math.min(...data, 0)) / (Math.max(...data, 1) - Math.min(...data, 0) || 1)) * (height - 4) - 2}
        r={2}
        fill="currentColor"
      />
    </svg>
  );
}
