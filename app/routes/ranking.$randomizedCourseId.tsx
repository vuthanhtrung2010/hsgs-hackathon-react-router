import { useEffect, useState, useCallback } from "react";
import { Link, useLoaderData } from "react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSort,
  faSortUp,
  faSortDown,
  faTrophy,
  faQuoteLeft,
} from "@fortawesome/free-solid-svg-icons";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "~/components/ui/pagination";
import { type IUsersListData } from "~/lib/server-actions/users";
import { getRatingTitle } from "~/lib/rating";
import RatingDisplay from "~/components/RatingDisplay";
import "~/styles/rating.css";
import Loading from "~/components/Loading";
import NameDisplay from "~/components/NameDisplay";
import type { Route } from "./+types/ranking.$randomizedCourseId";
import { Config } from "~/config";
import { data } from "react-router";
import { processMarkdownToHtml } from "~/lib/markdown-processor";
import "katex/dist/katex.min.css";

const USERS_PER_PAGE = 50;

type SortField = "name" | "rating" | "quizzes" | "debt";
type SortOrder = "asc" | "desc" | null;

interface RecentSubmission {
  id: string;
  submittedAt: Date;
  userName: string;
  userShortName: string;
  userId: number;
  quizName: string;
}

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

    const rankingData = await rankingResponse.json();

    // Fetch announcements
    const announcementsUrl = new URL(
      `/api/announcements/course/${randomizedCourseId}`,
      baseUrl
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
      }))
    );

    return {
      users: rankingData.ranking || [],
      recentSubmissions: rankingData.recentSubmissions || [],
      announcements: processedAnnouncements,
      randomizedCourseId,
    };
  } catch (error) {
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

export default function RankingRoute() {
  const {
    users: initialUsers,
    recentSubmissions,
    announcements,
  } = useLoaderData<{
    users: IUsersListData[];
    recentSubmissions: RecentSubmission[];
    announcements: any[];
  }>();

  const [users] = useState<IUsersListData[]>(initialUsers);
  const [filteredUsers, setFilteredUsers] = useState<IUsersListData[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>("rating");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentAnnouncementIndex, setCurrentAnnouncementIndex] = useState(0);

  const courseName = users[0]?.course?.courseName || "Course Leaderboard";
  const courseQuote = users[0]?.course?.quote;
  const quoteAuthor = users[0]?.course?.quoteAuthor;
  const showDebt = users[0]?.course?.showDebt || false;

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortOrder === "asc") {
        setSortOrder("desc");
      } else if (sortOrder === "desc") {
        setSortOrder("asc");
      }
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return faSort;
    if (sortOrder === "asc") return faSortUp;
    if (sortOrder === "desc") return faSortDown;
    return faSort;
  };

  const sortUsers = useCallback(
    (users: IUsersListData[]) => {
      if (!sortField || !sortOrder) return users;

      return [...users].sort((a, b) => {
        let aValue: number | string;
        let bValue: number | string;

        switch (sortField) {
          case "name":
            aValue = a.name;
            bValue = b.name;
            if (typeof aValue === "string" && typeof bValue === "string") {
              return sortOrder === "asc"
                ? aValue.localeCompare(bValue)
                : bValue.localeCompare(aValue);
            }
            break;
          case "rating":
            aValue = a.course?.rating || 1500;
            bValue = b.course?.rating || 1500;

            // Treat default rating (1500) as 0 for sorting purposes
            const ratingA = aValue === 1500 ? 0 : aValue;
            const ratingB = bValue === 1500 ? 0 : bValue;

            const comparison = (ratingA as number) - (ratingB as number);
            return sortOrder === "asc" ? comparison : -comparison;
          case "quizzes":
            aValue = a.course?.quizzesCompleted || 0;
            bValue = b.course?.quizzesCompleted || 0;

            const quizComparison = (aValue as number) - (bValue as number);
            return sortOrder === "asc" ? quizComparison : -quizComparison;
          case "debt":
            aValue = a.course?.debt || 0;
            bValue = b.course?.debt || 0;

            const debtComparison = (aValue as number) - (bValue as number);
            return sortOrder === "asc" ? debtComparison : -debtComparison;
          default:
            return 0;
        }

        return 0;
      });
    },
    [sortField, sortOrder]
  );

  const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);
  const startIndex = (currentPage - 1) * USERS_PER_PAGE;
  const endIndex = startIndex + USERS_PER_PAGE;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let filtered = users;

    filtered = sortUsers(filtered);

    setFilteredUsers(filtered);
    setCurrentPage(1);
  }, [users, sortField, sortOrder, sortUsers]);

  return (
    <main className="max-w-[1600px] mx-auto py-8 px-4">
      {!isLoaded && <Loading />}
      <div
        className={`users-page-container ${isLoaded ? "loaded" : "loading"}`}
      >
        {/* Title */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-4 flex items-center">
            <FontAwesomeIcon icon={faTrophy} className="mr-2 trophy-icon" />
            {courseName} - Leaderboard
          </h1>
          <hr className="mb-6" />
        </div>

        {/* Mobile: Quote at top */}
        {courseQuote && (
          <div className="lg:hidden relative mb-6 rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-background border-2 border-primary/20 shadow-lg overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/5 rounded-full translate-y-12 -translate-x-12"></div>

            <div className="relative p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <FontAwesomeIcon
                      icon={faQuoteLeft}
                      className="text-primary text-xl"
                    />
                  </div>
                </div>

                <div className="flex-1 pt-1">
                  <blockquote className="text-lg font-medium text-foreground/90 italic leading-relaxed mb-3">
                    "{courseQuote}"
                  </blockquote>
                  {quoteAuthor && (
                    <div className="flex justify-end">
                      <cite className="not-italic text-sm font-semibold text-primary flex items-center gap-2">
                        <span className="inline-block w-8 h-0.5 bg-primary/50 rounded-full"></span>
                        {quoteAuthor}
                      </cite>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 h-1 w-20 bg-gradient-to-r from-primary to-primary/50 rounded-full"></div>
            </div>
          </div>
        )}

        {/* Desktop: Main content with right sidebar */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Leaderboard - Takes less space on desktop */}
          <div className="flex-1 lg:max-w-[65%]">
            <div className="rounded-md border">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-gray-800 dark:bg-white">
                      <th className="h-12 px-4 text-center align-middle font-medium text-white dark:text-gray-900 border-r border-gray-600 dark:border-gray-300 first:rounded-tl-md w-[4rem]">
                        Rank
                      </th>
                      <th
                        className="h-12 px-4 text-center align-middle font-medium text-white dark:text-gray-900 border-r border-gray-600 dark:border-gray-300 w-[8rem] cursor-pointer hover:bg-gray-700 dark:hover:bg-gray-100"
                        onClick={() => handleSort("rating")}
                      >
                        <div className="flex items-center justify-center gap-2">
                          Rating
                          <FontAwesomeIcon
                            icon={getSortIcon("rating")}
                            className="w-3 h-3"
                          />
                        </div>
                      </th>
                      <th
                        className="h-12 px-4 text-left align-middle font-medium text-white dark:text-gray-900 border-r border-gray-600 dark:border-gray-300 cursor-pointer hover:bg-gray-700 dark:hover:bg-gray-100"
                        onClick={() => handleSort("name")}
                      >
                        <div className="flex items-center gap-2">
                          Name
                          <FontAwesomeIcon
                            icon={getSortIcon("name")}
                            className="w-3 h-3"
                          />
                        </div>
                      </th>
                      <th
                        className="h-12 px-4 text-center align-middle font-medium text-white dark:text-gray-900 border-r border-gray-600 dark:border-gray-300 w-[6rem] cursor-pointer hover:bg-gray-700 dark:hover:bg-gray-100"
                        onClick={() => handleSort("quizzes")}
                      >
                        <div className="flex items-center justify-center gap-2">
                          Quizzes
                          <FontAwesomeIcon
                            icon={getSortIcon("quizzes")}
                            className="w-3 h-3"
                          />
                        </div>
                      </th>
                      {showDebt && (
                        <th
                          className="h-12 px-4 text-center align-middle font-medium text-white dark:text-gray-900 rounded-tr-md w-[6rem] cursor-pointer hover:bg-gray-700 dark:hover:bg-gray-100"
                          onClick={() => handleSort("debt")}
                        >
                          <div className="flex items-center justify-center gap-2">
                            Debt
                            <FontAwesomeIcon
                              icon={getSortIcon("debt")}
                              className="w-3 h-3"
                            />
                          </div>
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td
                          colSpan={showDebt ? 5 : 4}
                          className="h-24 px-4 text-center text-muted-foreground"
                        >
                          <div className="flex items-center justify-center">
                            <Loading />
                          </div>
                        </td>
                      </tr>
                    ) : currentUsers.length === 0 ? (
                      <tr>
                        <td
                          colSpan={showDebt ? 5 : 4}
                          className="h-24 px-4 text-center text-muted-foreground"
                        >
                          <span>No users available.</span>
                        </td>
                      </tr>
                    ) : (
                      currentUsers.map((user, index) => {
                        const rating = user.course?.rating || 1500;
                        return (
                          <tr
                            key={user.id}
                            className="border-b transition-colors hover:bg-muted/50"
                          >
                            <td className="p-4 align-middle text-center border-r border-border">
                              <span className="font-bold text-lg">
                                #{startIndex + index + 1}
                              </span>
                            </td>
                            <td className="p-4 align-middle text-center border-r border-border">
                              <RatingDisplay
                                rating={Math.round(rating)}
                                showIcon={true}
                              />
                            </td>
                            <td className="p-4 align-middle border-r border-border">
                              <Link
                                to={`/user/${user.id}`}
                                className="text-primary hover:underline font-medium"
                                title={getRatingTitle(Math.round(rating))}
                              >
                                <NameDisplay
                                  name={user.name}
                                  rating={Math.round(rating)}
                                />
                              </Link>
                            </td>
                            <td className="p-4 align-middle text-center">
                              <span className="font-medium text-sm">
                                {user.course?.quizzesCompleted || 0}
                              </span>
                            </td>
                            {showDebt && (
                              <td className="p-4 align-middle text-center">
                                <span className="font-medium text-sm text-red-600 dark:text-red-400">
                                  {user.course?.debt || 0}
                                </span>
                              </td>
                            )}
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            {totalPages > 1 && (
              <div className="mt-6 flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(prev - 1, 1))
                        }
                        className={
                          currentPage === 1
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>

                    {/* Page numbers */}
                    {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                      let pageNumber;
                      if (totalPages <= 7) {
                        pageNumber = i + 1;
                      } else if (currentPage <= 4) {
                        pageNumber = i + 1;
                      } else if (currentPage >= totalPages - 3) {
                        pageNumber = totalPages - 6 + i;
                      } else {
                        pageNumber = currentPage - 3 + i;
                      }

                      if (
                        pageNumber === currentPage - 2 &&
                        currentPage > 4 &&
                        totalPages > 7
                      ) {
                        return (
                          <PaginationItem key="ellipsis-start">
                            <PaginationEllipsis />
                          </PaginationItem>
                        );
                      }

                      if (
                        pageNumber === currentPage + 2 &&
                        currentPage < totalPages - 3 &&
                        totalPages > 7
                      ) {
                        return (
                          <PaginationItem key="ellipsis-end">
                            <PaginationEllipsis />
                          </PaginationItem>
                        );
                      }

                      return (
                        <PaginationItem key={pageNumber}>
                          <PaginationLink
                            onClick={() => setCurrentPage(pageNumber)}
                            isActive={pageNumber === currentPage}
                            className="cursor-pointer"
                          >
                            {pageNumber}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(prev + 1, totalPages)
                          )
                        }
                        className={
                          currentPage === totalPages
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
            <div className="mt-6 text-center">
              <div className="results-info">
                {isLoading ? (
                  <span>Loading users...</span>
                ) : (
                  <>
                    Showing {filteredUsers.length} users
                    {totalPages > 1 && (
                      <>
                        {" "}
                        • Page {currentPage} of {totalPages}
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
            {currentUsers.length > 0 && (
              <div className="mt-6 text-sm text-muted-foreground">
                <p>
                  Click on a name to view their profile and detailed statistics.
                </p>
              </div>
            )}
          </div>

          {/* Right Sidebar - Desktop only */}
          <div className="hidden lg:block lg:w-[35%] space-y-6">
            {/* Quote Box */}
            {courseQuote && (
              <div className="relative rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-background border-2 border-primary/20 shadow-lg overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -translate-y-12 translate-x-12"></div>

                <div className="relative p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <FontAwesomeIcon
                          icon={faQuoteLeft}
                          className="text-primary text-lg"
                        />
                      </div>
                    </div>

                    <div className="flex-1 pt-1">
                      <blockquote className="text-base font-medium text-foreground/90 italic leading-relaxed mb-2">
                        "{courseQuote}"
                      </blockquote>
                      {quoteAuthor && (
                        <div className="flex justify-end">
                          <cite className="not-italic text-xs font-semibold text-primary flex items-center gap-2">
                            <span className="inline-block w-6 h-0.5 bg-primary/50 rounded-full"></span>
                            {quoteAuthor}
                          </cite>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Announcements */}
            <div className="rounded-xl border-2 border-border bg-card shadow-lg overflow-hidden">
              <div className="bg-primary/10 px-4 py-3 border-b border-border">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  📢 Announcements
                </h3>
              </div>
              <div className="p-4">
                {announcements.length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-8">
                    No announcements yet
                  </p>
                ) : (
                  <>
                    <div className="mb-4">
                      <h4 className="font-semibold text-base mb-2">
                        {announcements[currentAnnouncementIndex].title}
                      </h4>
                      <div
                        className="text-sm text-muted-foreground prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{
                          __html:
                            announcements[currentAnnouncementIndex]
                              .processedContent || "No content",
                        }}
                      />
                      <div className="text-xs text-muted-foreground mt-2">
                        {new Date(
                          announcements[currentAnnouncementIndex].createdAt
                        ).toLocaleDateString()}
                      </div>
                    </div>

                    {announcements.length > 1 && (
                      <div className="flex items-center justify-between pt-3 border-t border-border">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setCurrentAnnouncementIndex((prev) =>
                              prev === 0 ? announcements.length - 1 : prev - 1
                            )
                          }
                        >
                          Previous
                        </Button>
                        <span className="text-xs text-muted-foreground">
                          {currentAnnouncementIndex + 1} /{" "}
                          {announcements.length}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setCurrentAnnouncementIndex((prev) =>
                              prev === announcements.length - 1 ? 0 : prev + 1
                            )
                          }
                        >
                          Next
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Recent Submissions */}
            <div className="rounded-xl border-2 border-border bg-card shadow-lg overflow-hidden">
              <div className="bg-primary/10 px-4 py-3 border-b border-border">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  🔥 Recent Submissions
                </h3>
              </div>
              <div className="p-4">
                {recentSubmissions.length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-8">
                    No recent submissions
                  </p>
                ) : (
                  <div className="space-y-3">
                    {recentSubmissions.map((submission, index) => (
                      <div
                        key={submission.id}
                        className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <Link
                            to={`/user/${submission.userId}`}
                            className="font-medium text-sm hover:text-primary transition-colors block truncate"
                          >
                            {submission.userName}
                          </Link>
                          <p className="text-xs text-muted-foreground truncate">
                            {submission.quizName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(submission.submittedAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile: Announcements */}
        <div className="lg:hidden mt-6 rounded-xl border-2 border-border bg-card shadow-lg overflow-hidden">
          <div className="bg-primary/10 px-4 py-3 border-b border-border">
            <h3 className="font-bold text-lg flex items-center gap-2">
              📢 Announcements
            </h3>
          </div>
          <div className="p-4">
            {announcements.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-8">
                No announcements yet
              </p>
            ) : (
              <>
                <div className="mb-4">
                  <h4 className="font-semibold text-base mb-2">
                    {announcements[currentAnnouncementIndex].title}
                  </h4>
                  <div
                    className="text-sm text-muted-foreground prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{
                      __html:
                        announcements[currentAnnouncementIndex]
                          .processedContent || "No content",
                    }}
                  />
                  <div className="text-xs text-muted-foreground mt-2">
                    {new Date(
                      announcements[currentAnnouncementIndex].createdAt
                    ).toLocaleDateString()}
                  </div>
                </div>

                {announcements.length > 1 && (
                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentAnnouncementIndex((prev) =>
                          prev === 0 ? announcements.length - 1 : prev - 1
                        )
                      }
                    >
                      Previous
                    </Button>
                    <span className="text-xs text-muted-foreground">
                      {currentAnnouncementIndex + 1} / {announcements.length}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentAnnouncementIndex((prev) =>
                          prev === announcements.length - 1 ? 0 : prev + 1
                        )
                      }
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Mobile: Recent Submissions */}
        <div className="lg:hidden mt-6 rounded-xl border-2 border-border bg-card shadow-lg overflow-hidden">
          <div className="bg-primary/10 px-4 py-3 border-b border-border">
            <h3 className="font-bold text-lg flex items-center gap-2">
              🔥 Recent Submissions
            </h3>
          </div>
          <div className="p-4">
            {recentSubmissions.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-8">
                No recent submissions
              </p>
            ) : (
              <div className="space-y-3">
                {recentSubmissions.map((submission, index) => (
                  <div
                    key={submission.id}
                    className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/user/${submission.userId}`}
                        className="font-medium text-sm hover:text-primary transition-colors block truncate"
                      >
                        {submission.userName}
                      </Link>
                      <p className="text-xs text-muted-foreground truncate">
                        {submission.quizName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(submission.submittedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
