// src/pages/api/campaign/start.js

// This route now acts as a proxy to your Python backend.
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Forward the request to the Python backend
    const backendResponse = await fetch('http://localhost:5000/api/campaign/start', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Forward cookies from the client to the backend to maintain session
        'Cookie': req.headers.cookie || '',
      },
      body: JSON.stringify(req.body),
    });

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json();
      // Forward the status code and error message from the backend
      return res.status(backendResponse.status).json(errorData);
    }

    const data = await backendResponse.json();
    res.status(202).json(data);

  } catch (error) {
    console.error('Error proxying to backend:', error);
    res.status(500).json({ message: 'Error starting campaign' });
  }
} 