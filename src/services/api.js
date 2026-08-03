// Centralized API service layer for the Orchestra backend.
// All fetch calls go through local proxy /api to avoid CORS issues.

const BASE_URL = '/api';

/**
 * Fetch all users from the backend.
 * @returns {Promise<Array>} Array of user objects
 */
export async function fetchUsers() {
  try {
    const res = await fetch(`${BASE_URL}/users`);
    if (res.ok) {
      const data = await res.json();
      return Array.isArray(data) ? data : (data.users || []);
    }
  } catch (e) {
    // Ignore proxy error, fallback to direct
  }
  try {
    const directRes = await fetch('https://orchestra-backend-30fy.onrender.com/users');
    if (directRes.ok) {
      const data = await directRes.json();
      return Array.isArray(data) ? data : (data.users || []);
    }
  } catch (err) {
    console.warn('[API] Failed to fetch users:', err);
  }
  return [];
}

/**
 * Fetch all projects from the backend via GET /projects.
 * We fetch all projects because the frontend handles complex filtering
 * (checking members, and created_by) which the backend query param misses if fields are NULL.
 * @returns {Promise<Array>} Array of project objects
 */
export async function fetchProjects() {
  const url = `${BASE_URL}/projects`;
  const directUrl = `https://orchestra-backend-30fy.onrender.com/projects`;
  
  let projectsList = [];

  try {
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      projectsList = Array.isArray(data) ? data : (data.projects || []);
    }
  } catch (e) {
    // proxy failed
  }

  if (projectsList.length === 0) {
    try {
      const directRes = await fetch(directUrl);
      if (directRes.ok) {
        const data = await directRes.json();
        projectsList = Array.isArray(data) ? data : (data.projects || []);
      }
    } catch (err) {
      console.warn('[API] Direct fetch projects failed:', err);
    }
  }

  return projectsList;
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
  const queryParam = projectId ? `?project_id=${encodeURIComponent(projectId)}` : '';
  const url = `${BASE_URL}/tasks${queryParam}`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      const directUrl = `https://orchestra-backend-30fy.onrender.com/tasks${queryParam}`;
      const directRes = await fetch(directUrl);
      if (!directRes.ok) return [];
      const data = await directRes.json();
      return Array.isArray(data) ? data : (data.tasks || []);
    }
    const data = await res.json();
    return Array.isArray(data) ? data : (data.tasks || []);
  } catch (err) {
    console.warn('[API] Failed to fetch tasks from backend:', err);
    return [];
  }
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

/**
 * Validate an array of team member inputs against the user table.
 * @param {Array<string>} memberInputs - Array of entered member identifiers (e.g. user_id, username, email)
 * @returns {Promise<{ valid: boolean, validMembers: string[], invalidMembers: string[] }>}
 */
export async function validateTeamMembers(memberInputs = []) {
  const cleanInputs = memberInputs.map(m => m ? m.toString().trim() : '').filter(Boolean);
  if (cleanInputs.length === 0) {
    return { valid: true, validMembers: [], invalidMembers: [] };
  }

  let users = [];
  try {
    users = await fetchUsers();
  } catch (err) {
    console.warn('[API] Could not fetch user table for validation:', err);
  }

  const validMembers = [];
  const invalidMembers = [];

  for (const input of cleanInputs) {
    const lowerInput = input.toLowerCase();
    const matchedUser = users.find(u =>
      (u.user_id && u.user_id.toLowerCase() === lowerInput) ||
      (u.username && u.username.toLowerCase() === lowerInput) ||
      (u.email && u.email.toLowerCase() === lowerInput) ||
      (u.discord_id && u.discord_id.toString().toLowerCase() === lowerInput) ||
      (u.github_username && u.github_username.toLowerCase() === lowerInput) ||
      (u.id && u.id.toString().toLowerCase() === lowerInput)
    );

    if (matchedUser) {
      validMembers.push(matchedUser.user_id || matchedUser.username || input);
    } else {
      // If user list loaded and user not found, mark invalid
      if (users.length > 0) {
        invalidMembers.push(input);
      } else {
        // Fallback if user table couldn't be loaded: accept input
        validMembers.push(input);
      }
    }
  }

  return {
    valid: invalidMembers.length === 0,
    validMembers,
    invalidMembers,
  };
}

/**
 * Helper to execute fetch requests with a configurable timeout (default 65 seconds).
 */
