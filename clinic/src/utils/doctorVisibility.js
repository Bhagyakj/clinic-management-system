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

    if (seniorUserId) {
      const seniorDoctor = doctors.find((doctor) => normalizeDoctorUserId(doctor?.userId) === seniorUserId);
      if (seniorDoctor?._id) return [seniorDoctor._id];
    }

    const currentJuniorMatch = doctors.find((doctor) => {
      const doctorUserId = normalizeDoctorUserId(doctor?.userId);
      const doctorName = String(doctor?.name || '').trim();
      const safeUserName = String(userName || '').trim();
      return doctorUserId === userId || doctorName === safeUserName || doctorName === safeUserName.replace(/\s*\(JD\)\s*$/i, '') || doctorName === safeUserName.replace(/\s*\(SD\)\s*$/i, '');
    });

    if (currentJuniorMatch?._id) return [currentJuniorMatch._id];
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
