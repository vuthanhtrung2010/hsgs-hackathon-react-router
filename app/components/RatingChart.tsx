"use client";

import React, { useMemo, useRef } from "react";
import {
  Chart as ChartJS,
  TimeScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
  defaults,
} from "chart.js";
import "chartjs-adapter-date-fns";
import zoomPlugin from "chartjs-plugin-zoom";
import annotationPlugin from "chartjs-plugin-annotation";
import { Line } from "react-chartjs-2";
import { useTheme } from "~/components/ThemeProvider";
import type { TooltipItem } from "chart.js";

// register Chart.js components + plugins
ChartJS.register(
  TimeScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
  zoomPlugin,
  annotationPlugin
);

// global default color (will be overridden per-theme)
defaults.color = "#666";

interface RatingChange {
  date: string;
  rating: number;
}

interface RatingChartProps {
  ratingChanges: RatingChange[];
  minRating: number;
  maxRating: number;
}

const TIERS = [
  { value: 0,   color: "rgba(153,153,153,0.2)" },
  { value: 1000,color: "rgba(0,169,0,0.2)"   },
  { value: 1300,color: "rgba(0,0,255,0.2)"   },
  { value: 1600,color: "rgba(128,0,128,0.2)" },
  { value: 1900,color: "rgba(255,177,0,0.2)" },
  { value: 2100,color: "rgba(224,0,0,0.2)"   },
  { value: 2400,color: "rgba(224,0,0,0.2)"   },
  { value: 3000,color: "rgba(224,0,0,0.2)"   },
];

export default function RatingChart({
  ratingChanges,
  minRating,
  maxRating,
}: RatingChartProps) {
  const { actualTheme } = useTheme();
  const isDark = actualTheme === "dark";
  const chartRef = useRef(null);

  // build data & find max point
  const data = useMemo(() => {
    const pts = ratingChanges.map((c) => ({
      x: new Date(c.date),
      y: c.rating,
    }));
    let maxIdx = 0;
    pts.forEach((p, i) => { if (p.y > pts[maxIdx].y) maxIdx = i; });
    return {
      datasets: [{
        label: "Rating",
        data: pts,
        borderColor: "#eab308",
        backgroundColor: "rgba(234,179,8,0.1)",
        tension: 0.2,
        pointBackgroundColor: pts.map(() => "#fff"),
        pointBorderColor: pts.map((_, i) =>
          i === maxIdx ? "#e00000" : "#eab308"
        ),
        pointBorderWidth: pts.map((_, i) => (i === maxIdx ? 3 : 2)),
        pointRadius: 4,
        fill: true,
      }],
    };
  }, [ratingChanges]);

  // create tier annotations
  const annotations = useMemo(() => {
    const limit = maxRating + 200;
    return TIERS.filter((t) => t.value <= limit).map((t, i, arr) => ({
      type: "box" as const,
      yMin: t.value,
      yMax: arr[i + 1] ? arr[i + 1].value : limit,
      backgroundColor: t.color,
      borderWidth: 0,
    }));
  }, [maxRating]);

  // chart options
  const options = useMemo(() => ({
    scales: {
      x: {
        type: "time" as const,
        time: { unit: "day" as const, tooltipFormat: "MMM dd, yyyy" },
        grid: { display: false },
        ticks: { color: isDark ? "#eee" : "#333" },
      },
      y: {
        min: Math.floor((minRating - 100) / 200) * 200,
        max: Math.ceil((maxRating + 100) / 200) * 200,
        ticks: {
          stepSize: 200,
          color: isDark ? "#eee" : "#333",
          callback: function(value: string | number) {
            return `${value}`;
          },
        },
        title: {
          display: true,
          text: "Rating",
          color: isDark ? "#eee" : "#333",
          font: { size: 14 },
        },
        grid: { display: false },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: { label: (ctx: TooltipItem<"line">) => `Rating: ${ctx.parsed.y}` },
        titleColor: isDark ? "#eee" : "#333",
        bodyColor: isDark ? "#eee" : "#333",
      },
      zoom: {
        pan: { enabled: true, mode: "x" as const },
        zoom: {
          wheel: { enabled: true },
          pinch: { enabled: true },
          mode: "x" as const,
        },
      },
      annotation: { annotations },
    },
    layout: { padding: 10 },
    responsive: true,
    maintainAspectRatio: false,
    backgroundColor: isDark ? "#222" : "#fff",
  }), [isDark, minRating, maxRating, annotations]);

  return <Line ref={chartRef} data={data} options={options} />;
}
