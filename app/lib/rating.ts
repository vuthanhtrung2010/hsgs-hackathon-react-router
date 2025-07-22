// DMOJ-style rating system utilities

export function getRatingClass(rating: number): string {
  if (rating === 0) return ''; // No class for unrated users
  if (rating >= 3000) return 'rate-admin';
  if (rating >= 2400) return 'rate-target';  
  if (rating >= 2100) return 'rate-grandmaster';
  if (rating >= 1900) return 'rate-master';
  if (rating >= 1600) return 'rate-candidate-master';
  if (rating >= 1300) return 'rate-expert';
  if (rating >= 1000) return 'rate-amateur';
  return 'rate-newbie';
}

export function getRatingTitle(rating: number): string {
  if (rating === 0) return 'Unrated';
  if (rating >= 3000) return 'Admin';
  if (rating >= 2400) return 'Target';
  if (rating >= 2100) return 'Grandmaster';
  if (rating >= 1900) return 'Master';
  if (rating >= 1600) return 'Candidate Master';
  if (rating >= 1300) return 'Expert';
  if (rating >= 1000) return 'Amateur';
  return 'Newbie';
}

export function formatRating(rating: number): string {
  if (rating === 0) return '';
  return rating.toFixed(0);
}
