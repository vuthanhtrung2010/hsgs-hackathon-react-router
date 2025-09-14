export async function loader({ request, params }: { request: Request, params: { id: string } }) {
  if (request.method !== 'GET') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const response = await fetch(`http://localhost:3001/api/admin/announcements/${params.id}`, {
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
    console.error('Error fetching announcement:', error);
    return Response.json({
      success: false,
      error: 'Failed to connect to server'
    }, { status: 500 });
  }
}

export async function action({ request, params }: { request: Request, params: { id: string } }) {
  try {
    const body = request.method === 'DELETE' ? null : await request.json();
    
    const response = await fetch(`http://localhost:3001/api/admin/announcements/${params.id}`, {
      method: request.method,
      headers: {
        'Content-Type': 'application/json',
        // Forward cookies for auth
        'Cookie': request.headers.get('Cookie') || '',
      },
      body: body ? JSON.stringify(body) : null,
    });

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error(`Error ${request.method} announcement:`, error);
    return Response.json({
      success: false,
      error: 'Failed to connect to server'
    }, { status: 500 });
  }
}