async function fetchWithTimeout(resource, options = {}) {
  const { timeout, ...fetchOptions } = options;
  // Timeout logic has been completely removed to allow long-running AI requests
  return await fetch(resource, fetchOptions);
}

/**
 * Create a new blueprint via POST /blueprint endpoint.
 * @param {Object} payload - { name: string, description: string, tech_stack: string[], members: string[], created_by?: string }
 * @param {string} userId - Creator user_id query param
 * @returns {Promise<Object>} Response data
 */
export async function createBlueprint(payload, userId) {
  const effectiveUserId = userId || payload.created_by || null;
  const queryParam = effectiveUserId ? `?user_id=${encodeURIComponent(effectiveUserId)}` : '';
  const url = `${BASE_URL}/blueprint${queryParam}`;
  const directUrl = `https://orchestra-backend-30fy.onrender.com/blueprint${queryParam}`;

  const bodyPayload = {
    ...payload,
    created_by: effectiveUserId
  };

  console.log('[API] Calling createBlueprint endpoint (120s timeout):', url, bodyPayload);
  try {
    const res = await fetchWithTimeout(url, {
      method: 'POST',
      timeout: 120000,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': import.meta.env.VITE_ORCHESTRA_AI_API_KEY || ''
      },
      body: JSON.stringify(bodyPayload),
    });

    if (!res.ok) {
      // Fallback to direct backend URL if proxy fails
      const directRes = await fetchWithTimeout(directUrl, {
        method: 'POST',
        timeout: 120000,
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': import.meta.env.VITE_ORCHESTRA_AI_API_KEY || ''
        },
        body: JSON.stringify(bodyPayload),
      });
      if (!directRes.ok) {
        const errText = await directRes.text().catch(() => 'No details');
        throw new Error(`Blueprint API error (${directRes.status}): ${errText}`);
      }
      return await directRes.json();
    }
    return await res.json();
  } catch (err) {
    console.warn('[API] Proxy blueprint call failed, trying direct endpoint...', err);
    const directRes = await fetchWithTimeout(directUrl, {
      method: 'POST',
      timeout: 120000,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': import.meta.env.VITE_ORCHESTRA_AI_API_KEY || ''
      },
      body: JSON.stringify(bodyPayload),
    });
    if (!directRes.ok) {
      throw err;
    }
    return await directRes.json();
  }
}

/**
 * Send a chat message to Clover AI endpoint via POST /clover.
 * @param {string} question - Current user message
 * @param {Array<{ content: string, role: string }>} conversationHistory - Last 5 turns of conversation history
 * @param {string|null} projectId - The canonical project ID the user is currently viewing (for context)
 * @returns {Promise<Object|string>} Response data
 */
