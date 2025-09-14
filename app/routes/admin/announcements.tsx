import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Plus, Megaphone, Calendar } from 'lucide-react';

interface Announcement {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export default function Announcements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const response = await fetch('/api/admin/announcements', {
        credentials: 'include',
      });
      const data = await response.json();

      if (data.success) {
        setAnnouncements(data.announcements);
      } else {
        setError(data.error || 'Failed to fetch announcements');
      }
    } catch (err) {
      setError('Failed to connect to server');
      console.error('Error fetching announcements:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Announcements</h1>
          <p className="text-muted-foreground mt-1">
            Manage and create announcements for your organization
          </p>
        </div>
        <Button asChild>
          <Link to="/admin/announcements/create">
            <Plus className="h-4 w-4 mr-2" />
            New Announcement
          </Link>
        </Button>
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
              <Link to="/admin/announcements/create">
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
            <Card key={announcement.id} className="hover:shadow-md transition-shadow">
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
                        <span>• Updated {formatDate(announcement.updatedAt)}</span>
                      )}
                    </div>
                  </div>
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
    </div>
  );
}