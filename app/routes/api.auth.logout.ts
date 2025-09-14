import type { ActionFunctionArgs } from "react-router";

export async function action({ request }: ActionFunctionArgs) {
  try {
    const response = await fetch('http://localhost:3001/api/auth/sign-out', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Forward any cookies from the client request
        'cookie': request.headers.get('cookie') || '',
      },
    });

    if (!response.ok) {
      return Response.json(
        { error: 'Logout failed' },
        { status: response.status }
      );
    }

    // Forward the response with any cookies/headers to clear them
    const result = Response.json({ success: true }, { status: 200 });
    
    // Copy any authentication cookies from the backend response (likely clearing them)
    const setCookieHeader = response.headers.get('set-cookie');
    if (setCookieHeader) {
      result.headers.set('set-cookie', setCookieHeader);
    }

    return result;
  } catch (error) {
    console.error('Logout proxy error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}