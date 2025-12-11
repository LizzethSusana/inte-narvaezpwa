// =====================
// UTILIDADES GENERALES
// =====================

/**
 * Convierte un archivo a base64
 * @param {File} file
 * @returns {Promise<string>}
 */
export function toBase64(file) {
  return new Promise((res, rej) => {
    const fr = new FileReader();
    fr.onload = () => res(fr.result);
    fr.onerror = rej;
    fr.readAsDataURL(file);
  });
}

/**
 * Rellena un número con ceros a la izquierda
 * @param {number|string} n
 * @param {number} width
 * @returns {string}
 */
export function padRoomNumber(n, width = 2) {
  const num = Number(n);
  if (Number.isNaN(num)) return String(n || '').padStart(width, '0');
  return String(num).padStart(width, '0');
}

/**
 * Normaliza el estado de una habitación o camarera a una clave CSS
 * @param {string} status
 * @returns {string}
 */
export function getStatusKey(status) {
  if (!status) return 'clean';
  const s = String(status).toLowerCase();
  if (s.includes('bloq') || s.includes('bloque') || s === 'blocked') return 'blocked';
  if (s.includes('suc') || s.includes('sucio') || s === 'dirty') return 'dirty';
  if (s.includes('limp') || s.includes('limpia') || s === 'clean') return 'clean';
  if (s.includes('no') && s.includes('dispon')) return 'no-disponible';
  if (s.includes('disp')) return 'disponible';
  return s.replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '');
}

/**
 * Obtiene el label para un estado de camarera
 * @param {string} status
 * @param {string} name
 * @returns {string}
 */
export function getMaidStatusLabel(status, name) {
  const isUnavailable = (status || '').toLowerCase().includes('no');
  return `${name || ''} ${isUnavailable ? '(No disponible)' : ''}`;
}

/**
 * Verifica si una camarera está disponible
 * @param {string} status
 * @returns {boolean}
 */
export function isMaidAvailable(status) {
  return !(status || '').toLowerCase().includes('no');
}

/**
 * Obtiene el número de piso de un ID de habitación
 * @param {string|number} id - Ej: "1-01" o "101"
 * @returns {string}
 */
export function getFloorFromId(id) {
  if (!id) return '1';
  const str = String(id);
  if (str.includes('-')) return str.split('-')[0];
  const m = str.match(/^(\d+)/);
  return m ? m[1] : '1';
}

/**
 * Obtiene el número de habitación sin el piso
 * @param {string|number} id - Ej: "1-01" retorna "01"
 * @returns {string}
 */
export function getRoomNumberPart(id) {
  if (!id) return '';
  const str = String(id);
  if (str.includes('-')) return str.split('-')[1] || str;
  return str;
}

/**
 * Formatea una fecha ISO a formato legible
 * @param {string} isoDate
 * @returns {string}
 */
export function formatDate(isoDate) {
  if (!isoDate) return '';
  try {
    const date = new Date(isoDate);
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) {
    return isoDate;
  }
}
