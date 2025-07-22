export async function loader() {
  try {
    const url = new URL(
      "/api/courses",
      process.env.VITE_API_BASE_URL ||
        import.meta.env.VITE_API_BASE_URL ||
        "https://api.example.com"
    );

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch courses" }),
        {
          status: response.status,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching courses:", error);
    // Return fallback data
    return new Response(
      JSON.stringify([{ id: "default", name: "Default Course" }]),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
