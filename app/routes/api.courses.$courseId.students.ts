import type { Route } from "./+types/api.courses.$courseId.students";

export async function loader({ request, params }: Route.LoaderArgs) {
  if (request.method !== "GET") {
    return new Response("Method not allowed", { status: 405 });
  }

  const { courseId } = params;

  try {
    const baseUrl =
      process.env.VITE_API_BASE_URL ||
      import.meta.env.VITE_API_BASE_URL ||
      "http://localhost:3001";

    const response = await fetch(
      new URL(`/api/courses/${courseId}/students`, baseUrl).toString(),
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
    console.error(`Error fetching students for course ${courseId}:`, error);
    return Response.json(
      { success: false, error: "Failed to connect to server" },
      { status: 500 },
    );
  }
}
