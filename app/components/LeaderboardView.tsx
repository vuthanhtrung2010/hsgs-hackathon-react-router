import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router";
import {
  Trophy,
  Users,
  BookOpen,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  Megaphone,
  Activity,
  Quote,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { getRatingTitle, type RatingThresholds } from "~/lib/rating";
import RatingDisplay from "~/components/RatingDisplay";
import NameDisplay from "~/components/NameDisplay";
import {
  sortLeaderboardUsers,
  type LeaderboardUser,
  type SortField,
  type SortOrder,
} from "~/lib/leaderboard-utils";
import "~/styles/rating.css";
import "~/styles/leaderboard.css";
import "katex/dist/katex.min.css";

const USERS_PER_PAGE = 50;

export interface ProcessedAnnouncement {
  id: string;
  title: string;
  content: string;
  processedContent?: string;
  createdAt: string | Date;
  [key: string]: any;
}

export interface RecentSubmission {
  id: string | number;
  submittedAt: Date | string;
  userName: string;
  userShortName: string;
  userId: number | string;
  quizName: string;
}

export interface LeaderboardViewProps {
  title: ReactNode;
  subtitle?: ReactNode;
  courseQuote?: string | null;
  quoteAuthor?: string | null;
  showDebt?: boolean;
  users: LeaderboardUser[];
  recentSubmissions: RecentSubmission[];
  announcements: ProcessedAnnouncement[];
  ratingThresholds?: RatingThresholds;
  customRatingThresholds?: boolean;
}

function dateLabel(value: Date | string, withTime = false) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";
  return date.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    ...(withTime
      ? { hour: "2-digit", minute: "2-digit" }
      : { year: "numeric" }),
  });
}

