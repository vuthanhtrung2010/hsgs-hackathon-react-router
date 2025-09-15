import type { LoaderFunctionArgs } from "react-router";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const response = await fetch(new URL('/api/auth/get-session', process.env.VITE_API_BASE_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001').toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // Forward any cookies from the client request
        cookie: request.headers.get("cookie") || "",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return Response.json(
        { error: "Session not found" },
        { status: response.status },
      );
    }

    return Response.json(data, { status: 200 });
  } catch (error) {
    console.error("Session check proxy error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
