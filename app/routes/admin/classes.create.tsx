import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { AlertCircle, ArrowLeft, GraduationCap, Users } from 'lucide-react';

export default function CreateClass() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    userNames: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!formData.name.trim()) {
      setError('Class name is required');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/admin/classes/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: formData.name.trim(),
          userNames: formData.userNames.trim()
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Redirect to classes list with success message
        navigate('/admin/classes');
      } else {
        setError(data.error || 'Failed to create class');
      }
    } catch (err) {
      setError('Failed to connect to server');
      console.error('Error creating class:', err);
    } finally {
      setLoading(false);
    }
  };

  const getUserCount = () => {
    if (!formData.userNames.trim()) return 0;
    return formData.userNames
      .split(',')
      .map(name => name.trim())
      .filter(name => name.length > 0)
      .length;
  };

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/admin/classes')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Classes
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Create New Class</h1>
          <p className="text-muted-foreground mt-1">
            Set up a new learning environment for your students
          </p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Class Information
          </CardTitle>
          <CardDescription>
            Enter the basic information for your new class
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

            {/* Class Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Class Name *</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="e.g., Advanced Mathematics"
                required
                value={formData.name}
                onChange={handleChange}
              />
              <p className="text-sm text-muted-foreground">
                A descriptive name for your class that students will see
              </p>
            </div>

            {/* User Names */}
            <div className="space-y-2">
              <Label htmlFor="userNames">
                Student Names (Optional)
                {getUserCount() > 0 && (
                  <span className="ml-2 text-sm text-muted-foreground">
                    ({getUserCount()} students)
                  </span>
                )}
              </Label>
              <textarea
                id="userNames"
                name="userNames"
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="John Doe, Jane Smith, Mike Johnson, Sarah Davis"
                value={formData.userNames}
                onChange={handleChange}
              />
              <p className="text-sm text-muted-foreground">
                Enter student names separated by commas. You can add more students later.
              </p>
            </div>

            {/* Preview */}
            {(formData.name || getUserCount() > 0) && (
              <Card className="bg-muted/50">
                <CardHeader>
                  <CardTitle className="text-base">Preview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-primary" />
                    <span className="font-medium">
                      {formData.name || 'Class Name'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    {getUserCount()} students
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/admin/classes')}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Class'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}