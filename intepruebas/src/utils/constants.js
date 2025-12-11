// =====================
// CONSTANTES GLOBALES
// =====================

export const ITEMS_PER_PAGE = 8; // habitaciones por página
export const MAIDS_PER_PAGE = 6; // camareras por página
export const REPORTS_PER_PAGE = 6; // reportes por página

/**
 * Estados de habitaciones
 */
export const ROOM_STATUS = {
  CLEAN: 'Limpia',
  DIRTY: 'Sucia',
  BLOCKED: 'Bloqueada',
  AVAILABLE: 'Disponible',
  OCCUPIED: 'Ocupada',
  MAINTENANCE: 'Mantenimiento',
  CLEANING: 'Limpieza'
};

/**
 * Estados de camarera
 */
export const MAID_STATUS = {
  AVAILABLE: 'Disponible',
  NOT_AVAILABLE: 'No disponible',
  BUSY: 'Ocupado'
};

/**
 * Claves CSS para estados
 */
export const STATUS_KEYS = {
  clean: 'clean',
  dirty: 'dirty',
  blocked: 'blocked',
  available: 'disponible',
  unavailable: 'no-disponible'
};

/**
 * Filtros de habitaciones para camarera
 */
export const ROOM_FILTERS = {
  ALL: 'all',
  ASSIGNED: 'assigned',
  DIRTY: 'dirty',
  CLEAN: 'clean',
  BLOCKED: 'blocked'
};

/**
 * Configuración de cámara
 */
export const CAMERA_CONFIG = {
  MAX_PHOTOS: 3,
  FACING_MODE: 'environment', // cámara trasera
  IMAGE_FORMAT: 'image/jpeg',
  IMAGE_QUALITY: 0.9
};

