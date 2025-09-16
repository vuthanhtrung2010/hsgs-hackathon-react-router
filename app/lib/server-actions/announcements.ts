import type { Announcement } from "~/types";

export async function getAnnouncements(): Promise<Announcement[]> {
  try {
    const response = await fetch(
      "/api/announcements?sortBy=createdAt&order=desc",
    );
    if (!response.ok) {
      throw new Error("Failed to fetch announcements");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching announcements:", error);
    return [];
  }
}
