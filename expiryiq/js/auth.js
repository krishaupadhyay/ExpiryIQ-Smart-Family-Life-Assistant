
const USERS_KEY = 'expiryiq_users';       // { email: { name, password } }
const SESSION_KEY = 'expiryiq_session';   // { name, email }

function getUsers() {
  return JSON.parse(localStorage.getItem(USERS_KEY) || '{}');
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function getSession() {
  const s = localStorage.getItem(SESSION_KEY);
  return s ? JSON.parse(s) : null;
}

function setSession(name, email) {
  localStorage.setItem(SESSION_KEY, JSON.stringify({ name, email }));
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

/** Registers a new user and logs them in. Returns {ok, error} */
function registerUser(name, email, password, confirm) {
  if (password !== confirm) {
    return { ok: false, error: 'Passwords do not match.' };
  }
  const users = getUsers();
  users[email] = { name, password };
  saveUsers(users);
  setSession(name, email);
  return { ok: true };
}

/** Logs in an existing user. Auto-creates an account if none exists (demo convenience). */
function loginUser(email, password) {
  const users = getUsers();
  const record = users[email];
  if (!record) {
    // Demo mode: auto-create so the flow is always testable end-to-end
    const name = email.split('@')[0];
    users[email] = { name, password };
    saveUsers(users);
    setSession(name, email);
    return { ok: true };
  }
  if (record.password !== password) {
    return { ok: false, error: 'Incorrect email or password. Try again.' };
  }
  setSession(record.name, email);
  return { ok: true };
}

function logoutUser() {
  clearSession();
  window.location.href = 'index.html';
}

/** Call on protected pages (e.g. dashboard) — redirects to login if no session. */
function requireAuth() {
  const session = getSession();
  if (!session) {
    window.location.href = 'login.html';
  }
  return session;
}
