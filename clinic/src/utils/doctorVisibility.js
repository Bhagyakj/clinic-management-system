export function normalizeDoctorUserId(value) {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') return value._id || value.userId || '';
  return '';
}

export function getVisibleDoctorIdsForUser({ role, userId, userName, reportingDoctorId, doctors = [] }) {
  const allDoctorIds = doctors.map((doctor) => doctor?._id).filter(Boolean);

  if (!role) return allDoctorIds;

  if (role === 'jdoc') {
    const seniorUserId = normalizeDoctorUserId(reportingDoctorId);
    const currentJuniorMatch = doctors.find((doctor) => {
      const doctorUserId = normalizeDoctorUserId(doctor?.userId);
      const doctorName = String(doctor?.name || '').trim();
      const safeUserName = String(userName || '').trim();
      return doctorUserId === userId || doctorName === safeUserName || doctorName === safeUserName.replace(/\s*\(JD\)\s*$/i, '') || doctorName === safeUserName.replace(/\s*\(SD\)\s*$/i, '');
    });

    const allowedDoctorIds = new Set();

    if (currentJuniorMatch?._id) allowedDoctorIds.add(currentJuniorMatch._id);

    if (seniorUserId) {
      const seniorDoctor = doctors.find((doctor) => normalizeDoctorUserId(doctor?.userId) === seniorUserId);
      if (seniorDoctor?._id) allowedDoctorIds.add(seniorDoctor._id);
    }

    if (allowedDoctorIds.size > 0) return [...allowedDoctorIds];
    return allDoctorIds;
  }

  if (role === 'sdoc') {
    const currentDoctor = doctors.find((doctor) => {
      const doctorUserId = normalizeDoctorUserId(doctor?.userId);
      const doctorName = String(doctor?.name || '').trim();
      const safeUserName = String(userName || '').trim();
      return doctorUserId === userId || doctorName === safeUserName || doctorName === safeUserName.replace(/\s*\(SD\)\s*$/i, '') || doctorName === safeUserName.replace(/\s*\(JD\)\s*$/i, '');
    });

    if (currentDoctor?._id) return [currentDoctor._id];
    return allDoctorIds;
  }

  return allDoctorIds;
}

export function getSeniorDoctors(doctors = []) {
  const seniorDoctors = doctors.filter((doctor) => {
    const designation = doctor?.userId?.designation || '';
    const name = String(doctor?.name || '').toLowerCase();
    return designation === 'Senior Doctor' || name.includes('senior') || name.includes('(sd)');
  });

  return seniorDoctors.length > 0 ? seniorDoctors : doctors;
}

export function normalizeAppointmentDateKey(value) {
  if (!value) return '';

  const asDate = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(asDate.getTime())) {
    return String(value).slice(0, 10);
  }

  const local = new Date(asDate.getTime() - (asDate.getTimezoneOffset() * 60 * 1000));
  return local.toISOString().slice(0, 10);
}

export function normalizeAppointmentTimeKey(value) {
  if (!value && value !== 0) return '';

  const raw = String(value).trim().toLowerCase().replace(/\s+/g, '');
  if (!raw) return '';

  const match = raw.match(/^(\d{1,2})(?::(\d{2}))?(am|pm)?$/);
  if (!match) {
    return raw.replace(/[:.]/g, ':');
  }

  let hour = Number(match[1]);
  const minute = Number(match[2] || 0);
  const meridiem = match[3];

  if (meridiem === 'am' && hour === 12) hour = 0;
  if (meridiem === 'pm' && hour < 12) hour += 12;

  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

export function appointmentMatchesFilters(appointment, { selectedDoctorId = 'all', selectedStatus = 'all', selectedDate = '' } = {}) {
  const doctorId = typeof appointment?.doctorId === 'string'
    ? appointment.doctorId
    : appointment?.doctorId?._id || '';

  const matchesDoctor = selectedDoctorId === 'all' || doctorId === selectedDoctorId;
  const matchesStatus = selectedStatus === 'all'
    || String(appointment?.status || '').toLowerCase() === String(selectedStatus).toLowerCase();
  const matchesDate = !selectedDate || normalizeAppointmentDateKey(appointment?.date) === String(selectedDate);

  return matchesDoctor && matchesStatus && matchesDate;
}

export function filterAppointmentsForUser({ role, userId, userName, reportingDoctorId, doctors = [], appointments = [] }) {
  const allowedDoctorIds = new Set(getVisibleDoctorIdsForUser({ role, userId, userName, reportingDoctorId, doctors }));

  if (allowedDoctorIds.size === 0) {
    return appointments;
  }

  return appointments.filter((appointment) => {
    const doctorId = typeof appointment?.doctorId === 'string'
      ? appointment.doctorId
      : appointment?.doctorId?._id;

    return doctorId && allowedDoctorIds.has(doctorId);
  });
}
