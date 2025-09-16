import { useEffect, useState } from "react";
import { AnnouncementCard } from "./AnnouncementCard";
import { getAnnouncements } from "../lib/server-actions/announcements";
import Loading from "./Loading";
import type { Announcement } from "~/types";

export function AnnouncementsList() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getAnnouncements();
        setAnnouncements(data);
      } catch (err) {
        setError("Failed to load announcements");
        console.error("Error fetching announcements:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  if (announcements.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No announcements yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {announcements.map((announcement) => (
        <AnnouncementCard key={announcement.id} announcement={announcement} />
      ))}
    </div>
  );
}
