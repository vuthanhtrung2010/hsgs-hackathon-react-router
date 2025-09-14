export async function loader({ request }: { request: Request }) {
  if (request.method !== 'GET') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const response = await fetch(`http://localhost:3001/api/admin/announcements`, {
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