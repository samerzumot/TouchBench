'use client';

import { memo, useMemo } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { PressureFrame } from "@/types/tactile";

type TimelineChartProps = {
  frames: PressureFrame[];
};

function flatten(frame: PressureFrame): number[] {
  return frame.reduce<number[]>((acc, row) => acc.concat(row), []);
}

function TimelineChartComponent({ frames }: TimelineChartProps) {
  const chartData = useMemo(() => {
    return frames.map((frame, index) => {
      const values = flatten(frame);
      const mean =
        values.reduce((sum, value) => sum + value, 0) / (values.length || 1);
      const variance =
        values.reduce((sum, value) => sum + (value - mean) ** 2, 0) /
        (values.length || 1);

      return {
        frame: index + 1,
        mean: Number(mean.toFixed(3)),
        variance: Number(variance.toFixed(4)),
        max: Number(Math.max(...values).toFixed(3)),
      };
    });
  }, [frames]);

  if (!chartData.length) {
    return null;
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={chartData} margin={{ top: 16, right: 24, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="4 8" strokeOpacity={0.4} />
        <XAxis dataKey="frame" tickLine={false} axisLine={false} />
        <YAxis
          domain={[0, 1]}
          tickFormatter={(value) => value.toFixed(1)}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          contentStyle={{
            borderRadius: 12,
            borderColor: "#e2e8f0",
            boxShadow: "0 10px 30px rgba(15, 23, 42, 0.1)",
          }}
          labelFormatter={(value) => `Frame ${value}`}
          formatter={(value, name) => [value, name === "mean" ? "Mean pressure" : name]}
        />
        <Line
          type="monotone"
          dataKey="mean"
          stroke="#1d4ed8"
          strokeWidth={2}
          dot={{ r: 3 }}
          activeDot={{ r: 6 }}
        />
        <Line
          type="monotone"
          dataKey="max"
          stroke="#dc2626"
          strokeWidth={1.5}
          dot={false}
          strokeDasharray="6 6"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

const TimelineChart = memo(TimelineChartComponent);

export default TimelineChart;
