import { Link } from "react-router";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { ExternalLink, FileQuestion, Calendar, Trophy } from "lucide-react";
import { data } from "react-router";
import RatingDisplay from "../components/RatingDisplay";
import type { Route } from "./+types/user.$userId.submissions";

interface Submission {
  id: number;
  submissionId: string;
  quizId: string;
  quizName: string;
  courseId: string;
  courseName: string;
  score: number;
  maxScore: number;
  rating: number;
  submittedAt: string;
  submissionUrl: string;
}

export async function loader({ params }: Route.LoaderArgs) {
  const { userId } = params;

  try {
    const url = new URL(
      `/api/users/details/${userId}/submissions`,
      process.env.VITE_API_BASE_URL ||
        import.meta.env.VITE_API_BASE_URL ||
        "https://api.example.com",
    );

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw data("User not found", { status: 404 });
      }
      throw data("Failed to fetch submissions", { status: response.status });
    }

    const responseData = await response.json();

    if (responseData.error) {
      throw data(responseData.error, { status: 500 });
    }

    return {
      submissions: responseData.submissions || [],
      total: responseData.total || 0,
      userId,
    };
  } catch (error) {
    console.error("Error fetching submissions:", error);
    return { submissions: [], total: 0, userId };
  }
}

export default function UserSubmissions({ loaderData }: Route.ComponentProps) {
  const { submissions, total, userId } = loaderData;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <main className="max-w-7xl mx-auto py-8 px-4">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              User Submissions
            </h1>
            <p className="text-muted-foreground mt-1">
              All quiz submissions for user {userId}
            </p>
          </div>
          <Button asChild variant="outline">
            <Link to={`/user/${userId}`}>Back to Profile</Link>
          </Button>
        </div>

        {/* Stats Card */}
        {submissions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{total}</div>
                  <div className="text-sm text-muted-foreground">
                    Total Submissions
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {Math.round(
                      submissions.reduce(
                        (sum: number, sub: Submission) =>
                          sum + (sub.score / sub.maxScore) * 100,
                        0,
                      ) / submissions.length,
                    )}
                    %
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Average Score
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {Math.round(
                      submissions.reduce(
                        (sum: number, sub: Submission) => sum + sub.rating,
                        0,
                      ) / submissions.length,
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Average Problem Rating
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {submissions.length === 0 && (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <FileQuestion className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No submissions found
              </h3>
              <p className="text-muted-foreground">
                This user hasn't submitted any quizzes yet.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Submissions Table */}
        {submissions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>All Submissions ({total})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">
                        Quiz Name
                      </th>
                      <th className="text-center py-3 px-4 font-medium">
                        Course
                      </th>
                      <th className="text-center py-3 px-4 font-medium">
                        Score
                      </th>
                      <th className="text-center py-3 px-4 font-medium">
                        Problem Rating
                      </th>
                      <th className="text-center py-3 px-4 font-medium">
                        Submitted
                      </th>
                      <th className="text-center py-3 px-4 font-medium">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.map((submission: Submission) => (
                      <tr
                        key={submission.id}
                        className="border-b hover:bg-muted/50"
                      >
                        <td className="py-3 px-4">
                          <div className="font-medium">
                            {submission.quizName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Quiz ID: {submission.quizId}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="text-sm">{submission.courseName}</div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <span className="font-semibold">
                              {submission.score}
                            </span>
                            <span className="text-muted-foreground">/</span>
                            <span className="text-muted-foreground">
                              {submission.maxScore}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {Math.round(
                              (submission.score / submission.maxScore) * 100,
                            )}
                            %
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <RatingDisplay
                            rating={Math.round(submission.rating)}
                            showIcon={true}
                          />
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span className="text-sm">
                              {formatDate(submission.submittedAt)}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <Button asChild variant="outline" size="sm">
                              <a
                                href={submission.submissionUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <ExternalLink className="h-4 w-4 mr-1" />
                                View on LMS
                              </a>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
