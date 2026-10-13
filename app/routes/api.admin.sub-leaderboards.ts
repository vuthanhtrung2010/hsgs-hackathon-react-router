export async function action({ request }: { request: Request }) {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const body = await request.json();
    const baseUrl =
      process.env.VITE_API_BASE_URL ||
      import.meta.env.VITE_API_BASE_URL ||
      "http://localhost:3001";

    const response = await fetch(
      new URL("/api/admin/sub-leaderboards", baseUrl).toString(),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: request.headers.get("Cookie") || "",
        },
        body: JSON.stringify(body),
      },
    );

    const data = await response.json();
    return Response.json(data, { status: response.status });
  } catch (error) {
    console.error("Error creating sub-leaderboard:", error);
    return Response.json(
      { success: false, error: "Failed to connect to server" },
      { status: 500 },
    );
  }
}
