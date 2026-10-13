import { useState, useEffect } from "react";
import { Link } from "react-router";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import {
  Plus,
  Trophy,
  ExternalLink,
  Edit,
  Trash2,
  Users,
  Calendar,
} from "lucide-react";
import { SaveDialog } from "../../components/ui/save-dialog";
import type { SaveDialogContent } from "../../components/ui/save-dialog";
import CourseSelector from "../../components/CourseSelector";
import SubLeaderboardDialog from "../../components/SubLeaderboardDialog";
import type { Route } from "./+types/sub-leaderboards";

interface SubLeaderboardItem {
  id: string;
  name: string;
  courseId: string;
  memberCount: number;
  createdAt: string;
  updatedAt: string;
}

interface Course {
  id: string;
  name: string;
  randomId: string;
}

export async function loader({ request }: Route.LoaderArgs) {
  try {
    const baseUrl =
      process.env.VITE_API_BASE_URL ||
      import.meta.env.VITE_API_BASE_URL ||
      "http://localhost:3001";

    const response = await fetch(new URL("/api/courses", baseUrl).toString(), {
      headers: {
        Cookie: request.headers.get("Cookie") || "",
      },
    });
    const courses = response.ok ? ((await response.json()) as Course[]) : [];
    return { courses };
  } catch (error) {
    console.error("Error loading courses:", error);
    return { courses: [] };
  }
}

export default function SubLeaderboardsAdmin({
  loaderData,
}: Route.ComponentProps) {
  const { courses } = loaderData;
  const [selectedCourseId, setSelectedCourseId] = useState<string>(
    courses[0]?.id || courses[0]?.randomId || "",
  );
  const [subLeaderboards, setSubLeaderboards] = useState<SubLeaderboardItem[]>(
    [],
  );
  const [loading, setLoading] = useState(
    Boolean(courses[0]?.id || courses[0]?.randomId),
  );
  const [error, setError] = useState<string | null>(null);

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingSubLb, setEditingSubLb] = useState<SubLeaderboardItem | null>(
    null,
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteDialogContent, setDeleteDialogContent] =
    useState<SaveDialogContent | null>(null);

  const fetchSubLeaderboards = async () => {
    if (!selectedCourseId) {
      setSubLeaderboards([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/admin/sub-leaderboards/course/${selectedCourseId}`,
        { credentials: "include" },
      );
      const data = await response.json();
      if (data.success) {
        setSubLeaderboards(data.subLeaderboards || []);
      } else {
        setError(data.error || "Failed to load sub-leaderboards");
      }
    } catch (err) {
      setError("Failed to connect to server");
      console.error("Error fetching sub-leaderboards:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubLeaderboards();
  }, [selectedCourseId]);

  const handleDelete = (subLb: SubLeaderboardItem) => {
    setDeleteDialogContent({
      title: "Delete Sub-Leaderboard",
      description: `Are you sure you want to delete "${subLb.name}"? This action cannot be undone.`,
      type: "confirm",
      confirmText: "Delete",
      onConfirm: async () => {
        try {
          const response = await fetch(
            `/api/admin/sub-leaderboards/${subLb.id}`,
            {
              method: "DELETE",
              credentials: "include",
            },
          );
          const data = await response.json();
          if (data.success) {
            setSubLeaderboards((prev) =>
              prev.filter((item) => item.id !== subLb.id),
            );
          } else {
            alert(data.error || "Failed to delete sub-leaderboard");
          }
        } catch (err) {
          console.error("Error deleting sub-leaderboard:", err);
          alert("Failed to delete sub-leaderboard");
        }
      },
    });
    setDeleteDialogOpen(true);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Sub-Leaderboards
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage scoped class sections and cohort leaderboards
          </p>
        </div>
        <Button
          onClick={() => setCreateDialogOpen(true)}
          disabled={!selectedCourseId}
          className="flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          New Sub-Leaderboard
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-sm font-medium">Select Course:</span>
        <CourseSelector
          selectedCourseId={selectedCourseId}
          onCourseChange={(courseId) => setSelectedCourseId(courseId)}
          courses={courses}
        />
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
          <CardContent className="pt-6">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </CardContent>
        </Card>
      )}

      {!selectedCourseId ? (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No course selected</h3>
            <p className="text-muted-foreground">
              Please select a course from the dropdown above to view and manage
              its sub-leaderboards.
            </p>
          </CardContent>
        </Card>
      ) : loading ? (
        <div className="text-center py-12 text-muted-foreground">
          Loading sub-leaderboards...
        </div>
      ) : subLeaderboards.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              No sub-leaderboards found
            </h3>
            <p className="text-muted-foreground mb-4">
              No sub-leaderboards exist for this course yet.
            </p>
            <Button
              variant="outline"
              onClick={() => setCreateDialogOpen(true)}
              disabled={!selectedCourseId}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create First Sub-Leaderboard
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>
              Course Sub-Leaderboards ({subLeaderboards.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Name</th>
                    <th className="text-center py-3 px-4 font-medium">
                      Members
                    </th>
                    <th className="text-center py-3 px-4 font-medium">
                      Created
                    </th>
                    <th className="text-right py-3 px-4 font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {subLeaderboards.map((subLb) => (
                    <tr
                      key={subLb.id}
                      className="border-b hover:bg-muted/50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Button asChild variant="ghost" size="sm">
                            <Link
                              to={`/ranking/sub/${subLb.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Link>
                          </Button>
                          <div>
                            <div className="font-medium text-foreground">
                              <Link
                                to={`/ranking/sub/${subLb.id}`}
                                className="text-primary hover:underline"
                              >
                                {subLb.name}
                              </Link>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              ID: {subLb.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                          <Users className="h-3 w-3" />
                          <span>{subLb.memberCount} members</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center text-sm text-muted-foreground">
                        <div className="flex items-center justify-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{formatDate(subLb.createdAt)}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingSubLb(subLb)}
                          >
                            <Edit className="h-3.5 w-3.5 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(subLb)}
                          >
                            <Trash2 className="h-3.5 w-3.5 mr-1" />
                            Delete
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

      {/* Create Dialog */}
      {createDialogOpen && (
        <SubLeaderboardDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          mode="create"
          courseId={selectedCourseId}
          onSuccess={() => {
            setCreateDialogOpen(false);
            fetchSubLeaderboards();
          }}
        />
      )}

      {/* Edit Dialog */}
      {editingSubLb && (
        <SubLeaderboardDialog
          open={!!editingSubLb}
          onOpenChange={(open) => !open && setEditingSubLb(null)}
          mode="edit"
          courseId={selectedCourseId}
          subLeaderboardId={editingSubLb.id}
          initialName={editingSubLb.name}
          onSuccess={() => {
            setEditingSubLb(null);
            fetchSubLeaderboards();
          }}
        />
      )}

      {/* Delete Confirmation */}
      {deleteDialogContent && (
        <SaveDialog
          open={deleteDialogOpen}
          onOpenChange={(open) => {
            setDeleteDialogOpen(open);
            if (!open) setDeleteDialogContent(null);
          }}
          content={deleteDialogContent}
        />
      )}
    </div>
  );
}
