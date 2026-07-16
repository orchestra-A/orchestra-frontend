// Centralized API service layer for the Orchestra backend.
// All fetch calls go through local proxy /api to avoid CORS issues.

const BASE_URL = '/api';

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

/**
 * Update a task's status via PATCH.
 * @param {string} taskId - The task ID to update
 * @param {string} status - The new status
 * @returns {Promise<Object>} Response data
 */
export async function updateTaskStatus(taskId, status) {
  const payload = { status };
  console.log(`[API] Updating task ${taskId} status to:`, payload);
  const res = await fetch(`${BASE_URL}/tasks/${encodeURIComponent(taskId)}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorText = await res.text().catch(() => 'No details');
    console.error(`[API] Status update failed (Status: ${res.status}). Server error details:`, errorText);
    throw new Error(`Failed to update task status: ${res.status}. Details: ${errorText}`);
  }
  const data = await res.json();
  console.log(`[API] Status update response:`, data);
  return data;
}
