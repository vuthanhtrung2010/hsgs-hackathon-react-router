import { useState } from "react";
import { useNavigate, useParams, Form, redirect } from "react-router";
import type { Route } from "./+types/announcements.create";
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
import { AlertCircle, ArrowLeft, Megaphone } from "lucide-react";

export async function action({ request, params }: Route.ActionArgs) {
  const { randomizedCourseId } = params;

  if (!randomizedCourseId) {
    return {
      success: false,
      error: "Course ID is required",
    };
  }

  const formData = await request.formData();
  const title = formData.get("title");

  if (!title || typeof title !== "string" || !title.trim()) {
    return {
      success: false,
      error: "Title is required",
    };
  }

  try {
    const response = await fetch(
      new URL(
        `/api/admin/announcements/course/${randomizedCourseId}`,
        process.env.VITE_API_BASE_URL ||
          import.meta.env.VITE_API_BASE_URL ||
          "http://localhost:3001",
      ).toString(),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: request.headers.get("Cookie") || "",
        },
        body: JSON.stringify({
          title: title.trim(),
        }),
      },
    );

    const data = await response.json();

    if (data.success) {
      // Redirect to edit page
      return redirect(`/admin/announcements/${data.announcement.id}/edit`);
    } else {
      return {
        success: false,
        error: data.error || "Failed to create announcement",
      };
    }
  } catch (err) {
    console.error("Error creating announcement:", err);
    return {
      success: false,
      error: "Failed to connect to server",
    };
  }
}

export default function CreateAnnouncement({
  actionData,
}: Route.ComponentProps) {
  const navigate = useNavigate();
  const { randomizedCourseId } = useParams<{ randomizedCourseId: string }>();
  const [title, setTitle] = useState("");

  if (!randomizedCourseId) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600">Course ID is required</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/admin/announcements")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Announcements
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Create New Announcement
          </h1>
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
            Enter a title for your announcement. You can add content after
            creation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form method="post" className="space-y-6">
            {/* Error Message */}
            {actionData && !actionData.success && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <span className="text-red-600 text-sm">
                    {actionData.error}
                  </span>
                </div>
              </div>
            )}

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                name="title"
                type="text"
                placeholder="e.g., Important Update for All Students"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
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
                    <span className="font-medium">{title}</span>
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
                onClick={() => navigate("/admin/announcements")}
              >
                Cancel
              </Button>
              <Button type="submit">Create & Edit</Button>
            </div>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
