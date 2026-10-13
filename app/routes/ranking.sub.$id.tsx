import { Link, data } from "react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrophy } from "@fortawesome/free-solid-svg-icons";
import LeaderboardView, {
  type ProcessedAnnouncement,
  type RecentSubmission,
} from "~/components/LeaderboardView";
import type { Route } from "./+types/ranking.sub.$id";
import { Config } from "~/config";
import { processMarkdownToHtml } from "~/lib/markdown-processor";
import type { RatingThresholds } from "~/lib/rating";
import type { LeaderboardUser } from "~/lib/leaderboard-utils";

export async function loader({ params }: Route.LoaderArgs) {
  const { id } = params;

  try {
    const baseUrl =
      process.env.VITE_API_BASE_URL ||
      import.meta.env.VITE_API_BASE_URL ||
      "http://localhost:3001";

    // 1. Fetch sub-leaderboard ranking data
    const subRankingUrl = new URL(`/api/ranking/sub/${id}`, baseUrl);
    const rankingResponse = await fetch(subRankingUrl.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!rankingResponse.ok && rankingResponse.status === 404) {
      throw data("Sub-leaderboard not found", { status: 404 });
    } else if (!rankingResponse.ok) {
      throw data("Failed to fetch sub-leaderboard rankings", {
        status: rankingResponse.status,
      });
    }

    const responseData = (await rankingResponse.json()) as {
      subLeaderboard: {
        id: string;
        name: string;
        courseId: string;
        courseName: string;
      };
      ranking: LeaderboardUser[];
      recentSubmissions: RecentSubmission[];
    };

    const subLeaderboard = responseData.subLeaderboard;
    const ranking = responseData.ranking || [];
    const recentSubmissions = responseData.recentSubmissions || [];

    // 2. Fetch course announcements
    let processedAnnouncements: ProcessedAnnouncement[] = [];
    if (subLeaderboard?.courseId) {
      try {
        const announcementsUrl = new URL(
          `/api/announcements/course/${subLeaderboard.courseId}`,
          baseUrl,
        );
        const announcementsResponse = await fetch(announcementsUrl.toString());
        if (announcementsResponse.ok) {
          const announcementsData = await announcementsResponse.json();
          processedAnnouncements = await Promise.all(
            (announcementsData || []).map(async (announcement: any) => ({
              ...announcement,
              processedContent: announcement.content
                ? await processMarkdownToHtml(announcement.content)
                : "",
            })),
          );
        }
      } catch (err) {
        console.error("Failed to fetch announcements for sub-leaderboard:", err);
      }
    }

    const courseDetails = ranking?.[0]?.course || {};
    const ratingThresholds =
      courseDetails.customRatingThresholds && courseDetails.ratingThresholds
        ? courseDetails.ratingThresholds
        : undefined;

    return {
      subLeaderboard,
      users: ranking,
      recentSubmissions,
      announcements: processedAnnouncements,
      ratingThresholds,
      customRatingThresholds: courseDetails.customRatingThresholds || false,
    };
  } catch (error) {
    if (error instanceof Response) throw error;
    console.error("Error fetching sub-leaderboard:", error);
    throw data("Internal server error", { status: 500 });
  }
}

export function meta({ data }: Route.MetaArgs) {
  const subName = data?.subLeaderboard?.name || "Sub-Leaderboard";
  const courseName = data?.subLeaderboard?.courseName || "Course";
  return [
    {
      title: `${subName} - ${courseName} - Sub-Leaderboard - ${Config.siteDescription}`,
    },
    {
      name: "description",
      content: `Sub-leaderboard for ${subName} (${courseName}) on ${Config.sitename}. View member rankings and stats.`,
    },
  ];
}

export default function SubLeaderboardRoute({
  loaderData,
}: Route.ComponentProps) {
  const {
    subLeaderboard,
    users,
    recentSubmissions,
    announcements,
    ratingThresholds,
    customRatingThresholds,
  } = loaderData;

  const courseQuote = users[0]?.course?.quote;
  const quoteAuthor = users[0]?.course?.quoteAuthor;
  const showDebt = users[0]?.course?.showDebt || false;

  const titleNode = (
    <div className="flex flex-wrap items-baseline gap-2">
      <span className="flex items-center">
        <FontAwesomeIcon icon={faTrophy} className="mr-2 trophy-icon" />
        {subLeaderboard?.name || "Sub-Leaderboard"}
      </span>
      {subLeaderboard?.courseName && (
        <span className="text-muted-foreground font-normal text-xl">
          —{" "}
          <Link
            to={`/ranking/${subLeaderboard.courseId}`}
            className="text-primary hover:underline"
            title={`View full ${subLeaderboard.courseName} leaderboard`}
          >
            {subLeaderboard.courseName}
          </Link>
        </span>
      )}
    </div>
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
      ratingThresholds={ratingThresholds as RatingThresholds}
      customRatingThresholds={customRatingThresholds}
    />
  );
}
