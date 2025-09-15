import type { LoaderFunctionArgs } from "react-router";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const response = await fetch(new URL('/api/admin/classes', process.env.VITE_API_BASE_URL || 'http://localhost:3001').toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // Forward any cookies from the client request
        cookie: request.headers.get("cookie") || "",
      },
    });

    const data = await response.json();

    return Response.json(data, { status: response.status });
  } catch (error) {
    console.error("Admin classes proxy error:", error);
    return Response.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
