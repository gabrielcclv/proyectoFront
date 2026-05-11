/**
 * authApi.js — Authentication service against dummyjson.com.
 *
 * DummyJSON returns:
 *   { id, username, email, firstName, lastName, image,
 *     accessToken, refreshToken }
 *
 * @ai-assisted Claude suggested the URLSearchParams-free fetch pattern;
 *              reviewed against dummyjson.com/docs#auth-login.
 */

const BASE = 'https://dummyjson.com'

/**
 * Logs in with username + password.
 * Returns the full auth payload including accessToken and refreshToken.
 */
export async function login(username, password) {
  const res = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, expiresInMins: 30 }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || `Login failed: ${res.status}`)
  }
  return res.json()
}

/**
 * Refreshes the access token using the refresh token.
 */
export async function refreshToken(token) {
  const res = await fetch(`${BASE}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: token, expiresInMins: 30 }),
  })
  if (!res.ok) throw new Error(`Refresh failed: ${res.status}`)
  return res.json()
}

/**
 * Fetches the current user profile with an access token.
 */
export async function getMe(accessToken) {
  const res = await fetch(`${BASE}/auth/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok) throw new Error(`getMe failed: ${res.status}`)
  return res.json()
}