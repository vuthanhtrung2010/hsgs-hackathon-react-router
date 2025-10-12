import type { Route } from "./+types/api.admin.announcements.create";

export async function action({
  request,
  params,
}: Route.LoaderArgs) {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const { randomizedCourseId } = params;

  try {
    const body = await request.json();

    const response = await fetch(
      new URL(
        `/api/admin/announcements/${randomizedCourseId}`,
        process.env.VITE_API_BASE_URL ||
          import.meta.env.VITE_API_BASE_URL ||
          "http://localhost:3001",
      ).toString(),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Forward cookies for auth
          Cookie: request.headers.get("Cookie") || "",
        },
        body: JSON.stringify(body),
      },
    );

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error("Error creating announcement:", error);
    return Response.json(
      {
        success: false,
        error: "Failed to connect to server",
      },
      { status: 500 },
    );
  }
}
