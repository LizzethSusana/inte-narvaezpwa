// =====================
// CONSTANTES GLOBALES
// =====================

export const ITEMS_PER_PAGE = 8 // habitaciones
export const MAIDS_PER_PAGE = 6 // camareras por página
export const REPORTS_PER_PAGE = 6 // reportes por página

export const ROOM_STATUS = {
  CLEAN: 'Limpia',
  DIRTY: 'Sucio',
  BLOCKED: 'Bloqueada'
}

export const MAID_STATUS = {
  AVAILABLE: 'Disponible',
  NOT_AVAILABLE: 'No disponible',
  BUSY: 'Ocupado'
}

export const STATUS_KEYS = {
  clean: 'clean',
  dirty: 'dirty',
  blocked: 'blocked',
  available: 'disponible',
  unavailable: 'no-disponible'
}

// =====================
// MAPEOS DE ESTADOS PARA API
// =====================

/**
 * Mapeo de estados de habitación entre frontend (minúsculas) y API (MAYÚSCULAS)
 */
export const ROOM_STATUS_MAP = {
  // Frontend -> API
  toAPI: {
    'limpia': 'LIMPIA',
    'disponible': 'LIMPIA',
    'sucia': 'SUCIA',
    'limpieza': 'SUCIA',
    'ocupada': 'OCUPADA',
    'bloqueada': 'DESHABILITADA',
    'deshabilitada': 'DESHABILITADA',
    'mantenimiento': 'DESHABILITADA',
    'en_limpieza': 'EN_LIMPIEZA'
  },
  // API -> Frontend
  fromAPI: {
    'LIMPIA': 'limpia',
    'DISPONIBLE': 'limpia',
    'SUCIA': 'sucia',
    'OCUPADA': 'ocupada',
    'DESHABILITADA': 'bloqueada',
    'EN_LIMPIEZA': 'en_limpieza'
  }
}

/**
 * Mapeo de estados de reportes entre frontend y API
 */
export const REPORT_STATUS_MAP = {
  toAPI: {
    'pendiente': true,  // active: true
    'resuelto': false   // active: false
  },
  fromAPI: {
    true: 'pendiente',
    false: 'resuelto'
  }
}

// =====================
// HELPER FUNCTIONS
// =====================

/**
 * Convierte estado de habitación del frontend al formato de la API
 * @param {string} frontendStatus - Estado en minúsculas (ej: 'limpia', 'sucia')
 * @returns {string} Estado en MAYÚSCULAS para la API (ej: 'LIMPIA', 'SUCIA')
 */
export function roomStatusToAPI(frontendStatus) {
  if (!frontendStatus) return 'LIMPIA'
  const normalized = frontendStatus.toLowerCase().trim()
  return ROOM_STATUS_MAP.toAPI[normalized] || 'LIMPIA'
}

/**
 * Convierte estado de habitación de la API al formato del frontend
 * @param {string} apiStatus - Estado en MAYÚSCULAS (ej: 'LIMPIA', 'SUCIA')
 * @returns {string} Estado en minúsculas (ej: 'limpia', 'sucia')
 */
export function roomStatusFromAPI(apiStatus) {
  if (!apiStatus) return 'limpia'
  const normalized = apiStatus.toUpperCase().trim()
  return ROOM_STATUS_MAP.fromAPI[normalized] || 'limpia'
}

/**
 * Convierte estado de reporte del frontend al formato de la API
 * @param {string} frontendStatus - Estado del reporte ('pendiente' o 'resuelto')
 * @returns {boolean} Valor de campo 'active' para la API
 */
export function reportStatusToAPI(frontendStatus) {
  const normalized = frontendStatus.toLowerCase().trim()
  return REPORT_STATUS_MAP.toAPI[normalized] !== undefined
    ? REPORT_STATUS_MAP.toAPI[normalized]
    : true
}

/**
 * Convierte estado de reporte de la API al formato del frontend
 * @param {boolean} active - Valor del campo 'active' de la API
 * @returns {string} Estado del reporte ('pendiente' o 'resuelto')
 */
export function reportStatusFromAPI(active) {
  return REPORT_STATUS_MAP.fromAPI[active] || 'pendiente'
}
