import { Link } from "react-router";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { BookOpen, Plus, AlertCircle, Megaphone } from "lucide-react";
import { data } from "react-router";
import type { Route } from "./+types/dashboard";

interface DashboardStats {
  canvasUserCount: number;
  announcementCount?: number;
}

interface LoaderData {
  stats: DashboardStats;
  error: string | null;
}

export async function loader({
  request,
}: Route.LoaderArgs): Promise<LoaderData> {
  try {
    const url = new URL(
      "/api/admin/stats",
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
      throw data("Failed to fetch dashboard stats", {
        status: response.status,
      });
    }

    const responseData = await response.json();

    if (!responseData.success) {
      return {
        stats: { canvasUserCount: 0, announcementCount: 0 },
        error: responseData.error || "Failed to fetch dashboard stats",
      };
    }

    return {
      stats: responseData.stats,
      error: null,
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return {
      stats: { canvasUserCount: 0, announcementCount: 0 },
      error: "Failed to connect to server",
    };
  }
}

export default function AdminDashboard({ loaderData }: Route.ComponentProps) {
  const { stats, error } = loaderData;

  const statCards = [
    {
      title: "Canvas Users",
      value: stats.canvasUserCount,
      description: "Canvas LMS users synced",
      icon: BookOpen,
      color: "text-primary",
    },
    {
      title: "Announcements",
      value: stats.announcementCount || 0,
      description: "Total announcements created",
      icon: Megaphone,
      color: "text-primary",
    },
  ];

  return (
    <div className="p-4 sm:p-8 space-y-7">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Workspace overview
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Manage your learning management system
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link to="/admin/courses">
              <BookOpen className="h-4 w-4" aria-hidden="true" />
              Browse Courses
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold tracking-tight tabular-nums">
                  {stat.value.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Error Message */}
      {error && (
        <Card className="border-destructive/20 bg-destructive/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <span className="text-destructive text-sm">{error}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
