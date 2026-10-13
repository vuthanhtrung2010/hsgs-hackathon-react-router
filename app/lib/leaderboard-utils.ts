import type { RatingThresholds } from "./rating";

export type SortField = "name" | "rating" | "quizzes" | "debt";
export type SortOrder = "asc" | "desc" | null;

export interface LeaderboardUser {
  id: string | number;
  name: string;
  shortName: string;
  course: {
    courseName: string;
    rating: number;
    quizzesCompleted: number;
    debt: number;
    quote?: string | null;
    quoteAuthor?: string | null;
    showDebt?: boolean;
    customRatingThresholds?: boolean;
    ratingThresholds?: RatingThresholds;
  };
  [key: string]: any;
}

export function sortLeaderboardUsers<T extends LeaderboardUser>(
  users: T[],
  field: SortField,
  order: SortOrder,
): T[] {
  if (!field || !order) return users;

  return [...users].sort((a, b) => {
    let aValue: number | string;
    let bValue: number | string;

    switch (field) {
      case "name":
        aValue = a.name;
        bValue = b.name;
        if (typeof aValue === "string" && typeof bValue === "string") {
          return order === "asc"
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }
        break;
      case "rating":
        aValue = a.course?.rating ?? 1500;
        bValue = b.course?.rating ?? 1500;

        // Treat default rating (1500) as 0 for sorting purposes
        const ratingA = aValue === 1500 ? 0 : aValue;
        const ratingB = bValue === 1500 ? 0 : bValue;

        const comparison = (ratingA as number) - (ratingB as number);
        return order === "asc" ? comparison : -comparison;
      case "quizzes":
        aValue = a.course?.quizzesCompleted ?? 0;
        bValue = b.course?.quizzesCompleted ?? 0;

        const quizComparison = (aValue as number) - (bValue as number);
        return order === "asc" ? quizComparison : -quizComparison;
      case "debt":
        aValue = a.course?.debt ?? 0;
        bValue = b.course?.debt ?? 0;

        const debtComparison = (aValue as number) - (bValue as number);
        return order === "asc" ? debtComparison : -debtComparison;
      default:
        return 0;
    }

    return 0;
  });
}
