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
import { Badge } from "../../components/ui/badge";
import { GraduationCap, Users, Plus, Calendar } from "lucide-react";

interface ClassData {
  id: string;
  name: string;
  memberCount: number;
  createdAt: string;
  updatedAt: string;
}

export default function AdminClasses() {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/admin/classes", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.success) {
        setClasses(data.classes);
      } else {
        setError(data.error || "Failed to fetch classes");
      }
    } catch (err) {
      setError("Failed to connect to server");
      console.error("Error fetching classes:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Classes</h1>
          <p className="text-muted-foreground mt-1">
            Manage all your learning environments
          </p>
        </div>
        <Button asChild>
          <Link to="/admin/classes/create">
            <Plus className="mr-2 h-4 w-4" />
            Create Class
          </Link>
        </Button>
      </div>

      {/* Error State */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-600 text-sm">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchClasses}
              className="mt-2"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Classes Grid */}
      {!loading && !error && (
        <>
          {classes.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <GraduationCap className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No classes yet</h3>
                <p className="text-muted-foreground text-center mb-6 max-w-md">
                  Get started by creating your first class. You can add students
                  and manage content from there.
                </p>
                <Button asChild>
                  <Link to="/admin/classes/create">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Class
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {classes.map((classItem) => (
                <Card
                  key={classItem.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2 flex items-center gap-2">
                          <GraduationCap className="h-5 w-5 text-primary" />
                          {classItem.name}
                        </CardTitle>
                        <CardDescription>
                          Class ID: {classItem.id}
                        </CardDescription>
                      </div>
                      <Badge variant="secondary" className="ml-2">
                        <Users className="h-3 w-3 mr-1" />
                        {classItem.memberCount}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        Created {formatDate(classItem.createdAt)}
                      </div>

                      <div className="flex gap-2">
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="flex-1"
                        >
                          <Link to={`/admin/classes/${classItem.id}`}>
                            View Details
                          </Link>
                        </Button>
                        <Button asChild size="sm" className="flex-1">
                          <Link to={`/admin/classes/${classItem.id}/manage`}>
                            Manage
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* Stats Summary */}
      {!loading && !error && classes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">
                  {classes.length}
                </div>
                <div className="text-sm text-muted-foreground">
                  Total Classes
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {classes.reduce((sum, c) => sum + c.memberCount, 0)}
                </div>
                <div className="text-sm text-muted-foreground">
                  Total Students
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {classes.length > 0
                    ? Math.round(
                        classes.reduce((sum, c) => sum + c.memberCount, 0) /
                          classes.length,
                      )
                    : 0}
                </div>
                <div className="text-sm text-muted-foreground">
                  Avg Students/Class
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