export async function sendCloverMessage(question, conversationHistory = [], projectId = null, onChunk = null) {
  const payload = {
    conversation_history: conversationHistory,
    question: question,
    project_id: projectId || "",
  };
  const url = `${BASE_URL}/clover`;
  console.log('[API] Calling sendCloverMessage endpoint:', payload);

  const fetchOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': import.meta.env.VITE_ORCHESTRA_AI_API_KEY || ''
    },
    body: JSON.stringify(payload),
  };

  const processStream = async (response) => {
    if (!response.body) throw new Error("ReadableStream not supported");
    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let fullText = "";
    let buffer = "";

    // Artificial queue for typewriter effect
    let typingQueue = "";
    let isTyping = false;
    let displayedText = "";

    const typeQueue = async () => {
      if (isTyping) return;
      isTyping = true;
      while (typingQueue.length > 0) {
        const char = typingQueue[0];
        typingQueue = typingQueue.slice(1);
        displayedText += char;
        if (onChunk) onChunk(char, displayedText);
        
        // 3-5 words per sec = ~25 characters per sec = ~40ms per character
        await new Promise(r => setTimeout(r, 40));
      }
      isTyping = false;
    };

    const processLine = (line) => {
      line = line.trim();
      if (line.startsWith('data:')) {
        const dataStr = line.replace(/^data:\s*/, '').trim();
        if (dataStr === '[DONE]') return;
        try {
          const parsed = JSON.parse(dataStr);
          if (parsed.chunk) {
            fullText += parsed.chunk;
            if (onChunk) {
              typingQueue += parsed.chunk;
              typeQueue();
            }
          }
        } catch (e) {
          // ignore incomplete or unparseable JSON lines
        }
      }
    };

    while (true) {
      const { value, done } = await reader.read();
      if (done) {
        if (buffer.trim()) processLine(buffer);
        break;
      }
      buffer += decoder.decode(value, { stream: true });
      
      let newlineIndex;
      while ((newlineIndex = buffer.indexOf('\n')) >= 0) {
        const line = buffer.slice(0, newlineIndex);
        buffer = buffer.slice(newlineIndex + 1);
        processLine(line);
      }
    }
    
    // Hold the promise resolution until the UI has finished typing everything!
    while (isTyping || typingQueue.length > 0) {
      await new Promise(r => setTimeout(r, 100));
    }
    
    return fullText;
  };

  try {
    const res = await fetch(url, fetchOptions);

    if (!res.ok) {
      const directRes = await fetch('https://orchestra-backend-30fy.onrender.com/clover', fetchOptions);
      if (!directRes.ok) {
        const errText = await directRes.text().catch(() => 'No details');
        throw new Error(`Clover API error (${directRes.status}): ${errText}`);
      }
      return onChunk ? await processStream(directRes) : await directRes.json();
    }
    
    return onChunk ? await processStream(res) : await res.json();
  } catch (err) {
    console.warn('[API] Proxy clover call failed, trying direct endpoint...', err);
    // Add timeout manually for the final fallback if no stream
    const finalOptions = onChunk ? fetchOptions : { ...fetchOptions, timeout: 65000 };
    const directRes = await (onChunk ? fetch('https://orchestra-backend-30fy.onrender.com/clover', finalOptions) : fetchWithTimeout('https://orchestra-backend-30fy.onrender.com/clover', finalOptions));
    
    if (!directRes.ok) {
      throw err;
    }
    return onChunk ? await processStream(directRes) : await directRes.json();
  }
}

/**
 * Create a new project in backend via POST /projects.
 * Calls the backend DIRECTLY (no proxy) to avoid duplicate creation from retry logic.
 * @param {Object} payload - { name, description, tech_stack, members, summary }
 * @param {string} userId - Creator user_id query param
 * @returns {Promise<Object>} Response data
 */
export async function createProjectBackend(payload, userId) {
  const queryParam = userId ? `?user_id=${encodeURIComponent(userId)}` : '';
  const directUrl = `https://orchestra-backend-30fy.onrender.com/projects${queryParam}`;
  console.log('[API] Calling createProjectBackend DIRECT endpoint:', directUrl, payload);

  const bodyData = {
    name: payload.name || 'Untitled Project',
    description: payload.description || '',
    tech_stack: payload.tech_stack || [],
    members: payload.members || [],
    tracked_repos: payload.tracked_repos || [],
    tracked_channels: payload.tracked_channels || [],
    created_by: userId || null,
    ...(payload.summary ? { summary: payload.summary } : {}),
  };

  const res = await fetch(directUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': import.meta.env.VITE_ORCHESTRA_AI_API_KEY || ''
    },
    body: JSON.stringify(bodyData),
  });

  const text = await res.text();
  console.log(`[API] createProjectBackend response (status ${res.status}):`, text);

  if (!res.ok) {
    throw new Error(`Create Project API error (${res.status}): ${text}`);
  }

  try { return JSON.parse(text); } catch { return text; }
}

/**
 * Update an existing project in backend via PATCH /projects/{project_id}.
 * @param {string} projectId - Path param project_id
 * @param {Object} payload - { name: string, description: string, tech_stack: string[], members: string[] }
 * @returns {Promise<Object>} Response data
 */
export async function updateProjectBackend(projectId, payload) {
  const url = `${BASE_URL}/projects/${encodeURIComponent(projectId)}`;
  console.log('[API] Calling updateProjectBackend endpoint:', url, payload);

  try {
    const res = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': import.meta.env.VITE_ORCHESTRA_AI_API_KEY || ''
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const directUrl = `https://orchestra-backend-30fy.onrender.com/projects/${encodeURIComponent(projectId)}`;
      const directRes = await fetch(directUrl, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': import.meta.env.VITE_ORCHESTRA_AI_API_KEY || ''
        },
        body: JSON.stringify(payload),
      });
      if (!directRes.ok) {
        const errText = await directRes.text().catch(() => 'No details');
        throw new Error(`Update Project API error (${directRes.status}): ${errText}`);
      }
      return await directRes.json();
    }
    return await res.json();
  } catch (err) {
    console.warn('[API] Proxy updateProject call failed, trying direct endpoint...', err);
    const directUrl = `https://orchestra-backend-30fy.onrender.com/projects/${encodeURIComponent(projectId)}`;
    const directRes = await fetch(directUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': import.meta.env.VITE_ORCHESTRA_AI_API_KEY || ''
      },
      body: JSON.stringify(payload),
    });
    if (!directRes.ok) throw err;
    return await directRes.json();
  }
}

