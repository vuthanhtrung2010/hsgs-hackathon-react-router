import type { Route } from "./+types/api.announcements";

const API_BASE_URL =
  process.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:3001";

export async function loader({ request, params }: Route.LoaderArgs) {
  const { randomizedCourseId } = params;
  const url = new URL(request.url);
  const sortBy = url.searchParams.get("sortBy") || "createdAt";
  const order = url.searchParams.get("order") || "desc";

  try {
    const apiUrl = new URL(
      `/api/announcements/${randomizedCourseId}`,
      API_BASE_URL,
    );
    apiUrl.searchParams.set("sortBy", sortBy);
    apiUrl.searchParams.set("order", order);

    const response = await fetch(apiUrl.toString());

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error("Error proxying announcements request:", error);
    return Response.json(
      { error: "Failed to fetch announcements" },
      { status: 500 },
    );
  }
}
