import { useEffect, useState } from "react";
import { useTheme } from "~/components/ThemeProvider";

interface RatingChange {
  date: string;
  rating: number;
}

interface RatingChartProps {
  ratingChanges: RatingChange[];
  minRating: number;
  maxRating: number;
}

// Client-side only chart component
export default function RatingChart({
  ratingChanges,
  minRating,
  maxRating,
}: RatingChartProps) {
  const [ChartComponent, setChartComponent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { actualTheme } = useTheme();

  useEffect(() => {
    let isMounted = true;

    const loadChart = async () => {
      if (typeof window === "undefined") return;

      try {
        // Dynamic imports to avoid SSR issues
        const [chartModule, reactChartModule, zoomModule, annotationModule] =
          await Promise.all([
            import("chart.js"),
            import("react-chartjs-2"),
            import("chartjs-plugin-zoom"),
            import("chartjs-plugin-annotation"),
          ]);

        // @ts-expect-error no types for date-fns adapter
        await import("chartjs-adapter-date-fns");

        const {
          Chart: ChartJS,
          TimeScale,
          LinearScale,
          PointElement,
          LineElement,
          Tooltip,
          Legend,
          Filler,
          defaults,
        } = chartModule;

        const { Line } = reactChartModule;

        // Register Chart.js components
        ChartJS.register(
          TimeScale,
          LinearScale,
          PointElement,
          LineElement,
          Tooltip,
          Legend,
          Filler,
          zoomModule.default,
          annotationModule.default,
        );

        // Set theme-based defaults
        defaults.color = actualTheme === "dark" ? "#e5e5e5" : "#666";
        defaults.backgroundColor =
          actualTheme === "dark" ? "#262626" : "#ffffff";

        // Create the chart component
        const ChartComponent = ({
          ratingChanges,
          minRating,
          maxRating,
        }: RatingChartProps) => {
          const data = {
            datasets: [
              {
                label: "Rating",
                data: ratingChanges.map((change) => ({
                  x: new Date(change.date).getTime(),
                  y: change.rating,
                })),
                borderColor: actualTheme === "dark" ? "#60a5fa" : "#3b82f6",
                backgroundColor:
                  actualTheme === "dark"
                    ? "rgba(96, 165, 250, 0.1)"
                    : "rgba(59, 130, 246, 0.1)",
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointHoverRadius: 6,
              },
            ],
          };

          const options = {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
              intersect: false,
              mode: "index" as const,
            },
            scales: {
              x: {
                type: "time" as const,
                time: {
                  tooltipFormat: "MMM dd, yyyy HH:mm",
                },
                grid: {
                  color:
                    actualTheme === "dark"
                      ? "rgba(255, 255, 255, 0.1)"
                      : "rgba(0, 0, 0, 0.1)",
                },
                ticks: {
                  color: actualTheme === "dark" ? "#e5e5e5" : "#666",
                },
              },
              y: {
                min: Math.max(0, minRating - 100),
                max: maxRating + 100,
                grid: {
                  color:
                    actualTheme === "dark"
                      ? "rgba(255, 255, 255, 0.1)"
                      : "rgba(0, 0, 0, 0.1)",
                },
                ticks: {
                  color: actualTheme === "dark" ? "#e5e5e5" : "#666",
                },
              },
            },
            plugins: {
              legend: {
                display: false,
              },
              tooltip: {
                backgroundColor: actualTheme === "dark" ? "#1f2937" : "#ffffff",
                titleColor: actualTheme === "dark" ? "#f9fafb" : "#111827",
                bodyColor: actualTheme === "dark" ? "#e5e7eb" : "#374151",
                borderColor: actualTheme === "dark" ? "#374151" : "#d1d5db",
                borderWidth: 1,
                callbacks: {
                  title: (context: any[]) => {
                    const index = context[0].dataIndex;
                    const change = ratingChanges[index];
                    return new Date(change.date).toLocaleDateString();
                  },
                  label: (context: any) => {
                    return `Rating: ${context.parsed.y}`;
                  },
                },
              },
              zoom: {
                pan: {
                  enabled: true,
                  mode: "x" as const,
                },
                zoom: {
                  wheel: {
                    enabled: true,
                  },
                  pinch: {
                    enabled: true,
                  },
                  mode: "x" as const,
                },
              },
            },
          };

          return <Line data={data} options={options} />;
        };

        if (isMounted) {
          setChartComponent(() => ChartComponent);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Failed to load chart:", error);
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadChart();

    return () => {
      isMounted = false;
    };
  }, [actualTheme, ratingChanges, minRating, maxRating]);

  if (isLoading) {
    return (
      <div className="w-full h-[300px] bg-muted/20 rounded-md border border-border flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading chart...</p>
      </div>
    );
  }

  if (!ChartComponent) {
    return (
      <div className="w-full h-[300px] bg-muted/20 rounded-md border border-border flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Failed to load chart</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[300px]">
      <ChartComponent
        ratingChanges={ratingChanges}
        minRating={minRating}
        maxRating={maxRating}
      />
    </div>
  );
}
