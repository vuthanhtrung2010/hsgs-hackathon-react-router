import type { LoaderFunctionArgs } from "react-router";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const response = await fetch('http://localhost:3001/api/auth/get-session', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Forward any cookies from the client request
        'cookie': request.headers.get('cookie') || '',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return Response.json(
        { error: 'Session not found' },
        { status: response.status }
      );
    }

    return Response.json(data, { status: 200 });
  } catch (error) {
    console.error('Session check proxy error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}