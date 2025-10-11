const API_PATH = "/api";

export const ACADEMIC_LEVELS_API = `${API_PATH}/academic-levels`;

export const ACADEMIC_QUALIFICATIONS_API = `${API_PATH}/academic-qualifications`;

export const COURSES_API = `${API_PATH}/courses`;

export const INSTRUCTORS_API = `${API_PATH}/instructors`;

export const ROOMS_API = `${API_PATH}/rooms`;

export const SECTIONS_API = `${API_PATH}/sections`;

export const SUBJECTS_API = `${API_PATH}/subjects`;

export const SCHEDULED_SUBJECTS_API = `${API_PATH}/scheduled-subjects`;

export const SETTINGS_API = `${API_PATH}/settings`;

export const UNASSIGNED_SCHEDULED_SUBJECTS_API = `${SCHEDULED_SUBJECTS_API}/unassigned`;

export const SCHEDULED_INSTRUCTORS_API = `${API_PATH}/scheduled-instructors`;

// COUNTS
const COUNT_PATH = "/count";
export const SECTIONS_COUNT_API = SECTIONS_API + COUNT_PATH;
export const INSTRUCTORS_COUNT_API = INSTRUCTORS_API + COUNT_PATH;
export const SUBJECTS_COUNT_API = SUBJECTS_API + COUNT_PATH;
export const ROOMS_COUNT_API = ROOMS_API + COUNT_PATH;
