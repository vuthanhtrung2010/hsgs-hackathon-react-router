export async function action({ request }: { request: Request }) {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const body = await request.json();

    const response = await fetch(`http://localhost:3001/api/admin/announcements`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Forward cookies for auth
        'Cookie': request.headers.get('Cookie') || '',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error('Error creating announcement:', error);
    return Response.json({
      success: false,
      error: 'Failed to connect to server'
    }, { status: 500 });
  }
}