export async function loader({ request }: { request: Request }) {
  if (request.method !== 'GET') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const response = await fetch(new URL('/api/admin/announcements', process.env.VITE_API_BASE_URL || 'http://localhost:3001').toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Forward cookies for auth
        'Cookie': request.headers.get('Cookie') || '',
      },
    });

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error('Error fetching announcements:', error);
    return Response.json({
      success: false,
      error: 'Failed to connect to server'
    }, { status: 500 });
  }
}