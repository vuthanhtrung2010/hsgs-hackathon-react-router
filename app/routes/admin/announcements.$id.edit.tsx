import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import MarkdownMaster from "../../components/ui/markdown-master/markdown-master";
import Loading from "../../components/Loading";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "../../components/ui/button";

interface Announcement {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export default function EditAnnouncement() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchAnnouncement = async () => {
      try {
        const response = await fetch(`/api/admin/announcements/${id}`, {
          credentials: "include",
        });

        const data = await response.json();

        if (data.success) {
          setAnnouncement(data.announcement);
        } else {
          setError(data.error || "Failed to fetch announcement");
        }
      } catch (err) {
        setError("Failed to connect to server");
        console.error("Error fetching announcement:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncement();
  }, [id]);

  if (loading) {
    return <Loading />;
  }

  if (error || !announcement) {
    return (
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/admin/announcements")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Announcements
          </Button>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <span className="text-red-600 text-sm">
              {error || "Announcement not found"}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <MarkdownMaster
        title={announcement.title}
        titleKey={announcement.id}
        initialContent={announcement.content}
        placeholder="Start writing your announcement..."
        saveConfig={{
          endpoint: `/api/admin/announcements/${announcement.id}`,
          method: "PUT",
          transformPayload: (content: string) => ({
            title: announcement.title,
            content: content,
          }),
          onSuccess: {
            title: "Announcement Updated",
            description:
              "Announcement content saved successfully. Do you want to go back to the announcements list?",
            redirectPath: "/admin/announcements",
            confirmText: "Go to List",
          },
          errorMessages: {
            INSUFFICIENT_PERMISSIONS:
              "You are not authorized to perform this operation.",
            ANNOUNCEMENT_NOT_FOUND:
              "The announcement you are trying to edit does not exist.",
            VALIDATION_ERROR: "Please check your input and try again.",
          },
        }}
      />
    </div>
  );
}
