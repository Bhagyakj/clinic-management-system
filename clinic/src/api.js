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

// Everything below needs a token (set by login/restoreSession).
// `authed(token)` returns a small set of helpers that all send it automatically.
export function authed(token) {
  const auth = (options = {}) => ({ ...options, headers: { Authorization: `Bearer ${token}`, ...(options.headers || {}) } });

  return {
    // Patients
    listPatients: () => request('/patients', auth()),
    getPatient: (id) => request(`/patients/${id}`, auth()),
    createPatient: (body) => request('/patients', auth({ method: 'POST', body: JSON.stringify(body) })),
    updatePatient: (id, body) => request(`/patients/${id}`, auth({ method: 'PUT', body: JSON.stringify(body) })),
    deletePatient: (id) => request(`/patients/${id}`, auth({ method: 'DELETE' })),

    // Doctors
    listDoctors: () => request('/doctors', auth()),
    createDoctor: (body) => request('/doctors', auth({ method: 'POST', body: JSON.stringify(body) })),

    // Appointments
    listAppointments: (query = '') => request(`/appointments${query}`, auth()),
    bookAppointment: (body) => request('/appointments', auth({ method: 'POST', body: JSON.stringify(body) })),
    updateAppointmentStatus: (id, status) => request(`/appointments/${id}/status`, auth({ method: 'PATCH', body: JSON.stringify({ status }) })),

    // Payments
    listPayments: (query = '') => request(`/payments${query}`, auth()),
    createBill: (body) => request('/payments', auth({ method: 'POST', body: JSON.stringify(body) })),
    collectPayment: (billId, body) => request(`/payments/${billId}/collect`, auth({ method: 'POST', body: JSON.stringify(body) })),

    // Rooms
    listRooms: (query = '') => request(`/rooms${query}`, auth()),
    createRoom: (body) => request('/rooms', auth({ method: 'POST', body: JSON.stringify(body) })),
    updateRoomStatus: (id, status) => request(`/rooms/${id}/status`, auth({ method: 'PATCH', body: JSON.stringify({ status }) })),

    // Admissions
    listAdmissions: () => request('/admissions', auth()),
    admitPatient: (body) => request('/admissions', auth({ method: 'POST', body: JSON.stringify(body) })),
    dischargePatient: (admissionId, body) => request(`/admissions/${admissionId}/discharge`, auth({ method: 'POST', body: JSON.stringify(body) })),
  };
}
