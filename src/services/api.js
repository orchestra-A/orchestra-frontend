// Centralized API service layer for the Orchestra backend.
// All fetch calls to https://orchestra-backend-30fy.onrender.com/ go through here.

const BASE_URL = 'https://orchestra-backend-30fy.onrender.com';

/**
 * Fetch all users from the backend.
 * @returns {Promise<Array>} Array of user objects
 */
export async function fetchUsers() {
  const res = await fetch(`${BASE_URL}/users`);
  if (!res.ok) throw new Error(`Failed to fetch users: ${res.status}`);
  const data = await res.json();
  return data.users || [];
}

/**
 * Find a single user by their user_id from the /users list.
 * @param {string} userId - The user_id to search for
 * @returns {Promise<Object|null>} The matched user object, or null
 */
export async function fetchUserById(userId) {
  if (!userId) return null;
  const users = await fetchUsers();
  const lowerId = userId.toString().toLowerCase();
  return users.find((u) => 
    (u.user_id && u.user_id.toLowerCase() === lowerId) ||
    (u.email && u.email.toLowerCase() === lowerId) ||
    (u.discord_id && u.discord_id.toString().toLowerCase() === lowerId) ||
    (u.github_username && u.github_username.toLowerCase() === lowerId)
  ) || null;
}

/**
 * Fetch all tasks, optionally filtered by project_id.
 * @param {string|null} projectId - Optional project_id query param
 * @returns {Promise<Array>} Array of task objects
 */
export async function fetchTasks(projectId = null) {
  const url = projectId
    ? `${BASE_URL}/tasks?project_id=${encodeURIComponent(projectId)}`
    : `${BASE_URL}/tasks`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch tasks: ${res.status}`);
  const data = await res.json();
  return data.tasks || [];
}

/**
 * Update a user's profile via PATCH.
 * @param {string} userId - The user_id to update
 * @param {Object} payload - Key/value pairs to update (e.g. { skills: [...] })
 * @returns {Promise<Object>} The updated user from the backend
 */
export async function updateUser(userId, payload) {
  const res = await fetch(`${BASE_URL}/users/${encodeURIComponent(userId)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to update user: ${res.status}`);
  return res.json();
}
