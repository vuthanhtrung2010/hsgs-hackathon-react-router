import type { Announcement } from "~/types";

export async function getAnnouncements(
  courseId: string,
): Promise<Announcement[]> {
  try {
    const response = await fetch(
      `/api/announcements/${courseId}?sortBy=createdAt&order=desc`,
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
