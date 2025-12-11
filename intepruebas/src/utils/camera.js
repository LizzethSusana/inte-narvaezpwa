// =====================
// UTILIDADES DE CÁMARA
// =====================

import { CAMERA_CONFIG } from './constants.js';

/**
 * Detecta si el dispositivo cuenta con cámara trasera.
 * Estrategia:
 * 1) Usar enumerateDevices() y buscar 'videoinput' con label que indique 'back/rear/environment/trasera'.
 * 2) Si no hay labels (sin permiso), intentar solicitar getUserMedia con facingMode: { exact: 'environment' }.
 *    Si esto tiene éxito, se considera que hay cámara trasera (cerrando el stream inmediatamente).
 * @returns {Promise<boolean>}
 */
export async function hasRearCamera() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
    return false;
  }

  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoInputs = devices.filter(d => d.kind === 'videoinput');

    if (!videoInputs.length) return false;

    const anyLabeled = videoInputs.some(d => d.label && d.label.trim().length > 0);

    if (anyLabeled) {
      const re = /back|rear|environment|trasera|trasero|posterior/i;
      return videoInputs.some(d => re.test(d.label));
    }

    // Sin labels (probablemente permisos no otorgados) -> intentar exact facingMode
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { exact: 'environment' } }
      });
      s.getTracks().forEach(t => t.stop());
      return true;
    } catch (e) {
      return false;
    }
  } catch (e) {
    console.error('Error al detectar cámara trasera:', e);
    return false;
  }
}

/**
 * Solicita permiso de cámara al sistema y cierra inmediatamente el stream
 * @returns {Promise<boolean>} - true si se concedió el permiso
 */
export async function requestCameraPermission() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    console.warn('getUserMedia no está disponible en este navegador');
    return false;
  }

  try {
    const tempStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: "environment" } },
      audio: false,
    });
    tempStream.getTracks().forEach(t => t.stop());
    console.log('Permiso de cámara concedido');
    return true;
  } catch (e) {
    console.warn('Permiso de cámara denegado o no disponible:', e.name, e.message);
    // NotAllowedError = usuario denegó el permiso
    // NotFoundError = no hay cámara disponible
    if (e.name === 'NotAllowedError') {
      console.error('El usuario denegó el permiso de cámara');
    } else if (e.name === 'NotFoundError') {
      console.error('No se encontró ninguna cámara en el dispositivo');
    }
    return false;
  }
}

/**
 * Inicia el stream de la cámara trasera
 * @param {HTMLVideoElement} videoElement - Elemento de video donde mostrar el stream
 * @returns {Promise<MediaStream|null>}
 */
export async function startRearCameraStream(videoElement) {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error("Tu navegador no soporta acceso a cámara.");
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: CAMERA_CONFIG.FACING_MODE } },
      audio: false,
    });

    videoElement.srcObject = stream;
    return stream;
  } catch (e) {
    console.error('Error al iniciar cámara:', e);
    throw new Error("No se pudo acceder a la cámara trasera. Verifica permisos.");
  }
}

/**
 * Detiene el stream de la cámara
 * @param {MediaStream} stream
 */
export function stopCameraStream(stream) {
  if (stream) {
    stream.getTracks().forEach(t => t.stop());
  }
}

/**
 * Captura una foto del stream de video
 * @param {HTMLVideoElement} videoElement
 * @param {HTMLCanvasElement} canvasElement
 * @returns {string} - Imagen en formato base64
 */
export function capturePhoto(videoElement, canvasElement) {
  const vw = videoElement.videoWidth;
  const vh = videoElement.videoHeight;

  if (!vw || !vh) {
    throw new Error("Cámara no lista. Intenta de nuevo.");
  }

  canvasElement.width = vw;
  canvasElement.height = vh;

  const ctx = canvasElement.getContext("2d");
  ctx.drawImage(videoElement, 0, 0, vw, vh);

  return canvasElement.toDataURL(CAMERA_CONFIG.IMAGE_FORMAT, CAMERA_CONFIG.IMAGE_QUALITY);
}

/**
 * Escanea un código QR desde el stream de video
 * @param {HTMLVideoElement} videoElement
 * @param {HTMLCanvasElement} canvasElement
 * @returns {string|null} - Datos del QR o null si no se detectó
 */
export function scanQRCode(videoElement, canvasElement) {
  if (!window.jsQR) {
    console.warn('jsQR library not loaded');
    return null;
  }

  if (videoElement.readyState !== videoElement.HAVE_ENOUGH_DATA) {
    return null;
  }

  canvasElement.width = videoElement.videoWidth;
  canvasElement.height = videoElement.videoHeight;

  const ctx = canvasElement.getContext('2d');
  ctx.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);

  const imageData = ctx.getImageData(0, 0, canvasElement.width, canvasElement.height);
  const code = window.jsQR(imageData.data, imageData.width, imageData.height, {
    inversionAttempts: 'dontInvert',
  });

  return code ? code.data : null;
}
