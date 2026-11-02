// A small helper function that every page uses to talk to the Java backend.

// Saving the login
// When someone signs in, the backend sends back a "token" (a long piece of text).
//We save it in the browser and send it with every request, so the backend knows who they are and what role they have.

export function saveToken(token) {
  sessionStorage.setItem('token', token);
}
export function getToken() {
  return sessionStorage.getItem('token');
}
export function signOut() {
  sessionStorage.removeItem('token');
}
//Returns the role of the person signed in, or null if no one signed in.
//The token has 3 parts seperated by dots. The middle part holds the role.

export function getRole() {
  const token = getRole() {
    const token = getToken();
    if (!token) {
      return null;
    }
    const middlePart = token.split('.')[1];
    const info =JSON.parse(atob(middlePart.replace(/-/g, '+').replace(/_/g, '/')));
    return info.role;
  }
//Talking to the backend
export async function apiRequest(method, url, body) {
  const options = {
    method: method,
    headers: {
      'Content-Type' : 'application/json',
      'Authorization' : 'Bearer ' + getToken(),
    },
  };
  if (body) {
    options.body = JSON.stringify(body);
  }

  let response;
  try {
    response = await fetch(url, options);
  }
  catch {
    throw new Error('Could not reach the server. Is the backen (Main.java) running?')
  }

  const text = await response.text();
  const data = text ? JSON.parse(text) : {};

  // If the backend sent an error, show its message
  if (!response.ok) {
    throw new Error(data.error || 'Something went wrong');
  }
  return data;
}
    



