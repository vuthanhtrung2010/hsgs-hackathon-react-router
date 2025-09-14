import type { ActionFunctionArgs } from "react-router";

export async function action({ request }: ActionFunctionArgs) {
  try {
    const body = await request.json();

    const response = await fetch(
      `http://localhost:3001/api/admin/classes/${body.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ students: body.students }),
      },
    );

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error("Error updating class:", error);
    return Response.json(
      {
        success: false,
        error: "Failed to update class",
      },
      { status: 500 },
    );
  }
}
