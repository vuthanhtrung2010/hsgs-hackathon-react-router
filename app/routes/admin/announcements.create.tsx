import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { AlertCircle, ArrowLeft, Megaphone } from 'lucide-react';

export default function CreateAnnouncement() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!title.trim()) {
      setError('Title is required');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/admin/announcements/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          title: title.trim(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Redirect to edit page
        navigate(`/admin/announcements/${data.announcement.id}/edit`);
      } else {
        setError(data.error || 'Failed to create announcement');
      }
    } catch (err) {
      setError('Failed to connect to server');
      console.error('Error creating announcement:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/admin/announcements')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Announcements
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Create New Announcement</h1>
          <p className="text-muted-foreground mt-1">
            Start with a title, then edit the content after creation
          </p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="h-5 w-5" />
            Announcement Details
          </CardTitle>
          <CardDescription>
            Enter a title for your announcement. You can add content after creation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <span className="text-red-600 text-sm">{error}</span>
                </div>
              </div>
            )}

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                type="text"
                placeholder="e.g., Important Update for All Students"
                required
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setError(null);
                }}
              />
              <p className="text-sm text-muted-foreground">
                A clear and descriptive title for your announcement
              </p>
            </div>

            {/* Preview */}
            {title && (
              <Card className="bg-muted/50">
                <CardHeader>
                  <CardTitle className="text-base">Preview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Megaphone className="h-4 w-4 text-primary" />
                    <span className="font-medium">
                      {title}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Content will be added in the editor after creation
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/admin/announcements')}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create & Edit'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}