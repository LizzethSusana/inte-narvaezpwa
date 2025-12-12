// =====================
// SERVICE WORKER REGISTRATION
// =====================

/**
 * Registra el service worker SIEMPRE (desarrollo y producción)
 */
export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    console.warn('[SW] Service Worker no soportado en este navegador');
    return;
  }

  try {
    const isDevelopment = import.meta.env.DEV;
    const mode = isDevelopment ? 'DESARROLLO' : 'PRODUCCIÓN';

    console.log(`[SW] Modo ${mode} - registrando service worker`);

    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
      // Actualizar el SW en cada recarga en desarrollo
      updateViaCache: isDevelopment ? 'none' : 'imports'
    });

    console.log(`[SW] ✅ Service Worker registrado exitosamente en modo ${mode}`);
    console.log('[SW] Scope:', registration.scope);

    // Listener para actualizaciones
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      console.log('[SW] 🔄 Nueva versión del Service Worker encontrada');

      newWorker.addEventListener('statechange', () => {
        console.log(`[SW] Estado del nuevo worker: ${newWorker.state}`);

        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          console.log('[SW] ✨ Nueva versión disponible - recarga la página para actualizarla');

          // En desarrollo, solo mostrar log (no interrumpir con confirm)
          // En producción, preguntar al usuario
          if (!isDevelopment) {
            if (window.confirm('Nueva versión de la aplicación disponible. ¿Recargar ahora?')) {
              window.location.reload();
            }
          } else {
            console.log('[SW] 💡 En desarrollo: recarga la página manualmente para ver cambios');
          }
        }
      });
    });

    // Listener para cuando el SW toma control
    if (registration.active) {
      console.log('[SW] Service Worker activo:', registration.active.state);
    }

    // Verificar si hay un SW esperando
    if (registration.waiting) {
      console.log('[SW] Service Worker esperando para activarse');
    }

  } catch (error) {
    console.error('[SW] Error al registrar Service Worker:', error);
  }
}

/**
 * Verifica si hay un service worker activo
 * @returns {Promise<boolean>}
 */
export async function isServiceWorkerActive() {
  if (!('serviceWorker' in navigator)) {
    return false;
  }

  const registration = await navigator.serviceWorker.getRegistration();
  return !!(registration && registration.active);
}

/**
 * Verifica el estado del service worker y muestra información de debug
 */
export async function debugServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    console.log('[SW Debug] Service Worker NO soportado');
    return;
  }

  console.group('[SW Debug] Estado del Service Worker');

  const registration = await navigator.serviceWorker.getRegistration();

  if (!registration) {
    console.log('❌ No hay Service Worker registrado');
    console.groupEnd();
    return;
  }

  console.log('✅ Service Worker registrado');
  console.log('Scope:', registration.scope);

  if (registration.active) {
    console.log('Estado activo:', registration.active.state);
    console.log('Script URL:', registration.active.scriptURL);
  } else {
    console.log('⚠️ No hay Service Worker activo');
  }

  if (registration.waiting) {
    console.log('⏳ Service Worker esperando:', registration.waiting.state);
  }

  if (registration.installing) {
    console.log('🔄 Service Worker instalando:', registration.installing.state);
  }

  // Verificar SyncManager
  if ('sync' in registration) {
    console.log('✅ Background Sync disponible');
  } else {
    console.log('❌ Background Sync NO disponible');
  }

  console.groupEnd();
}
