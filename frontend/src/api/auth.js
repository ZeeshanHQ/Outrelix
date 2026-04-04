import BACKEND_URL from '../config/backend';

// If using fetch for login:
export async function login(email, password) {
  return fetch(`${BACKEND_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
    credentials: 'include', // This is critical for session sharing!
  });
}