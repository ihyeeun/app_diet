import { useId } from "react";
import type { TooltipContentProps } from "recharts";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import styles from "@/features/profile/components/WeeklyRecordChart.module.css";

type WeeklyRecordChartData = {
  label: string;
  target?: number;
  value: number | null;
};

type WeeklyRecordChartProps = {
  data: WeeklyRecordChartData[];
  unit: string;
  yTicks: number[];
};

type AxisTickProps = {
  payload?: {
    value: number | string;
  };
  x?: number;
  y?: number;
};

type CustomTooltipProps = TooltipContentProps & {
  unit: string;
};

function XAxisTick({ payload, x = 0, y = 0 }: AxisTickProps) {
  return (
    <text className={styles.xAxisTick} textAnchor="middle" x={x} y={y + 14}>
      {payload?.value}
    </text>
  );
}

function YAxisTick({ payload, x = 0, y = 0 }: AxisTickProps) {
  return (
    <text className={styles.yAxisTick} textAnchor="end" x={x - 3} y={y + 4}>
      {payload?.value}
    </text>
  );
}

function CustomTooltip({ active, payload, label, unit }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const first = payload[0]?.value;
  const valueText =
    typeof first === "number" ? `${first.toLocaleString("ko-KR")} ${unit}` : `- ${unit}`;

  return (
    <div className={styles.tooltip}>
      <p className={styles.tooltipLabel}>{label}</p>
      <p className={styles.tooltipValue}>{valueText}</p>
    </div>
  );
}

export default function WeeklyRecordChart({ data, unit, yTicks }: WeeklyRecordChartProps) {
  const gradientId = useId().replace(/:/g, "");
  const targetGradientId = `${gradientId}-target`;
  const yMax = yTicks[yTicks.length - 1] ?? 100;
  const target = data[0]?.target;
  const chartData =
    typeof target === "number"
      ? data.map((point) => ({
          ...point,
          targetValue: target,
        }))
      : data;

  return (
    <div className={styles.chartContainer}>
      <ResponsiveContainer>
        <AreaChart accessibilityLayer={false} data={chartData}>
          <defs>
            <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="var(--chart-current)" stopOpacity={1} />
              <stop offset="100%" stopColor="var(--chart-current)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id={targetGradientId} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="var(--chart-target)" stopOpacity={1} />
              <stop offset="100%" stopColor="var(--chart-target)" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid stroke="var(--chart-grid)" strokeWidth={1} />

          <XAxis
            axisLine={false}
            dataKey="label"
            minTickGap={0}
            tick={<XAxisTick />}
            tickLine={false}
            interval={0}
          />

          <YAxis
            allowDecimals={false}
            axisLine={false}
            domain={[0, yMax]}
            tick={<YAxisTick />}
            tickLine={false}
            ticks={yTicks}
            width={35}
          />

          <Tooltip
            content={(props) => <CustomTooltip {...props} unit={unit} />}
            cursor={{ fill: "rgb(0 0 0 / 6%)" }}
            wrapperClassName={styles.tooltipWrapper}
          />

          {typeof target === "number" && (
            <Area
              activeDot={false}
              connectNulls
              dataKey="targetValue"
              dot={false}
              fill={`url(#${targetGradientId})`}
              isAnimationActive={false}
              stroke="var(--chart-target)"
              strokeWidth={2}
              type="linear"
            />
          )}

          <Area
            dataKey="value"
            fill={`url(#${gradientId})`}
            isAnimationActive={false}
            stroke="var(--chart-current)"
            strokeWidth={2}
            type="monotone"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
