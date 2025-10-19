import { useState, useEffect } from "react";
import { Link } from "react-router";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Plus, Megaphone, Calendar, Trash2 } from "lucide-react";
import { SaveDialog } from "../../components/ui/save-dialog";
import type { SaveDialogContent } from "../../components/ui/save-dialog";
import CourseSelector from "../../components/CourseSelector";
import type { Route } from "./+types/announcements";

interface Announcement {
  id: string;
  title: string;
  content: string;
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

export default function Announcements({ loaderData }: Route.ComponentProps) {
  const { courses } = loaderData;
  const [selectedCourseId, setSelectedCourseId] = useState<string>(
    courses[0]?.randomId || ""
  );
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(courses.length === 0 ? false : true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteDialogContent, setDeleteDialogContent] =
    useState<SaveDialogContent | null>(null);

  const fetchAnnouncements = async () => {
    if (!selectedCourseId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/admin/announcements/course/${selectedCourseId}`,
        {
          credentials: "include",
        }
      );
      const data = await response.json();

      if (data.success) {
        setAnnouncements(data.announcements);
        setError(null);
      } else {
        setError(data.error || "Failed to fetch announcements");
      }
    } catch (err) {
      setError("Failed to connect to server");
      console.error("Error fetching announcements:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, [selectedCourseId]);

  const handleDelete = async (announcementId: string, title: string) => {
    setDeleteDialogContent({
      title: "Delete Announcement",
      description: `Are you sure you want to delete "${title}"? This action cannot be undone.`,
      type: "confirm",
      confirmText: "Delete",
      onConfirm: async () => {
        try {
          const response = await fetch(
            `/api/admin/announcements/${announcementId}`,
            {
              method: "DELETE",
              credentials: "include",
            }
          );
          const data = await response.json();

          if (data.success) {
            setAnnouncements((prev) =>
              prev.filter((a) => a.id !== announcementId)
            );
            setDeleteDialogContent({
              title: "Success",
              description: "Announcement deleted successfully.",
              type: "success",
            });
            setDeleteDialogOpen(true);
          } else {
            setDeleteDialogContent({
              title: "Error",
              description: data.error || "Failed to delete announcement.",
              type: "error",
            });
            setDeleteDialogOpen(true);
          }
        } catch (err) {
          console.error("Error deleting announcement:", err);
          setDeleteDialogContent({
            title: "Error",
            description: "Failed to connect to server.",
            type: "error",
          });
          setDeleteDialogOpen(true);
        }
      },
    });
    setDeleteDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // No courses available
  if (courses.length === 0) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <Megaphone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No courses available</h3>
            <p className="text-muted-foreground">
              Please add courses before creating announcements.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Announcements</h1>
          <p className="text-muted-foreground mt-1">
            Manage and create announcements for your courses
          </p>
        </div>
        <div className="flex items-center gap-3">
          <CourseSelector
            selectedCourseId={selectedCourseId}
            onCourseChange={setSelectedCourseId}
            courses={courses.map((c) => ({ id: c.randomId, name: c.name }))}
          />
          <Button asChild disabled={!selectedCourseId}>
            <Link to={`/admin/announcements/${selectedCourseId}/create`}>
              <Plus className="h-4 w-4 mr-2" />
              New Announcement
            </Link>
          </Button>
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
      {!loading && !error && announcements.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <Megaphone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No announcements yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first announcement to get started.
            </p>
            <Button asChild>
              <Link to={`/admin/announcements/${selectedCourseId}/create`}>
                <Plus className="h-4 w-4 mr-2" />
                Create Announcement
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Announcements List */}
      {announcements.length > 0 && (
        <div className="grid gap-4">
          {announcements.map((announcement) => (
            <Card
              key={announcement.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">
                      <Link
                        to={`/admin/announcements/${announcement.id}/edit`}
                        className="hover:text-primary transition-colors"
                      >
                        {announcement.title}
                      </Link>
                    </CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Created {formatDate(announcement.createdAt)}</span>
                      {announcement.updatedAt !== announcement.createdAt && (
                        <span>
                          • Updated {formatDate(announcement.updatedAt)}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      handleDelete(announcement.id, announcement.title)
                    }
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              {announcement.content && (
                <CardContent>
                  <p className="text-muted-foreground line-clamp-2">
                    {announcement.content}
                  </p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      <SaveDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        content={deleteDialogContent}
      />
    </div>
  );
}
