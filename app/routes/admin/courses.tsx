import { Link, useLoaderData } from "react-router";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { ExternalLink, Users, FileQuestion, Calendar } from "lucide-react";
import { data } from "react-router";

interface Course {
  id: string;
  name: string;
  randomId: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    canvasUsers: number;
    questions: number;
  };
}

export async function loader({ request }: { request: Request }) {
  try {
    const url = new URL(
      "/api/admin/courses",
      process.env.VITE_API_BASE_URL ||
        import.meta.env.VITE_API_BASE_URL ||
        "https://api.example.com"
    );

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Cookie": request.headers.get("Cookie") || "",
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
      throw data(responseData.error || "Failed to fetch courses", { status: 500 });
    }

    return { courses: responseData.courses, error: null };
  } catch (error) {
    console.error("Error fetching courses:", error);
    return { courses: [], error: "Failed to connect to server" };
  }
}

export default function AdminCourses() {
  const { courses, error } = useLoaderData<{
    courses: Course[];
    error: string | null;
  }>();

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
                    <th className="text-left py-3 px-4 font-medium">Course Name</th>
                    <th className="text-left py-3 px-4 font-medium">Course ID</th>
                    <th className="text-center py-3 px-4 font-medium">Users</th>
                    <th className="text-center py-3 px-4 font-medium">Questions</th>
                    <th className="text-center py-3 px-4 font-medium">Created</th>
                    <th className="text-center py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((course) => (
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
                          <Button
                            asChild
                            variant="outline"
                            size="sm"
                          >
                            <Link to={`/ranking/${course.randomId}`}>
                              View Leaderboard
                            </Link>
                          </Button>
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
                <div className="text-sm text-muted-foreground">Total Courses</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {courses.reduce((sum, course) => sum + course._count.canvasUsers, 0)}
                </div>
                <div className="text-sm text-muted-foreground">Total Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {courses.reduce((sum, course) => sum + course._count.questions, 0)}
                </div>
                <div className="text-sm text-muted-foreground">Total Questions</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}