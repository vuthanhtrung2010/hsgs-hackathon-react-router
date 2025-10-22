import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { getRatingClass, type RatingThresholds } from "~/lib/rating";

interface ClusterRadarChartProps {
  clusters: Record<string, any>; // Simplified clusters structure
  userName: string;
  thresholds?: RatingThresholds;
}

// Format cluster names for display
const formatClusterName = (clusterKey: string): string => {
  return clusterKey
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

// Custom tooltip for radar chart
const CustomTooltip = ({
  active,
  payload,
  label,
  thresholds,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
  thresholds?: RatingThresholds;
}) => {
  if (active && payload && payload.length) {
    const value = payload[0].value;
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
        <p className="text-sm font-medium">{label}</p>
        <p className={`text-lg font-bold ${getRatingClass(value, thresholds)}`}>
          {Math.round(value)}
        </p>
      </div>
    );
  }
  return null;
};

export default function ClusterRadarChart({
  clusters,
  userName,
  thresholds,
}: ClusterRadarChartProps) {
  // Check if clusters is empty or null
  const hasSkillsData = clusters && Object.keys(clusters).length > 0;

  // Transform clusters data for radar chart
  const radarData = hasSkillsData
    ? Object.entries(clusters).map(([key, value]) => ({
        subject: formatClusterName(key),
        rating: Math.round(value || 0),
        fullMark: 2400, // Max rating for reference
      }))
    : [];

  // Calculate average rating across all clusters
  const averageRating = hasSkillsData
    ? Math.round(
        Object.values(clusters).reduce(
          (sum, rating) => sum + (rating || 0),
          0,
        ) / Object.keys(clusters).length,
      )
    : 0;

  // Show a message when no skills data is available
  if (!hasSkillsData) {
    return (
      <div className="bg-card border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Skills Analysis</h2>
          <div className="text-sm text-muted-foreground">
            Avg: <span className="font-bold text-muted-foreground">N/A</span>
          </div>
        </div>
        <div className="w-full h-[400px] flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <p className="text-lg mb-2">No skills data available</p>
            <p className="text-sm">
              Complete some quizzes to see your skills analysis
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Skills Analysis</h2>
        <div className="text-sm text-muted-foreground">
          Avg:{" "}
          <span
            className={`font-bold ${getRatingClass(averageRating, thresholds)}`}
          >
            {averageRating}
          </span>
        </div>
      </div>

      <div className="w-full h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart
            data={radarData}
            margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
          >
            <PolarGrid className="opacity-30" radialLines={true} />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fontSize: 11 }}
              className="text-muted-foreground"
            />
            <PolarRadiusAxis
              angle={90}
              domain={[1000, 2400]}
              tick={{ fontSize: 10 }}
              className="text-muted-foreground opacity-70"
              tickCount={4}
            />
            <Radar
              name={userName}
              dataKey="rating"
              stroke="#eab308"
              fill="#eab308"
              fillOpacity={0.2}
              strokeWidth={2}
              dot={{ fill: "#eab308", strokeWidth: 2, r: 4 }}
            />
            <Tooltip content={<CustomTooltip thresholds={thresholds} />} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Skills breakdown */}
      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
        {radarData.slice(0, 8).map((item) => (
          <div key={item.subject} className="flex justify-between items-center">
            <span className="text-muted-foreground truncate">
              {item.subject}:
            </span>
            <span
              className={`font-medium ${getRatingClass(item.rating, thresholds)}`}
            >
              {item.rating}
            </span>
          </div>
        ))}
      </div>

      {radarData.length > 8 && (
        <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
          {radarData.slice(8).map((item) => (
            <div
              key={item.subject}
              className="flex justify-between items-center"
            >
              <span className="text-muted-foreground truncate">
                {item.subject}:
              </span>
              <span
                className={`font-medium ${getRatingClass(item.rating, thresholds)}`}
              >
                {item.rating}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
