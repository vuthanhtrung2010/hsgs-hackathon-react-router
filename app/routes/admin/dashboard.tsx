import { Link } from "react-router";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import {
  GraduationCap,
  BookOpen,
  Plus,
  AlertCircle,
  Megaphone,
} from "lucide-react";
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
      color: "text-purple-600",
    },
    {
      title: "Announcements",
      value: stats.announcementCount || 0,
      description: "Total announcements created",
      icon: Megaphone,
      color: "text-orange-600",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your learning management system
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link to="/admin/announcements/create">
              <Plus className="mr-2 h-4 w-4" />
              New Announcement
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                <div className="text-2xl font-bold">{stat.value}</div>
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
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <span className="text-red-600 text-sm">{error}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
