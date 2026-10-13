import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrophy } from "@fortawesome/free-solid-svg-icons";
import type { RatingThresholds } from "~/lib/rating";
import LeaderboardView, {
  type RecentSubmission,
} from "~/components/LeaderboardView";
import type { LeaderboardUser } from "~/lib/leaderboard-utils";
import type { Route } from "./+types/ranking.$randomizedCourseId";
import { Config } from "~/config";
import { data } from "react-router";
import { processMarkdownToHtml } from "~/lib/markdown-processor";

export async function loader({ params }: Route.LoaderArgs) {
  const { randomizedCourseId } = params;

  try {
    const baseUrl =
      process.env.VITE_API_BASE_URL ||
      import.meta.env.VITE_API_BASE_URL ||
      "https://api.example.com";

    // Fetch ranking data
    const rankingUrl = new URL(`/api/ranking/${randomizedCourseId}`, baseUrl);
    const rankingResponse = await fetch(rankingUrl.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!rankingResponse.ok && rankingResponse.status === 404) {
      throw data("Course not found", { status: 404 });
    } else if (!rankingResponse.ok) {
      throw data("Failed to fetch rankings", {
        status: rankingResponse.status,
      });
    }

    const rankingData: {
      ranking: LeaderboardUser[];
      recentSubmissions: Array<RecentSubmission>;
    } = await rankingResponse.json();

    // Fetch announcements
    const announcementsUrl = new URL(
      `/api/announcements/course/${randomizedCourseId}`,
      baseUrl,
    );
    const announcementsResponse = await fetch(announcementsUrl.toString());
    const announcementsData = announcementsResponse.ok
      ? await announcementsResponse.json()
      : [];

    // Process markdown content for each announcement
    const processedAnnouncements = await Promise.all(
      announcementsData.map(async (announcement: any) => ({
        ...announcement,
        processedContent: announcement.content
          ? await processMarkdownToHtml(announcement.content)
          : "",
      })),
    );

    // Extract course details including rating thresholds if available
    const courseDetails = rankingData.ranking?.[0]?.course || {};
    const ratingThresholds =
      courseDetails.customRatingThresholds && courseDetails.ratingThresholds
        ? courseDetails.ratingThresholds
        : undefined;

    return {
      users: rankingData.ranking || [],
      recentSubmissions: rankingData.recentSubmissions || [],
      announcements: processedAnnouncements,
      randomizedCourseId,
      ratingThresholds,
      customRatingThresholds: courseDetails.customRatingThresholds || false,
    };
  } catch (error) {
    if (error instanceof Response) throw error;
    console.error("Error fetching rankings:", error);
    return {
      users: [],
      recentSubmissions: [],
      announcements: [],
      randomizedCourseId,
    };
  }
}

export function meta({ data }: Route.MetaArgs) {
  const courseName = data?.users?.[0]?.course?.courseName || "Course";
  return [
    { title: `${courseName} - Leaderboard - ${Config.siteDescription}` },
    {
      name: "description",
      content: `Leaderboard for ${courseName} on ${Config.sitename}. View user ratings, ranks, and statistics.`,
    },
  ];
}

export default function RankingRoute({ loaderData }: Route.ComponentProps) {
  const {
    users,
    recentSubmissions,
    announcements,
    ratingThresholds,
    customRatingThresholds,
  } = loaderData;

  const courseName = users[0]?.course?.courseName || "Course Leaderboard";
  const courseQuote = users[0]?.course?.quote;
  const quoteAuthor = users[0]?.course?.quoteAuthor;
  const showDebt = users[0]?.course?.showDebt || false;

  const titleNode = (
    <h1 className="text-3xl font-bold flex items-center">
      <FontAwesomeIcon icon={faTrophy} className="mr-2 trophy-icon" />
      {courseName} - Dashboard
    </h1>
  );

  return (
    <LeaderboardView
      title={titleNode}
      courseQuote={courseQuote}
      quoteAuthor={quoteAuthor}
      showDebt={showDebt}
      users={users}
      recentSubmissions={recentSubmissions}
      announcements={announcements}
      ratingThresholds={ratingThresholds}
      customRatingThresholds={customRatingThresholds}
    />
  );
}
