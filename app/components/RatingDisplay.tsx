import React from 'react';
import { getRatingClass, getRatingTitle } from '~/lib/rating';
import '~/styles/rating.css';

interface RatingDisplayProps {
  rating: number;
  showIcon?: boolean;
  className?: string;
}

function RatingProgress({ rating }: { rating: number }) {
  const ratingLevels = [1000, 1300, 1600, 1900, 2400, 3000];
  const level = ratingLevels.findIndex(level => rating < level);
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
  className = '' 
}: RatingDisplayProps) {
  const ratingClass = getRatingClass(rating);
  const ratingTitle = getRatingTitle(rating);
  
  if (rating === 0) {
    return (
      <span className={`rate-group ${className}`} title="Unrated">
        {/* Empty for unrated users */}
      </span>
    );
  }
  
  const progress = RatingProgress({ rating });
  const fillHeight = progress * 14; // Height of the fill area
  const startY = 16 - fillHeight; // Start from bottom up
  
  return (
    <span className={`rate-group ${className}`} title={ratingTitle}>
      {showIcon && (
        <>
          {rating >= 3000 ? (
            <svg className="rate-box rate-target" viewBox="0 0 16 16">
              <circle cx="8" cy="8" r="7" fill="white" stroke="#e74c3c" strokeWidth="1"></circle>
              <circle cx="8" cy="8" r="3" fill="#e74c3c"></circle>
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
      <span className={`rating ${ratingClass}`}>
        {rating}
      </span>
    </span>
  );
}