/**
 * Delete a project in backend via DELETE /projects/{project_id}.
 * @param {string} projectId - Path param project_id
 * @returns {Promise<Object>} Response data
 */
export async function deleteProjectBackend(projectId) {
  const url = `${BASE_URL}/projects/${encodeURIComponent(projectId)}`;
  console.log(`[API] Attempting to delete project ${projectId} via proxy:`, url);

  const safelyParse = async (response) => {
    const text = await response.text();
    console.log(`[API] deleteProject response status: ${response.status}. Body:`, text);
    if (!text) return { success: true };
    try { return JSON.parse(text); } catch { return { message: text }; }
  };

  try {
    const res = await fetch(url, {
      method: 'DELETE',
      headers: {
        'x-api-key': import.meta.env.VITE_ORCHESTRA_AI_API_KEY || ''
      }
    });

    if (!res.ok) {
      console.warn(`[API] Proxy delete returned ${res.status}. Falling back to direct URL.`);
      const directUrl = `https://orchestra-backend-30fy.onrender.com/projects/${encodeURIComponent(projectId)}`;
      console.log(`[API] Calling direct URL:`, directUrl);
      
      const directRes = await fetch(directUrl, {
        method: 'DELETE',
        headers: {
          'x-api-key': import.meta.env.VITE_ORCHESTRA_AI_API_KEY || ''
        }
      });
      if (!directRes.ok) {
        const errText = await directRes.text().catch(() => 'No details');
        console.error(`[API] Direct delete failed with status ${directRes.status}:`, errText);
        throw new Error(`Delete Project API error (${directRes.status}): ${errText}`);
      }
      return await safelyParse(directRes);
    }
    return await safelyParse(res);
  } catch (err) {
    console.warn('[API] Fetch exception in deleteProject. Retrying directly...', err);
    const directUrl = `https://orchestra-backend-30fy.onrender.com/projects/${encodeURIComponent(projectId)}`;
    const directRes = await fetch(directUrl, {
      method: 'DELETE',
      headers: {
        'x-api-key': import.meta.env.VITE_ORCHESTRA_AI_API_KEY || ''
      }
    });
    if (!directRes.ok) {
      const errText = await directRes.text().catch(() => 'No details');
      console.error(`[API] Fallback direct delete failed with status ${directRes.status}:`, errText);
      throw err;
    }
    return await safelyParse(directRes);
  }
}

/**
 * Create a new task in the tasks table via POST /tasks.
 * Calls backend DIRECTLY (no proxy) to avoid duplicate creation from retry logic.
 * @param {Object} taskData - Task payload { id, title, description, project_id, track, assigned_to, status, dependencies }
 * @returns {Promise<Object>} Response data
 */
export async function createTaskBackend(taskData) {
  const directUrl = 'https://orchestra-backend-30fy.onrender.com/tasks';

  const taskId = taskData.id || taskData.task_id || `task_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

  const payload = {
    id: taskId,
    title: taskData.title || taskData.name || 'Untitled Task',
    description: taskData.description || '',
    project_id: taskData.project_id || taskData.projectId || '',
    track: taskData.track || 'general',
    assigned_to: taskData.assigned_to || taskData.assignedTo || '',
    status: taskData.status || 'todo',
    dependencies: Array.isArray(taskData.dependencies) 
      ? taskData.dependencies 
      : (Array.isArray(taskData.depends_on) ? taskData.depends_on : [])
  };

  console.log('[API] Calling createTaskBackend DIRECT endpoint:', directUrl, payload);

  const res = await fetch(directUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': import.meta.env.VITE_ORCHESTRA_AI_API_KEY || ''
    },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  console.log(`[API] createTaskBackend response (status ${res.status}):`, text);

  if (!res.ok) {
    throw new Error(`Create Task API error (${res.status}): ${text}`);
  }

  try { return JSON.parse(text); } catch { return text; }
}



