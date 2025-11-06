'use client';

import { memo } from "react";
import { interpolateTurbo } from "d3-interpolate";
import { scaleSequential } from "d3-scale";

import type { PressureFrame } from "@/types/tactile";

const colorScale = scaleSequential(interpolateTurbo).domain([0, 1]);

type HeatmapProps = {
  data: PressureFrame;
  cellSize?: number;
  gap?: number;
  showValues?: boolean;
};

function HeatmapComponent({
  data,
  cellSize = 52,
  gap = 6,
  showValues = false,
}: HeatmapProps) {
  const rows = data.length;
  const cols = data[0]?.length ?? 0;
  const width = cols * cellSize + (cols - 1) * gap;
  const height = rows * cellSize + (rows - 1) * gap;

  return (
    <svg
      width={width}
      height={height}
      role="img"
      aria-label="Tactile pressure heatmap"
      className="overflow-visible"
    >
      {data.map((row, rowIndex) =>
        row.map((value, colIndex) => {
          const x = colIndex * (cellSize + gap);
          const y = rowIndex * (cellSize + gap);
          const color = colorScale(value ?? 0);

          return (
            <g key={`${rowIndex}-${colIndex}`}>
              <rect
                x={x}
                y={y}
                width={cellSize}
                height={cellSize}
                rx={10}
                ry={10}
                fill={color}
                stroke="#0f172a"
                strokeOpacity={0.12}
              >
                <title>
                  Row {rowIndex + 1}, Column {colIndex + 1}: {value.toFixed(3)}
                </title>
              </rect>
              {showValues && (
                <text
                  x={x + cellSize / 2}
                  y={y + cellSize / 2}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={12}
                  fill="#0f172a"
                  opacity={0.8}
                >
                  {value.toFixed(2)}
                </text>
              )}
            </g>
          );
        }),
      )}
    </svg>
  );
}

const Heatmap = memo(HeatmapComponent);

export default Heatmap;
