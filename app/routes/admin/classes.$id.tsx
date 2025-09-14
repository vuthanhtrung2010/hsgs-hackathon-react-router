import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Badge } from "../../components/ui/badge";
import {
  AlertCircle,
  ArrowLeft,
  Edit2,
  Save,
  X,
  Plus,
  Trash2,
  Users,
  GraduationCap,
} from "lucide-react";

interface ClassData {
  id: string;
  name: string;
  students: string[];
  memberCount: number;
  createdAt: string;
  updatedAt: string;
}

export default function ClassDetails() {
  const params = useParams();
  const navigate = useNavigate();
  const [classData, setClassData] = useState<ClassData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [editedStudents, setEditedStudents] = useState<string[]>([]);
  const [newStudent, setNewStudent] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchClassData();
  }, [params.id]);

  const fetchClassData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/classes/${params.id}`, {
        credentials: "include",
      });

      const data = await response.json();

      if (data.success) {
        setClassData(data.class);
        setEditedStudents(data.class.students);
      } else {
        setError(data.error || "Failed to fetch class data");
      }
    } catch (err) {
      setError("Failed to connect to server");
      console.error("Error fetching class data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditing(true);
    setEditedStudents([...classData!.students]);
  };

  const handleCancel = () => {
    setEditing(false);
    setEditedStudents([...classData!.students]);
    setNewStudent("");
  };

  const handleAddStudent = () => {
    if (newStudent.trim() && !editedStudents.includes(newStudent.trim())) {
      setEditedStudents([...editedStudents, newStudent.trim()]);
      setNewStudent("");
    }
  };

  const handleRemoveStudent = (index: number) => {
    setEditedStudents(editedStudents.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const response = await fetch(`/api/admin/classes/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          students: editedStudents,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setClassData((prev) =>
          prev
            ? {
                ...prev,
                students: editedStudents,
                memberCount: editedStudents.length,
              }
            : null,
        );
        setEditing(false);
        setNewStudent("");
      } else {
        setError(data.error || "Failed to update class");
      }
    } catch (err) {
      setError("Failed to connect to server");
      console.error("Error updating class:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/admin/classes")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Classes
          </Button>
        </div>
        <div className="text-center py-12">
          <div className="animate-pulse">Loading class details...</div>
        </div>
      </div>
    );
  }

  if (error || !classData) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/admin/classes")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Classes
          </Button>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <span>{error || "Class not found"}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/admin/classes")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Classes
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <GraduationCap className="h-8 w-8" />
              {classData.name}
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage students in this class
            </p>
          </div>
        </div>

        {!editing && (
          <Button onClick={handleEdit}>
            <Edit2 className="h-4 w-4 mr-2" />
            Edit Students
          </Button>
        )}
      </div>

      {/* Class Info */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Students
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {editing ? editedStudents.length : classData.memberCount}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Created</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              {new Date(classData.createdAt).toLocaleDateString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Updated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              {new Date(classData.updatedAt).toLocaleDateString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Students List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Students
              </CardTitle>
              <CardDescription>
                {editing
                  ? "Edit the list of students in this class"
                  : "List of all students in this class"}
              </CardDescription>
            </div>

            {editing && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <span className="text-red-600 text-sm">{error}</span>
              </div>
            </div>
          )}

          {editing ? (
            <div className="space-y-4">
              {/* Add New Student */}
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    placeholder="Enter student name"
                    value={newStudent}
                    onChange={(e) => setNewStudent(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddStudent();
                      }
                    }}
                  />
                </div>
                <Button
                  onClick={handleAddStudent}
                  disabled={!newStudent.trim()}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>

              {/* Students List - Edit Mode */}
              <div className="space-y-2">
                {editedStudents.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No students in this class yet. Add some above.
                  </p>
                ) : (
                  editedStudents.map((student, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <span className="font-medium">{student}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveStudent(index)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {classData.students.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No students in this class yet.
                </p>
              ) : (
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {classData.students.map((student, index) => (
                    <div key={index} className="p-3 bg-muted/50 rounded-lg">
                      <span className="font-medium">{student}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
