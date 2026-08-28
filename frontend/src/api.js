// The only file in the frontend that talks HTTP. Pages import these functions
// and never build URLs or call fetch themselves, so the whole request surface
// is visible in one place.

// Paths are relative, so the browser calls the Vite dev server, which proxies
// /api to the backend. No base URL and no CORS handling needed.

/**
 * Send a request and return the parsed JSON body.
 *
 * On a non-OK response, throws an Error carrying the server's `detail` message
 * so pages can show it to the user directly.
 */
async function request(path, options = {}) {
  const response = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })

  if (!response.ok) {
    throw new Error(await readErrorMessage(response))
  }

  // 204 No Content has no body to parse.
  if (response.status === 204) return null
  return response.json()
}

/** Pull the clearest message available out of an error response. */
async function readErrorMessage(response) {
  let body
  try {
    body = await response.json()
  } catch {
    return `Request failed (${response.status})`
  }

  const detail = body?.detail

  // A plain string detail is what our own HTTPException raises.
  if (typeof detail === 'string') return detail

  // FastAPI validation errors (422) arrive as a list of problems.
  if (Array.isArray(detail)) {
    return detail.map((item) => item.msg ?? 'Invalid value').join('; ')
  }

  return `Request failed (${response.status})`
}

// --- Categories ---

export function listCategories() {
  return request('/api/categories')
}

export function createCategory(name) {
  return request('/api/categories', {
    method: 'POST',
    body: JSON.stringify({ name }),
  })
}

export function renameCategory(id, name) {
  return request(`/api/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ name }),
  })
}

export function deleteCategory(id) {
  return request(`/api/categories/${id}`, { method: 'DELETE' })
}

// --- Expenses ---

export function listExpenses() {
  return request('/api/expenses')
}

export function createExpense(expense) {
  return request('/api/expenses', {
    method: 'POST',
    body: JSON.stringify(expense),
  })
}

export function updateExpense(id, expense) {
  return request(`/api/expenses/${id}`, {
    method: 'PUT',
    body: JSON.stringify(expense),
  })
}

export function deleteExpense(id) {
  return request(`/api/expenses/${id}`, { method: 'DELETE' })
}

// --- Dashboard ---

export function getDashboard() {
  return request('/api/dashboard')
}
