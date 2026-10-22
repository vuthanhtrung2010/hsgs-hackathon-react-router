import {
  getRatingClass,
  getRatingTitle,
  type RatingThresholds,
} from "~/lib/rating";
import "~/styles/rating.css";

interface RatingDisplayProps {
  rating: number;
  showIcon?: boolean;
  className?: string;
  thresholds?: RatingThresholds;
}

function RatingProgress({
  rating,
  thresholds,
}: {
  rating: number;
  thresholds?: RatingThresholds;
}) {
  // Use custom thresholds if provided, otherwise use default levels
  let ratingLevels: number[];

  if (thresholds) {
    ratingLevels = [
      thresholds.amateurThreshold,
      thresholds.expertThreshold,
      thresholds.candidateMasterThreshold,
      thresholds.masterThreshold,
      thresholds.grandmasterThreshold,
      thresholds.targetThreshold,
      thresholds.adminThreshold,
    ];
  } else {
    ratingLevels = [1000, 1300, 1600, 1900, 2100, 2400, 3000];
  }

  const level = ratingLevels.findIndex((level) => rating < level);
  const actualLevel = level === -1 ? ratingLevels.length : level;

  if (actualLevel === ratingLevels.length) {
    return 1.0; // Max level
  }

  const prev = actualLevel === 0 ? 0 : ratingLevels[actualLevel - 1];
  const next = ratingLevels[actualLevel];

  return (rating - prev) / (next - prev);
}

export default function RatingDisplay({
  rating,
  showIcon = true,
  className = "",
  thresholds,
}: RatingDisplayProps) {
  const ratingClass = getRatingClass(rating, thresholds);
  const ratingTitle = getRatingTitle(rating, thresholds);

  if (rating === 0 || rating === 1500) {
    return (
      <span className={`rate-group ${className}`} title="Unrated">
        {/* Empty for unrated users (0 or base rating 1500) */}
      </span>
    );
  }

  const progress = RatingProgress({ rating, thresholds });
  const fillHeight = progress * 14; // Height of the fill area
  const startY = 16 - fillHeight; // Start from bottom up

  return (
    <span className={`rate-group ${className}`} title={ratingTitle}>
      {showIcon && (
        <>
          {ratingClass === "rate-admin" ? (
            <svg className="rate-box rate-admin" viewBox="0 0 16 16">
              <defs>
                <linearGradient
                  id={`rate-admin-grad-${rating}`}
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#ff0055">
                    <animate
                      attributeName="stop-color"
                      values="#ff0055;#00ccff;#00ff66;#ffee00;#ff7700;#ff0055"
                      dur="3s"
                      repeatCount="indefinite"
                    />
                  </stop>
                  <stop offset="50%" stopColor="#ffee00">
                    <animate
                      attributeName="stop-color"
                      values="#ffee00;#ff0055;#00ccff;#00ff66;#ffee00"
                      dur="3s"
                      repeatCount="indefinite"
                    />
                  </stop>
                  <stop offset="100%" stopColor="#00ccff">
                    <animate
                      attributeName="stop-color"
                      values="#00ccff;#00ff66;#ffee00;#ff7700;#ff0055;#00ccff"
                      dur="3s"
                      repeatCount="indefinite"
                    />
                  </stop>
                </linearGradient>
              </defs>
              <circle
                cx="8"
                cy="8"
                r="7"
                fill="none"
                stroke={`url(#rate-admin-grad-${rating})`}
                strokeWidth="1.8"
              />
              <circle
                cx="8"
                cy="8"
                r="3"
                fill={`url(#rate-admin-grad-${rating})`}
              />
            </svg>
          ) : ratingClass === "rate-target" ? (
            <svg className="rate-box rate-target" viewBox="0 0 16 16">
              <defs>
                <linearGradient
                  id={`rate-target-grad-${rating}`}
                  x1="0%"
                  y1="100%"
                  x2="100%"
                  y2="0%"
                >
                  <stop offset="0%" stopColor="#ff1744">
                    <animate
                      attributeName="stop-color"
                      values="#ff1744;#ff9100;#ffd600;#ff9100;#ff1744"
                      dur="3.5s"
                      repeatCount="indefinite"
                    />
                  </stop>
                  <stop offset="100%" stopColor="#ffd600">
                    <animate
                      attributeName="stop-color"
                      values="#ffd600;#ff1744;#ff9100;#ffd600"
                      dur="3.5s"
                      repeatCount="indefinite"
                    />
                  </stop>
                </linearGradient>
              </defs>
              <circle
                cx="8"
                cy="8"
                r="7"
                fill="none"
                stroke={`url(#rate-target-grad-${rating})`}
                strokeWidth="1.8"
              />
              <circle
                cx="8"
                cy="8"
                r="3"
                fill={`url(#rate-target-grad-${rating})`}
              />
            </svg>
          ) : (
            <svg className={`rate-box ${ratingClass}`} viewBox="0 0 16 16">
              <defs>
                <clipPath id={`rating-clip-${rating}`}>
                  <circle cx="8" cy="8" r="7" />
                </clipPath>
              </defs>
              <circle cx="8" cy="8" r="7"></circle>
              <path
                clipPath={`url(#rating-clip-${rating})`}
                d={`M0 ${startY}h16v${fillHeight}h-16z`}
              />
            </svg>
          )}
        </>
      )}
      <span className={`rating ${ratingClass}`}>{rating}</span>
    </span>
  );
}
