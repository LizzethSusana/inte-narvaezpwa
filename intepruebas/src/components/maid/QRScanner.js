// =====================================================
// COMPONENTE: ESCÁNER DE CÓDIGO QR
// =====================================================

import { startRearCameraStream, stopCameraStream, scanQRCode } from '$/utils/camera.js';

/**
 * Abre el modal de escaneo de QR
 * @param {Function} onSuccess - Callback cuando se detecta un QR (recibe el código como parámetro)
 * @param {Function} onCancel - Callback cuando se cancela el escaneo
 */
export function openQRScanner(onSuccess, onCancel) {
  const modal = document.createElement('div');
  modal.className = 'modal show';
  modal.innerHTML = `
    <div class="modal-content" style="max-width: 500px;">
      <h4>Escanear QR/Código de barras</h4>
      <p style="font-size: 0.9rem; color: #666;">Apunta la cámara al código QR o barras de la habitación</p>
      <video id="qrVideo" autoplay playsinline style="width: 100%; border-radius: 8px; background: #000; margin: 16px 0;"></video>
      <div id="qrResult" style="min-height: 40px; padding: 12px; background: #f0f0f0; border-radius: 8px; margin: 12px 0; text-align: center; font-weight: 600;"></div>
      <div class="row">
        <button id="cancelQr" class="btn btn-secondary">Cerrar</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const video = modal.querySelector('#qrVideo');
  const resultDiv = modal.querySelector('#qrResult');
  const cancelBtn = modal.querySelector('#cancelQr');

  let stream = null;
  let scanning = true;
  let lastResult = null;

  const cleanup = () => {
    scanning = false;
    if (stream) {
      stopCameraStream(stream);
      stream = null;
    }
    modal.remove();
  };

  cancelBtn.addEventListener('click', () => {
    cleanup();
    if (onCancel) onCancel();
  });

  // Iniciar cámara y comenzar escaneo
  (async () => {
    try {
      stream = await startRearCameraStream(video);
      video.play();

      const canvas = document.createElement('canvas');

      const scanFrame = () => {
        if (!scanning) return;

        const qrData = scanQRCode(video, canvas);

        if (qrData && qrData !== lastResult) {
          lastResult = qrData;
          resultDiv.textContent = `✓ Detectado: ${qrData}`;
          resultDiv.style.background = '#d4edda';
          resultDiv.style.color = '#155724';

          // Auto-apply después de breve delay
          setTimeout(() => {
            cleanup();
            if (onSuccess) onSuccess(qrData);
          }, 600);
          return;
        }

        requestAnimationFrame(scanFrame);
      };

      scanFrame();
    } catch (err) {
      resultDiv.textContent = `✗ ${err.message || 'No se pudo acceder a la cámara'}`;
      resultDiv.style.background = '#f8d7da';
      resultDiv.style.color = '#721c24';
    }
  })();
}
