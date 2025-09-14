import type { LoaderFunctionArgs, ActionFunctionArgs } from 'react-router';

export async function loader({ params }: LoaderFunctionArgs) {
  try {
    const response = await fetch(`http://localhost:3001/api/admin/classes/${params.id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching class details:', error);
    return {
      success: false,
      error: 'Failed to fetch class details'
    };
  }
}

export async function action({ params, request }: ActionFunctionArgs) {
  if (request.method === 'PUT') {
    try {
      const body = await request.json();
      
      const response = await fetch(`http://localhost:3001/api/admin/classes/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating class:', error);
      return {
        success: false,
        error: 'Failed to update class'
      };
    }
  }

  return {
    success: false,
    error: 'Method not allowed'
  };
}