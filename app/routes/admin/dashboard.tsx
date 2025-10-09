import { useState, useEffect } from "react";
import { Link } from "react-router";
import {
  Card,
  CardContent,
  CardDescription,
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

interface DashboardStats {
  canvasUserCount: number;
  announcementCount?: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    canvasUserCount: 0,
    announcementCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch("/api/admin/stats", {
        credentials: "include",
      });

      const data = await response.json();

      if (data.success) {
        setStats(data.stats);
      } else {
        setError(data.error || "Failed to fetch stats");
      }
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error);
      setError("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

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
          <Button asChild>
            <Link to="/admin/classes/create">
              <Plus className="mr-2 h-4 w-4" />
              Create Class
            </Link>
          </Button>
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
                <div className="text-2xl font-bold">
                  {loading ? "..." : stat.value}
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
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <span className="text-red-600 text-sm">{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Manage Classes
          </CardTitle>
          <CardDescription>
            View and manage all your classes, add new members, and track
            progress.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link to="/admin/classes">View All Classes</Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/admin/classes/create">Create New Class</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
