import type { ActionFunctionArgs } from "react-router";

export async function action({ request }: ActionFunctionArgs) {
  try {
    const body = await request.json();

    const response = await fetch(
      "http://localhost:3001/api/auth/sign-in/email",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      return Response.json(
        { error: data.error || "Login failed" },
        { status: response.status },
      );
    }

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
