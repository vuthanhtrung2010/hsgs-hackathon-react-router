export async function loader() {
  try {
    const response = await fetch(new URL('/api/admin/stats', process.env.VITE_API_BASE_URL || 'http://localhost:3001').toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return Response.json(
      {
        success: false,
        error: "Failed to fetch admin stats",
      },
      { status: 500 },
    );
  }
}
