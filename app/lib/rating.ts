// DMOJ-style rating system utilities with support for custom thresholds

export interface RatingThresholds {
  newbieThreshold: number;
  amateurThreshold: number;
  expertThreshold: number;
  candidateMasterThreshold: number;
  masterThreshold: number;
  grandmasterThreshold: number;
  targetThreshold: number;
  adminThreshold: number;
}

// Default thresholds following DMOJ style
export const DEFAULT_RATING_THRESHOLDS: RatingThresholds = {
  newbieThreshold: 0,
  amateurThreshold: 1000,
  expertThreshold: 1300,
  candidateMasterThreshold: 1600,
  masterThreshold: 1900,
  grandmasterThreshold: 2100,
  targetThreshold: 2400,
  adminThreshold: 3000,
};

export function getRatingClass(
  rating: number,
  thresholds?: RatingThresholds,
): string {
  // Use default thresholds if not provided
  const t = thresholds || DEFAULT_RATING_THRESHOLDS;

  if (rating === 0 || rating === 1500) return ""; // No class for unrated users (0 or base rating 1500)
  if (rating >= t.adminThreshold) return "rate-admin";
  if (rating >= t.targetThreshold) return "rate-target";
  if (rating >= t.grandmasterThreshold) return "rate-grandmaster";
  if (rating >= t.masterThreshold) return "rate-master";
  if (rating >= t.candidateMasterThreshold) return "rate-candidate-master";
  if (rating >= t.expertThreshold) return "rate-expert";
  if (rating >= t.amateurThreshold) return "rate-amateur";
  return "rate-newbie";
}

export function getRatingTitle(
  rating: number,
  thresholds?: RatingThresholds,
): string {
  // Use default thresholds if not provided
  const t = thresholds || DEFAULT_RATING_THRESHOLDS;

  if (rating === 0 || rating === 1500) return "Unrated";
  if (rating >= t.adminThreshold) return "Admin";
  if (rating >= t.targetThreshold) return "Target";
  if (rating >= t.grandmasterThreshold) return "Grandmaster";
  if (rating >= t.masterThreshold) return "Master";
  if (rating >= t.candidateMasterThreshold) return "Candidate Master";
  if (rating >= t.expertThreshold) return "Expert";
  if (rating >= t.amateurThreshold) return "Amateur";
  return "Newbie";
}

export function formatRating(rating: number): string {
  if (rating === 0 || rating === 1500) return "";
  return rating.toFixed(0);
}
