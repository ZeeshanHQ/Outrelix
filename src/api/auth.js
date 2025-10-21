// If using fetch for login:
export async function login(email, password) {
  return fetch('http://localhost:5000/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
    credentials: 'include', // This is critical for session sharing!
  });
} 