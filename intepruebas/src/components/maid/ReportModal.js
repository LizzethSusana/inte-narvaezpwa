// =====================================================
// COMPONENTE: MODAL DE REPORTE DE SINIESTRO
// =====================================================

import { startRearCameraStream, stopCameraStream, capturePhoto, requestCameraPermission } from '$/utils/camera.js';
import { CAMERA_CONFIG } from '$/utils/constants.js';
import { postReport } from '$/services/ApiMaid.js';
import { put } from '../../idb.js';
import { saveReportOffline } from '../../offline-sync.js';

/**
 * Abre el modal de reporte de siniestro
 * @param {Object} room - Habitación donde ocurrió el siniestro
 * @param {number} userId - ID del usuario que reporta
 * @param {Function} onSuccess - Callback cuando se envía el reporte exitosamente
 */
export async function openReportModal(room, userId, onSuccess) {
  const modal = document.createElement('div');
  modal.className = 'modal show';
  modal.style.display = 'flex';

  modal.innerHTML = `
  <div class="modal-content report-modal">
    <header class="report-modal__header">
      <div>
        <p class="report-badge">Hab ${room.id}</p>
        <h3>Reporte de siniestro</h3>
        <p class="report-subtitle">Describe el incidente y adjunta hasta 3 fotos.</p>
      </div>
    </header>

    <div class="report-grid">
      <div class="form-field">
        <label for="subject">Tema / Asunto</label>
        <input id="subject" type="text" placeholder="Ej: Fuga de agua, daño en mueble, etc." required />
      </div>

      <div class="form-field">
        <label for="desc">Descripción</label>
        <textarea id="desc" placeholder="Describe el problema en detalle..." required></textarea>
      </div>

      <div class="form-field">
        <div class="field-label-row">
          <label>Fotos (máx 3)</label>
          <span id="photoCount" class="counter">0 / 3</span>
        </div>
        <div id="cameraArea" class="camera-card">
          <div class="camera-preview">
            <video id="video" autoplay playsinline></video>
            <canvas id="canvas"></canvas>
            <div class="camera-placeholder" id="cameraPlaceholder">Vista previa de la cámara</div>
          </div>
          <div id="cameraControls" class="camera-controls">
            <button id="startCam" class="btn btn-sm btn-primary">Iniciar cámara</button>
            <button id="capture" class="btn btn-sm btn-success" disabled>Tomar foto</button>
          </div>
          <div id="thumbs" class="thumbs"></div>
        </div>
      </div>
    </div>

    <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 24px;">
      <button id="close" class="btn btn-sm btn-secondary">Cancelar</button>
      <button id="send" class="btn btn-sm btn-primary">Enviar reporte</button>
    </div>
  </div>`;

  document.body.appendChild(modal);

  // Elementos del DOM
  const video = modal.querySelector('#video');
  const canvas = modal.querySelector('#canvas');
  const startCamBtn = modal.querySelector('#startCam');
  const captureBtn = modal.querySelector('#capture');
  const thumbs = modal.querySelector('#thumbs');
  const photoCount = modal.querySelector('#photoCount');
  const cameraPreview = modal.querySelector('.camera-preview');
  const cameraPlaceholder = modal.querySelector('#cameraPlaceholder');
  const closeBtn = modal.querySelector('#close');
  const sendBtn = modal.querySelector('#send');
  const subjectInput = modal.querySelector('#subject');
  const descInput = modal.querySelector('#desc');

  // Estado
  let stream = null;
  const images = [];

  // Cleanup
  const cleanup = () => {
    if (stream) {
      stopCameraStream(stream);
      stream = null;
    }
    modal.remove();
  };

  // Solicitar permiso anticipado
  await requestCameraPermission();

  // Event: Cerrar
  closeBtn.addEventListener('click', cleanup);

  // Event: Iniciar cámara
  startCamBtn.addEventListener('click', async () => {
    alert('Se va a solicitar acceso a la cámara para capturar fotos del reporte.');

    startCamBtn.disabled = true;
    startCamBtn.textContent = 'Iniciando...';

    try {
      stream = await startRearCameraStream(video);
      video.style.display = 'block';
      cameraPreview.classList.add('active');
      cameraPlaceholder.style.display = 'none';
      startCamBtn.style.display = 'none';
      captureBtn.disabled = false;
      updateUI();
    } catch (err) {
      startCamBtn.disabled = false;
      startCamBtn.textContent = 'Iniciar cámara';
      alert(err.message || 'No se pudo acceder a la cámara trasera.');
    }
  });

  // Event: Capturar foto
  captureBtn.addEventListener('click', () => {
    if (!stream) return;

    try {
      const photoData = capturePhoto(video, canvas);
      images.push(photoData);
      updateThumbs();
      updateUI();

      if (images.length >= CAMERA_CONFIG.MAX_PHOTOS) {
        captureBtn.disabled = true;
      }
    } catch (err) {
      alert(err.message || 'Error al capturar foto');
    }
  });

  // Event: Enviar reporte
  sendBtn.addEventListener('click', async () => {
    const subject = subjectInput.value.trim();
    const description = descInput.value.trim();

    if (!subject) {
      alert('El tema es requerido');
      return;
    }

    if (!description) {
      alert('La descripción es requerida');
      return;
    }

    if (images.length === 0) {
      alert('Debes tomar al menos 1 foto con la cámara.');
      return;
    }

    const finalImages = images.slice(0, CAMERA_CONFIG.MAX_PHOTOS);

    const report = {
      _id: 'r_' + Date.now(),
      room_id: room.id,
      user_id: userId,
      description: `${subject}\n\n${description}`,
      images: finalImages,
      status: 'Pendiente',
      createdAt: new Date().toISOString(),
    };

    // Marcar habitación como bloqueada
    room.status = 'Bloqueada';
    await put('rooms', room);

    const hasConnection = navigator.onLine;

    try {
      if (hasConnection) {
        // Intentar enviar al backend
        const result = await postReport(report);
        await put('reports', result);
        alert('✓ El reporte fue enviado correctamente al servidor.');
      } else {
        throw new Error('Sin conexión');
      }
    } catch (err) {
      // Guardar offline
      console.warn('Error al enviar a servidor, guardando offline:', err);
      await saveReportOffline(report);
      await put('reports', report);

      if (hasConnection) {
        alert('✓ El reporte ha sido guardado en tu dispositivo.\n\nSe sincronizará automáticamente con el servidor cuando sea posible.');
      } else {
        alert('📱 Sin conexión a internet.\n\nEl reporte se ha guardado en tu dispositivo y se sincronizará automáticamente cuando la conexión se restablezca.');
      }
    }

    cleanup();
    if (onSuccess) onSuccess();
  });

  // Funciones auxiliares
  function updateUI() {
    photoCount.textContent = `${images.length} / ${CAMERA_CONFIG.MAX_PHOTOS}`;
    captureBtn.disabled = images.length >= CAMERA_CONFIG.MAX_PHOTOS || !stream;
  }

  function updateThumbs() {
    thumbs.innerHTML = '';
    images.forEach((src, idx) => {
      const d = document.createElement('div');
      d.className = 'thumb';

      const img = document.createElement('img');
      img.src = src;
      img.alt = 'Foto capturada';
      d.appendChild(img);

      const rem = document.createElement('button');
      rem.textContent = '✕';
      rem.title = 'Eliminar';
      rem.className = 'thumb-remove';
      rem.onclick = () => {
        images.splice(idx, 1);
        updateThumbs();
        updateUI();
      };
      d.appendChild(rem);

      thumbs.appendChild(d);
    });
  }

  updateUI();
}
