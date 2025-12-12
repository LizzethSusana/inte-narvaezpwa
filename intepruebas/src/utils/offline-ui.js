/**
 * Utilidades para mostrar el estado offline en la UI
 */

/**
 * Muestra un banner de "sin conexión" en la parte superior de la página
 * @param {HTMLElement} container - Contenedor donde insertar el banner
 */
export function showOfflineBanner(container) {
  // Evitar duplicados
  const existing = document.getElementById('offline-banner');
  if (existing) return;

  const banner = document.createElement('div');
  banner.id = 'offline-banner';
  banner.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background-color: #ff9800;
    color: white;
    padding: 12px 20px;
    text-align: center;
    font-weight: 500;
    z-index: 9999;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    font-size: 14px;
  `;
  banner.innerHTML = `
    <i class="bi bi-wifi-off" style="margin-right: 8px;"></i>
    Sin conexión - Mostrando datos guardados localmente
  `;

  if (container) {
    container.insertBefore(banner, container.firstChild);
  } else {
    document.body.insertBefore(banner, document.body.firstChild);
  }
}

/**
 * Oculta el banner de "sin conexión"
 */
export function hideOfflineBanner() {
  const banner = document.getElementById('offline-banner');
  if (banner) {
    banner.remove();
  }
}

/**
 * Muestra un mensaje de "sin conexión" en un elemento específico
 * @param {HTMLElement} element - Elemento donde mostrar el mensaje
 * @param {string} message - Mensaje personalizado (opcional)
 */
export function showOfflineMessage(element, message = 'Sin conexión') {
  if (!element) return;

  element.innerHTML = `
    <div style="
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
      color: #757575;
      text-align: center;
      min-height: 200px;
    ">
      <i class="bi bi-wifi-off" style="font-size: 48px; margin-bottom: 16px; color: #ff9800;"></i>
      <p style="font-size: 18px; font-weight: 500; margin: 0 0 8px 0;">${message}</p>
      <p style="font-size: 14px; margin: 0; color: #9e9e9e;">
        Los datos se mostrarán cuando se restablezca la conexión
      </p>
    </div>
  `;
}

/**
 * Agrega un listener para cambios en el estado de conexión
 * @param {Function} onOnline - Callback cuando se recupera la conexión
 * @param {Function} onOffline - Callback cuando se pierde la conexión
 */
export function setupConnectionListeners(onOnline, onOffline) {
  window.addEventListener('online', () => {
    console.log('[Connection] Online');
    hideOfflineBanner();
    if (onOnline) onOnline();
  });

  window.addEventListener('offline', () => {
    console.log('[Connection] Offline');
    showOfflineBanner();
    if (onOffline) onOffline();
  });

  // Mostrar banner si ya está offline
  if (!navigator.onLine) {
    showOfflineBanner();
  }
}

/**
 * Verifica si hay datos en caché para mostrar
 * @param {Array} data - Datos del caché
 * @param {HTMLElement} element - Elemento donde mostrar el mensaje
 * @param {string} emptyMessage - Mensaje cuando no hay datos
 * @returns {boolean} - true si hay datos, false si no
 */
export function checkCachedData(data, element, emptyMessage = 'No hay datos disponibles offline') {
  if (!data || data.length === 0) {
    showOfflineMessage(element, emptyMessage);
    return false;
  }
  return true;
}
