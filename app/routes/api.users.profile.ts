export async function loader({ request }: { request: Request }) {
  try {
    const response = await fetch(
      new URL(
        "/api/users/profile",
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
    console.error("Error fetching user profile:", error);
    return Response.json(
      {
        success: false,
        error: "Failed to connect to server",
      },
      { status: 500 },
    );
  }
}

export async function action({ request }: { request: Request }) {
  if (request.method !== "PUT") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const body = await request.json();

    const response = await fetch(
      new URL(
        "/api/users/profile",
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
        body: JSON.stringify(body),
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
    console.error("Error updating user profile:", error);
    return Response.json(
      {
        success: false,
        error: "Failed to connect to server",
      },
      { status: 500 },
    );
  }
}