import type { Route } from "./+types/api.admin.announcements.update";

export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "PUT") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    const response = await fetch(
      new URL(
        `/api/admin/announcements/${id}`,
        process.env.VITE_API_BASE_URL ||
          import.meta.env.VITE_API_BASE_URL ||
          "http://localhost:3001",
      ).toString(),
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          // Forward cookies for auth
          Cookie: request.headers.get("Cookie") || "",
        },
        body: JSON.stringify(updateData),
      },
    );

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error("Error updating announcement:", error);
    return Response.json(
      {
        success: false,
        error: "Failed to connect to server",
      },
      { status: 500 },
    );
  }
}