function dateTime(value: Date | string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

export default function LeaderboardView({
  title,
  subtitle,
  courseQuote,
  quoteAuthor,
  showDebt = false,
  users,
  recentSubmissions,
  announcements,
  ratingThresholds,
}: LeaderboardViewProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>("rating");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [announcementIndex, setAnnouncementIndex] = useState(0);
  const sortedUsers = useMemo(
    () => sortLeaderboardUsers(users, sortField, sortOrder),
    [users, sortField, sortOrder],
  );
  // Rank remains tied to rating even when the visible rows are sorted another way.
  const ranks = useMemo(
    () =>
      new Map(
        sortLeaderboardUsers(users, "rating", "desc").map((user, index) => [
          user.id,
          index + 1,
        ]),
      ),
    [users],
  );
  const quizzesCompleted = users.reduce(
    (total, user) => total + (user.course?.quizzesCompleted ?? 0),
    0,
  );
  const totalPages = Math.max(1, Math.ceil(users.length / USERS_PER_PAGE));
  const page = Math.min(currentPage, totalPages);
  const startIndex = (page - 1) * USERS_PER_PAGE;
  const currentUsers = sortedUsers.slice(
    startIndex,
    startIndex + USERS_PER_PAGE,
  );
  const announcement = announcements.length
    ? announcements[announcementIndex % announcements.length]
    : undefined;

  useEffect(() => {
    setCurrentPage(1);
  }, [users, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    setSortOrder(sortField === field && sortOrder === "desc" ? "asc" : "desc");
    setSortField(field);
  };
  const sortIcon = (field: SortField) =>
    sortField !== field ? (
      <ArrowUpDown className="size-3.5 opacity-50" aria-hidden="true" />
    ) : sortOrder === "asc" ? (
      <ArrowUp className="size-3.5 text-primary" aria-hidden="true" />
    ) : (
      <ArrowDown className="size-3.5 text-primary" aria-hidden="true" />
    );
  const rating = (user: LeaderboardUser) => {
    const value = user.course?.rating ?? 1500;
    return value === 0 || value === 1500 ? (
      <span className="text-xs font-normal text-muted-foreground">Unrated</span>
    ) : (
      <RatingDisplay
        rating={Math.round(value)}
        thresholds={ratingThresholds}
        className="tabular-nums"
      />
    );
  };
  const rank = (user: LeaderboardUser) => {
    const position = ranks.get(user.id);
    return (
      <span
        className={`inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-sm font-medium tabular-nums ${position === 1 ? "bg-amber-500/10 text-amber-700 dark:text-amber-300" : position && position <= 3 ? "bg-secondary text-secondary-foreground" : "text-muted-foreground"}`}
        aria-label={`Rank ${position}`}
      >
        {position === 1 ? (
          <Trophy className="size-4" aria-hidden="true" />
        ) : (
          position
        )}
        <span className="sr-only">{position === 1 ? "1" : ""}</span>
      </span>
    );
  };
  const student = (user: LeaderboardUser) => (
    <Link
      to={`/user/${user.id}`}
      title={getRatingTitle(
        Math.round(user.course?.rating ?? 1500),
        ratingThresholds,
      )}
      className="group flex min-h-10 min-w-0 items-center gap-3 rounded-lg focus-visible:outline-2 focus-visible:outline-ring"
    >
      <span className="min-w-0 break-words text-sm font-medium leading-relaxed group-hover:underline [overflow-wrap:anywhere]">
        <NameDisplay
          name={user.name}
          rating={Math.round(user.course?.rating ?? 1500)}
          thresholds={ratingThresholds}
        />
      </span>
      <ArrowUpRight
        className="hidden size-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 lg:block"
        aria-hidden="true"
      />
    </Link>
  );

  const columns: { field: SortField; label: string; className: string }[] = [
    { field: "name", label: "Student", className: "" },
    { field: "rating", label: "Rating", className: "w-28" },
    { field: "quizzes", label: "Quizzes", className: "w-24" },
    ...(showDebt
      ? [{ field: "debt" as const, label: "Debt", className: "w-28" }]
      : []),
  ];

  return (
    <div className="leaderboard-view mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
      <header className="mb-7">
        <p className="mb-4 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
          <Trophy className="size-4 text-primary" aria-hidden="true" />
          Leaderboard
        </p>
        <h1 className="break-words text-2xl font-semibold tracking-tight sm:text-3xl">
          {title}
        </h1>
        <div className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {subtitle ||
            "Every exercise is a step forward. See how the class is progressing."}
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-2">
            <Users className="size-4" aria-hidden="true" />
            <strong className="font-semibold tabular-nums text-foreground">
              {users.length.toLocaleString()}
            </strong>{" "}
            students
          </span>
          <span className="inline-flex items-center gap-2">
            <BookOpen className="size-4" aria-hidden="true" />
            <strong className="font-semibold tabular-nums text-foreground">
              {quizzesCompleted.toLocaleString()}
            </strong>{" "}
            quizzes completed
          </span>
        </div>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_340px]">
        <section
          aria-label="Student rankings"
          className="min-w-0 overflow-hidden rounded-2xl border border-border bg-card"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-4 sm:px-5">
            <div>
              <h2 className="text-sm font-semibold">Class standings</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                {sortField === "rating" && sortOrder === "desc"
                  ? "Highest rated first"
                  : `Sorted by ${sortField === "name" ? "student name" : sortField} · ${sortOrder === "asc" ? "ascending" : "descending"}`}
              </p>
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="sm:hidden">
                  <ArrowUpDown aria-hidden="true" />
                  Sort
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-52 p-1.5">
                <p className="px-3 py-2 text-xs text-muted-foreground">
                  Sort standings by
                </p>
                {columns.map(({ field, label }) => (
                  <Button
                    key={field}
                    variant="ghost"
                    onClick={() => handleSort(field)}
                    className="w-full justify-between"
                  >
                    {label}
                    {sortIcon(field)}
                  </Button>
                ))}
              </PopoverContent>
            </Popover>
            <span className="hidden text-xs tabular-nums text-muted-foreground sm:inline">
              {users.length
                ? `${startIndex + 1}–${Math.min(startIndex + USERS_PER_PAGE, users.length)} of ${users.length}`
                : "0 students"}
            </span>
          </div>
          {users.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <Users
                className="mx-auto mb-4 size-7 text-muted-foreground"
                aria-hidden="true"
              />
              <h3 className="text-sm font-medium">No students ranked yet</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Student rankings will appear here when members join this
                leaderboard.
              </p>
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto sm:block">
                <table className="w-full table-fixed text-sm">
                  <caption className="sr-only">
                    Student standings. Rank is based on rating.
                  </caption>
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th
                        scope="col"
                        className="w-16 px-4 text-center text-xs font-medium text-muted-foreground"
                      >
                        Rank
                      </th>
                      {columns.map(({ field, label, className }) => (
                        <th
                          key={field}
                          scope="col"
                          aria-sort={
                            sortField === field
                              ? sortOrder === "asc"
                                ? "ascending"
                                : "descending"
                              : undefined
                          }
                          className={`px-4 text-left text-xs font-medium text-muted-foreground ${className}`}
                        >
                          <button
                            type="button"
                            onClick={() => handleSort(field)}
                            className="flex min-h-12 w-full items-center gap-2 hover:text-foreground"
                          >
                            {label}
                            {sortIcon(field)}
                          </button>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {currentUsers.map((user) => (
                      <tr
                        key={user.id}
                        data-student-id={user.id}
                        className="transition-colors hover:bg-secondary"
                      >
                        <td className="px-4 py-3 text-center">{rank(user)}</td>
                        <td className="px-4 py-3">{student(user)}</td>
                        <td className="px-4 py-3 font-medium">
                          {rating(user)}
                        </td>
                        <td className="px-4 py-3 tabular-nums text-muted-foreground">
                          {(
                            user.course?.quizzesCompleted ?? 0
                          ).toLocaleString()}
                        </td>
                        {showDebt && (
                          <td className="break-words px-4 py-3 text-xs tabular-nums text-destructive">
                            {(user.course?.debt ?? 0).toLocaleString()}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <ul
                className="divide-y divide-border sm:hidden"
                aria-label="Student standings"
              >
                {currentUsers.map((user) => (
                  <li
                    key={user.id}
                    data-student-id={user.id}
                    className="flex items-start gap-2 px-3 py-3"
                  >
                    {rank(user)}
                    <div className="min-w-0 flex-1">
                      {student(user)}
                      <p className="mt-1 text-xs text-muted-foreground">
                        <span className="tabular-nums">
                          {(
                            user.course?.quizzesCompleted ?? 0
                          ).toLocaleString()}
                        </span>{" "}
                        quizzes completed
                        {showDebt && (
                          <span className="ml-3 text-destructive">
                            Debt: {(user.course?.debt ?? 0).toLocaleString()}
                          </span>
                        )}
                      </p>
                    </div>
                    <span className="shrink-0 pt-2.5 text-sm">
                      {rating(user)}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
          {totalPages > 1 && (
            <nav
              aria-label="Ranking pages"
              className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-4 sm:px-5"
            >
              <span className="text-xs tabular-nums text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  aria-label="Previous ranking page"
                  disabled={page === 1}
                  onClick={() => setCurrentPage(page - 1)}
                >
                  <ChevronLeft aria-hidden="true" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  aria-label="Next ranking page"
                  disabled={page === totalPages}
                  onClick={() => setCurrentPage(page + 1)}
                >
                  Next
                  <ChevronRight aria-hidden="true" />
                </Button>
              </div>
            </nav>
          )}
          <p className="border-t border-border px-4 py-3 text-xs leading-relaxed text-muted-foreground sm:px-5">
            Select a student to explore their profile and progress.
          </p>
        </section>

        <aside aria-label="Class updates" className="min-w-0 space-y-5">
          {courseQuote && (
            <figure className="rounded-2xl border border-primary/10 bg-secondary/50 p-5">
              <Quote className="mb-3 size-5 text-primary" aria-hidden="true" />
              <blockquote className="break-words text-base font-medium leading-relaxed text-foreground">
                {courseQuote}
              </blockquote>
              {quoteAuthor && (
                <figcaption className="mt-4 text-xs text-muted-foreground">
                  — {quoteAuthor}
                </figcaption>
              )}
            </figure>
          )}
          <section className="overflow-hidden rounded-2xl border border-border bg-card">
            <div className="flex items-center gap-2.5 border-b border-border px-5 py-4">
              <Megaphone
                className="size-4 text-muted-foreground"
                aria-hidden="true"
              />
              <h2 className="text-sm font-semibold">Announcements</h2>
              {announcements.length > 0 && (
                <span className="ml-auto text-xs tabular-nums text-muted-foreground">
                  {announcements.length}
                </span>
              )}
            </div>
            {announcement ? (
              <div className="p-5">
                <time
                  dateTime={dateTime(announcement.createdAt)}
                  className="text-xs text-muted-foreground"
                >
                  {dateLabel(announcement.createdAt)}
                </time>
                <h3 className="mt-2 break-words text-sm font-semibold leading-relaxed">
                  {announcement.title}
                </h3>
                <div
                  className="ranking-announcement mt-3 min-w-0 break-words text-sm leading-relaxed text-muted-foreground [overflow-wrap:anywhere] [&_a]:text-primary [&_a]:underline [&_img]:max-w-full [&_pre]:max-w-full [&_pre]:overflow-x-auto"
                  dangerouslySetInnerHTML={{
                    __html:
                      announcement.processedContent || "<p>No content.</p>",
                  }}
                />
                {announcements.length > 1 && (
                  <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                    <Button
                      variant="outline"
                      size="icon"
                      className="size-8 rounded-lg"
                      aria-label="Previous announcement"
                      onClick={() =>
                        setAnnouncementIndex(
                          (index) =>
                            (index - 1 + announcements.length) %
                            announcements.length,
                        )
                      }
                    >
                      <ChevronLeft aria-hidden="true" />
                    </Button>
                    <span className="text-xs tabular-nums text-muted-foreground">
                      {(announcementIndex % announcements.length) + 1} of{" "}
                      {announcements.length}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="size-8 rounded-lg"
                      aria-label="Next announcement"
                      onClick={() =>
                        setAnnouncementIndex(
                          (index) => (index + 1) % announcements.length,
                        )
                      }
                    >
                      <ChevronRight aria-hidden="true" />
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="px-5 py-6">
                <p className="text-sm text-muted-foreground">
                  You’re all caught up.
                </p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  New class announcements will appear here.
                </p>
              </div>
            )}
          </section>
          <section className="overflow-hidden rounded-2xl border border-border bg-card">
            <div className="flex items-center gap-2.5 border-b border-border px-5 py-4">
              <Activity
                className="size-4 text-muted-foreground"
                aria-hidden="true"
              />
              <h2 className="text-sm font-semibold">Recent submissions</h2>
            </div>
            {recentSubmissions.length ? (
              <ul className="divide-y divide-border px-5">
                {recentSubmissions.map((submission) => (
                  <li key={submission.id} className="py-4">
                    <Link
                      to={`/user/${submission.userId}`}
                      className="inline-flex min-h-8 max-w-full items-center break-words text-sm font-medium hover:text-primary hover:underline [overflow-wrap:anywhere]"
                    >
                      {submission.userName}
                    </Link>
                    <p className="mt-0.5 break-words text-xs leading-relaxed text-muted-foreground">
                      {submission.quizName}
                    </p>
                    <time
                      dateTime={dateTime(submission.submittedAt)}
                      className="mt-2 block text-xs tabular-nums text-muted-foreground"
                    >
                      {dateLabel(submission.submittedAt, true)}
                    </time>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-5 py-6 text-sm leading-relaxed text-muted-foreground">
                No recent submissions. The next completed exercise will appear
                here.
              </p>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
