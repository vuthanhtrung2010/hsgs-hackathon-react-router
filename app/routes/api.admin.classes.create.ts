import type { ActionFunctionArgs } from "react-router";

export async function action({ request }: ActionFunctionArgs) {
  try {
    const body = await request.json();

    const response = await fetch(
      new URL(
        "/api/admin/classes",
        process.env.VITE_API_BASE_URL ||
          import.meta.env.VITE_API_BASE_URL ||
          "http://localhost:3001",
      ).toString(),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Forward any cookies from the client request
          cookie: request.headers.get("cookie") || "",
        },
        body: JSON.stringify(body),
      },
    );

    const data = await response.json();

    return Response.json(data, { status: response.status });
  } catch (error) {
    console.error("Create class proxy error:", error);
    return Response.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
