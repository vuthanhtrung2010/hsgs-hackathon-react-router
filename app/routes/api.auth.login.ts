import type { ActionFunctionArgs } from "react-router";

export async function action({ request }: ActionFunctionArgs) {
  try {
    const body = await request.json();

    const response = await fetch(
      new URL(
        "/api/auth/sign-in/email",
        process.env.VITE_API_BASE_URL ||
          import.meta.env.VITE_API_BASE_URL ||
          "http://localhost:3001",
      ).toString(),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      },
    );

    if (!response.ok) {
      // If response is not ok, try to get error message from response
      let errorMessage = "Login failed";
      try {
        const errorData = await response.json();
        if (errorData && errorData.error) {
          errorMessage = errorData.error;
        }
      } catch {
        // If we can't parse JSON, try to get text
        try {
          const errorText = await response.text();
          if (errorText) {
            errorMessage = errorText;
          }
        } catch {
          // Use default error message
        }
      }
      return Response.json(
        { error: errorMessage },
        { status: response.status },
      );
    }

    const data = await response.json();

    // Forward the response with any cookies/headers
    const result = Response.json(data, { status: 200 });

    // Copy any authentication cookies from the backend response
    const setCookieHeader = response.headers.get("set-cookie");
    if (setCookieHeader) {
      result.headers.set("set-cookie", setCookieHeader);
    }

    return result;
  } catch (error) {
    console.error("Login proxy error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
