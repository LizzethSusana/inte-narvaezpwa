export function createRoomCard(room, handlers = {}) {
  // handlers: { onClean(roomId), onReport(roomId), onUnlock(roomId) }
  const div = document.createElement('div');
  div.className = 'room card';
  div.dataset.roomId = room.id;

  const number = document.createElement('div');
  number.className = 'number';
  number.textContent = room.number || ('#' + room.id);

  const state = document.createElement('div');
  state.className = 'state';
  state.textContent = 'Estado: ' + (room.state || 'N/A');

  const rented = document.createElement('div');
  rented.className = 'rented';
  rented.textContent = room.rented ? 'Rentada' : 'No rentada';
  rented.style.fontSize = '12px';
  rented.style.color = '#6b7280';

  const actions = document.createElement('div');
  actions.style.marginTop = '8px';
  actions.style.display = 'flex';
  actions.style.gap = '8px';

  const btnClean = document.createElement('button');
  btnClean.textContent = 'Marcar limpia';
  btnClean.onclick = () => handlers.onClean && handlers.onClean(room.id);

  const btnReport = document.createElement('button');
  btnReport.textContent = 'Levantar siniestro';
  btnReport.className = 'secondary';
  btnReport.onclick = () => handlers.onReport && handlers.onReport(room.id);

  actions.appendChild(btnClean);
  actions.appendChild(btnReport);

  // Si la habitación está bloqueada y hay handler unlock, mostrar botón
  if (room.state === 'BLOQUEADA' || room.state === 'bloqueada') {
    const btnUnlock = document.createElement('button');
    btnUnlock.textContent = 'Habilitar (Recepción)';
    btnUnlock.style.background = '#2563eb';
    btnUnlock.onclick = () => handlers.onUnlock && handlers.onUnlock(room.id);
    actions.appendChild(btnUnlock);
  }

  div.appendChild(number);
  div.appendChild(state);
  div.appendChild(rented);
  div.appendChild(actions);

  return div;
}

// Modal para crear/rellenar reporte (devuelve formulario y promesa si se desea)
export function showReportModal(roomId, onSend) {
  // onSend: async function(formData) that returns result or throws
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  Object.assign(modal.style, {
    position: 'fixed', left: 0, top: 0, right: 0, bottom: 0, display: 'flex',
    alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)', zIndex: 9999
  });

  const card = document.createElement('div');
  card.className = 'card';
  card.style.width = '92%';
  card.style.maxWidth = '460px';

  card.innerHTML = `
    <h3>Reporte - Hab ${roomId}</h3>
    <div style="margin-top:8px">
      <label style="font-size:13px">Descripción</label>
      <textarea id="repDesc" placeholder="Descripción breve" rows="3" style="width:100%;padding:8px;border-radius:6px;border:1px solid #e6e9ef"></textarea>
    </div>
    <div style="margin-top:8px">
      <label style="font-size:13px">Fotos (máx 3)</label>
      <div style="display:flex;gap:8px;margin-top:6px">
        <input type="file" id="repPhoto1" accept="image/*">
        <input type="file" id="repPhoto2" accept="image/*">
        <input type="file" id="repPhoto3" accept="image/*">
      </div>
    </div>
    <div style="display:flex;gap:8px;margin-top:12px;justify-content:flex-end">
      <button id="sendRep">Enviar</button>
      <button id="cancelRep" class="secondary">Cancelar</button>
    </div>
    <div id="repStatus" style="margin-top:8px;font-size:13px;color:#065f46"></div>
  `;

  modal.appendChild(card);
  document.body.appendChild(modal);

  const descEl = card.querySelector('#repDesc');
  const p1 = card.querySelector('#repPhoto1');
  const p2 = card.querySelector('#repPhoto2');
  const p3 = card.querySelector('#repPhoto3');

  const status = card.querySelector('#repStatus');

  card.querySelector('#cancelRep').onclick = () => {
    modal.remove();
  };

  card.querySelector('#sendRep').onclick = async () => {
    const desc = descEl.value.trim();
    const f1 = p1.files[0] || null;
    const f2 = p2.files[0] || null;
    const f3 = p3.files[0] || null;

    if (!desc) {
      status.textContent = 'La descripción es requerida.';
      status.style.color = '#b91c1c';
      return;
    }

    status.textContent = 'Enviando...';
    status.style.color = '#0f172a';
    try {
      await onSend(roomId, desc, [f1, f2, f3]);
      status.textContent = 'Reporte enviado/encolado correctamente.';
      status.style.color = '#065f46';
      setTimeout(()=>modal.remove(), 900);
    } catch (err) {
      status.textContent = 'Error: ' + (err.message || err);
      status.style.color = '#b91c1c';
    }
  };

  return {
    close: () => modal.remove()
  };
}

// Confirm simple
export function showConfirm(message, onYes) {
  const modal = document.createElement('div');
  Object.assign(modal.style, {
    position: 'fixed', left: 0, top: 0, right: 0, bottom: 0, display: 'flex',
    alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)', zIndex: 9999
  });
  const card = document.createElement('div'); card.className = 'card';
  card.style.maxWidth = '380px';
  card.innerHTML = `<div style="margin-bottom:8px">${message}</div><div style="display:flex;gap:8px;justify-content:flex-end"><button id="yes">Si</button><button id="no" class="secondary">No</button></div>`;
  modal.appendChild(card);
  document.body.appendChild(modal);
  card.querySelector('#no').onclick = () => modal.remove();
  card.querySelector('#yes').onclick = () => { modal.remove(); onYes && onYes(); };
}

// Toast (temporal)
export function showToast(text, time = 3000) {
  const t = document.createElement('div');
  t.className = 'toast';
  Object.assign(t.style, {
    position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)',
    background: '#111827', color: 'white', padding: '8px 12px', borderRadius: '8px', zIndex: 20000, opacity: 0.95
  });
  t.textContent = text;
  document.body.appendChild(t);
  setTimeout(()=> t.remove(), time);
}

// Render listado de habitaciones en un contenedor
export function renderRooms(container, rooms = [], handlers = {}) {
  container.innerHTML = '';
  if (!rooms || rooms.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'card';
    empty.textContent = 'No hay habitaciones';
    container.appendChild(empty);
    return;
  }
  rooms.forEach(r => {
    const card = createRoomCard(r, handlers);
    container.appendChild(card);
  });
}