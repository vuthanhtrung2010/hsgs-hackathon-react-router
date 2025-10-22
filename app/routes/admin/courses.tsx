import { Link } from "react-router";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import {
  ExternalLink,
  Users,
  FileQuestion,
  Calendar,
  Settings,
} from "lucide-react";
import { data, redirect } from "react-router";
import type { Route } from "./+types/courses";
import { CourseSettingsDialog } from "../../components/CourseSettingsDialog";
import { useState } from "react";
import { DEFAULT_RATING_THRESHOLDS } from "~/lib/rating";
import type { RatingThresholds } from "~/lib/rating";

interface Course {
  id: string;
  name: string;
  randomId: string;
  createdAt: string;
  updatedAt: string;
  quote?: string;
  quoteAuthor?: string;
  showDebt?: boolean;
  customRatingThresholds?: boolean;
  ratingThresholds?: RatingThresholds;
  _count: {
    canvasUsers: number;
    questions: number;
  };
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const courseId = formData.get("courseId");

  if (!courseId || typeof courseId !== "string") {
    return {
      success: false,
      error: "Course ID is required",
    };
  }

  // Extract settings from the form data
  const quote = formData.get("quote") || "";
  const quoteAuthor = formData.get("quoteAuthor") || "";

  // Handle both checkbox values ("on") and hidden input values ("true")
  const showDebtValue = formData.get("showDebt");
  const showDebt = showDebtValue === "true" || showDebtValue === "on";

  const customRatingThresholdsValue = formData.get("customRatingThresholds");
  const customRatingThresholds =
    customRatingThresholdsValue === "true" ||
    customRatingThresholdsValue === "on";

  // Extract rating thresholds from form data
  const thresholds: RatingThresholds = {
    newbieThreshold: parseInt(formData.get("newbieThreshold") as string) || 0,
    amateurThreshold:
      parseInt(formData.get("amateurThreshold") as string) || 1000,
    expertThreshold:
      parseInt(formData.get("expertThreshold") as string) || 1300,
    candidateMasterThreshold:
      parseInt(formData.get("candidateMasterThreshold") as string) || 1600,
    masterThreshold:
      parseInt(formData.get("masterThreshold") as string) || 1900,
    grandmasterThreshold:
      parseInt(formData.get("grandmasterThreshold") as string) || 2100,
    targetThreshold:
      parseInt(formData.get("targetThreshold") as string) || 2400,
    adminThreshold: parseInt(formData.get("adminThreshold") as string) || 3000,
  };

  const url = new URL(
    `/api/admin/courses/${courseId}/settings`,
    process.env.VITE_API_BASE_URL ||
      import.meta.env.VITE_API_BASE_URL ||
      "https://api.example.com",
  );
  try {
    const response = await fetch(url.toString(), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Cookie: request.headers.get("Cookie") || "",
      },
      body: JSON.stringify({
        quote,
        quoteAuthor,
        showDebt,
        customRatingThresholds,
        thresholds,
      }),
    });

    const data = await response.json();

    if (!data.success) {
      console.error("API error:", data.error);
      return {
        success: false,
        error: data.error || "Failed to update course settings",
      };
    }

    return {
      success: true,
    };
  } catch (err) {
    console.error("Error saving course settings:", err);
    return {
      success: false,
      error: "Failed to connect to server",
    };
  }
}

export async function loader({ request }: Route.LoaderArgs) {
  try {
    const url = new URL(
      "/api/admin/courses",
      process.env.VITE_API_BASE_URL ||
        import.meta.env.VITE_API_BASE_URL ||
        "https://api.example.com",
    );

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Cookie: request.headers.get("Cookie") || "",
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw data("Unauthorized access", { status: 401 });
      } else if (response.status === 403) {
        throw data("Admin access required", { status: 403 });
      }
      throw data("Failed to fetch courses", { status: response.status });
    }

    const responseData = await response.json();

    if (!responseData.success) {
      throw data(responseData.error || "Failed to fetch courses", {
        status: 500,
      });
    }

    return { courses: responseData.courses, error: null };
  } catch (error) {
    console.error("Error fetching courses:", error);
    return { courses: [], error: "Failed to connect to server" };
  }
}

export default function AdminCourses({ loaderData }: Route.ComponentProps) {
  const { courses, error } = loaderData;
  const [isSaving, setIsSaving] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getRankingUrl = (randomId: string) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/ranking/${randomId}`;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Courses</h1>
          <p className="text-muted-foreground mt-1">
            Manage courses and view their leaderboards
          </p>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!error && courses.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No courses found</h3>
            <p className="text-muted-foreground">
              No courses are available in the system yet.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Courses Table */}
      {courses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>All Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">
                      Course Name
                    </th>
                    <th className="text-left py-3 px-4 font-medium">
                      Course ID
                    </th>
                    <th className="text-center py-3 px-4 font-medium">Users</th>
                    <th className="text-center py-3 px-4 font-medium">
                      Questions
                    </th>
                    <th className="text-center py-3 px-4 font-medium">
                      Created
                    </th>
                    <th className="text-center py-3 px-4 font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((course: Course) => (
                    <tr key={course.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4">
                        <div className="font-medium">{course.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Random ID: {course.randomId}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <code className="bg-muted px-2 py-1 rounded text-sm">
                          {course.id}
                        </code>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{course._count.canvasUsers}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <FileQuestion className="h-4 w-4" />
                          <span>{course._count.questions}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span className="text-sm">
                            {formatDate(course.createdAt)}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <Button asChild variant="outline" size="sm">
                            <Link to={`/ranking/${course.randomId}`}>
                              View Leaderboard
                            </Link>
                          </Button>

                          <CourseSettingsDialog
                            courseId={course.id}
                            initialQuote={course.quote || ""}
                            initialQuoteAuthor={course.quoteAuthor || ""}
                            initialShowDebt={course.showDebt || false}
                            initialCustomRatingThresholds={
                              course.customRatingThresholds || false
                            }
                            initialThresholds={
                              course.ratingThresholds ||
                              DEFAULT_RATING_THRESHOLDS
                            }
                          >
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={isSaving}
                              title="Course Settings"
                            >
                              <Settings className="h-4 w-4" />
                            </Button>
                          </CourseSettingsDialog>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const url = getRankingUrl(course.randomId);
                              navigator.clipboard.writeText(url);
                              // You could add a toast notification here
                            }}
                            title="Copy ranking URL"
                          >
                            <ExternalLink className="h-4 w-4" />
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

      {/* Statistics Card */}
      {courses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {courses.length}
                </div>
                <div className="text-sm text-muted-foreground">
                  Total Courses
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {courses.reduce(
                    (sum: number, course: Course) =>
                      sum + course._count.canvasUsers,
                    0,
                  )}
                </div>
                <div className="text-sm text-muted-foreground">Total Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {courses.reduce(
                    (sum: number, course: Course) =>
                      sum + course._count.questions,
                    0,
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  Total Questions
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
