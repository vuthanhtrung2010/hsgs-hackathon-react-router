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

  return <span className={`${ratingClass} ${className}`}>{name}</span>;
}
