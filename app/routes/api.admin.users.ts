export async function loader({ request }: { request: Request }) {
  if (request.method !== "GET") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const response = await fetch(
      new URL(
        "/api/admin/users",
        process.env.VITE_API_BASE_URL ||
          import.meta.env.VITE_API_BASE_URL ||
          "http://localhost:3001",
      ).toString(),
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          // Forward cookies for auth
          Cookie: request.headers.get("Cookie") || "",
        },
      },
    );

    if (!response.ok) {
      // If response is not ok, try to get error message from response
      let errorMessage = `Server error: ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.text();
        if (errorData) {
          errorMessage = errorData;
        }
      } catch {
        // If we can't read the response body, use the default error message
      }
      return Response.json(
        {
          success: false,
          error: errorMessage,
        },
        { status: response.status },
      );
    }

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error("Error fetching users:", error);
    return Response.json(
      {
        success: false,
        error: "Failed to connect to server",
      },
      { status: 500 },
    );
  }
}