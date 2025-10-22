import React from "react";
import { getRatingClass, type RatingThresholds } from "~/lib/rating";

interface UsernameDisplayProps {
  name: string;
  rating: number;
  className?: string;
  thresholds?: RatingThresholds;
}

export default function NameDisplay({
  name,
  rating,
  className = "",
  thresholds,
}: UsernameDisplayProps) {
  const ratingClass = getRatingClass(rating, thresholds);

  const adminThreshold = thresholds?.adminThreshold || 3000;

  if (rating >= adminThreshold) {
    // name với chữ cái đầu màu đỏ nhạt, phần còn lại màu đỏ như grandmaster (#e00)
    const firstChar = name.charAt(0);
    const restChars = name.slice(1);

    return (
      <span className={`${className}`}>
        <span style={{ color: "#ff6b6b" }}>{firstChar}</span>
        <span style={{ color: "#e00" }}>{restChars}</span>
      </span>
    );
  }

  return <span className={`${ratingClass} ${className}`}>{name}</span>;
}
