const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

async function request(path, options) {
  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) },
      ...options,
    });
  } catch {
    throw new Error(`Can't reach the server at ${API_BASE}. Is it running?`);
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `Request failed (${res.status})`);
  return data;
}

export function apiLogin(employeeId, password) {
  // { token, role, name, employeeId }
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ EmployeeId: employeeId, password }),
  });
}

export function apiRegister({ employeeId, name, designation, password }) {
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ EmployeeId: employeeId, name, designation, password }),
  });
}

export function apiGetMe(token) {
  return request('/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function apiGetPatients() {
  return request('/patients');
}

export function apiCreatePatient(patient) {
  return request('/patients', {
    method: 'POST',
    body: JSON.stringify(patient),
  });
}

export function apiUpdatePatient(id, patient) {
  return request(`/patients/${id}`, {
    method: 'PUT',
    body: JSON.stringify(patient),
  });
}

export function apiDeletePatient(id) {
  return request(`/patients/${id}`, {
    method: 'DELETE',
  });
}
