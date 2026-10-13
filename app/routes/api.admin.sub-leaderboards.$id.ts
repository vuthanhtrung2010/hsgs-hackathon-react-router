import type { Route } from "./+types/api.admin.sub-leaderboards.$id";

export async function loader({ request, params }: Route.LoaderArgs) {
  if (request.method !== "GET") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const baseUrl =
      process.env.VITE_API_BASE_URL ||
      import.meta.env.VITE_API_BASE_URL ||
      "http://localhost:3001";

    const response = await fetch(
      new URL(`/api/admin/sub-leaderboards/${params.id}`, baseUrl).toString(),
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Cookie: request.headers.get("Cookie") || "",
        },
      },
    );

    const data = await response.json();
    return Response.json(data, { status: response.status });
  } catch (error) {
    console.error("Error fetching sub-leaderboard details:", error);
    return Response.json(
      { success: false, error: "Failed to connect to server" },
      { status: 500 },
    );
  }
}

export async function action({ request, params }: Route.ActionArgs) {
  try {
    const baseUrl =
      process.env.VITE_API_BASE_URL ||
      import.meta.env.VITE_API_BASE_URL ||
      "http://localhost:3001";

    const body = request.method === "DELETE" ? null : await request.json();

    const response = await fetch(
      new URL(`/api/admin/sub-leaderboards/${params.id}`, baseUrl).toString(),
      {
        method: request.method,
        headers: {
          "Content-Type": "application/json",
          Cookie: request.headers.get("Cookie") || "",
        },
        body: body ? JSON.stringify(body) : null,
      },
    );

    const data = await response.json();
    return Response.json(data, { status: response.status });
  } catch (error) {
    console.error(`Error ${request.method} sub-leaderboard:`, error);
    return Response.json(
      { success: false, error: "Failed to connect to server" },
      { status: 500 },
    );
  }
}
