export async function action({ request }: { request: Request }) {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    // Get the FormData from the request
    const formData = await request.formData();

    // Get the external API URL
    const genApiUrl =
      process.env.VITE_GEN_API_BASE_URL ||
      import.meta.env.VITE_GEN_API_BASE_URL ||
      "http://localhost:8000";

    // Forward the request to the external math generation API
    const response = await fetch(new URL("/math", genApiUrl).toString(), {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      return Response.json(
        {
          success: false,
          error: errorData.error || "Failed to generate math questions",
        },
        { status: response.status },
      );
    }

    // Check if response is JSON (contains link_to_quiz or error)
    const contentType = response.headers.get("Content-Type");
    if (contentType && contentType.includes("application/json")) {
      const jsonData = await response.json();

      if (jsonData.link_to_quiz) {
        // Success with quiz link
        return Response.json({
          success: true,
          link_to_quiz: jsonData.link_to_quiz,
        });
      } else if (jsonData.error) {
        // Error response
        return Response.json({
          success: false,
          error: jsonData.error,
        });
      }
    }

    // Return the file response directly (for test mode)
    const blob = await response.blob();
    return new Response(blob, {
      status: 200,
      headers: {
        "Content-Type":
          response.headers.get("Content-Type") || "application/octet-stream",
        "Content-Disposition":
          response.headers.get("Content-Disposition") ||
          'attachment; filename="response.txt"',
      },
    });
  } catch (error) {
    console.error("Math generation proxy error:", error);
    return Response.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
