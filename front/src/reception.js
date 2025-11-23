import { getAll, put, del } from "./idb.js";

// Referencias DOM necesarias
const modal = document.getElementById("modal");
const roomsList = document.getElementById("roomsList");
const maidsList = document.getElementById("maidsList");
const reportsEl = document.getElementById("reportsList");
const btnAddRoom = document.getElementById("btnAddRoom");
const btnAddMaid = document.getElementById("btnAddMaid");
// pagination state
let roomsPage = 0;
let maidsPage = 0;
const ITEMS_PER_PAGE = 6;

// Hacer modal accesible desde otros módulos si se necesita
window.modal = modal;

function toBase64(file) {
  return new Promise((res, rej) => {
    const fr = new FileReader();
    fr.onload = () => res(fr.result);
    fr.onerror = rej;
    fr.readAsDataURL(file);
  });
}

function getStatusKey(status) {
  if (!status) return "clean";
  const s = String(status).toLowerCase();
  // map common spanish/english forms to normalized keys
  if (s.includes("bloq") || s.includes("bloque") || s === "blocked") return "blocked";
  if (s.includes("suc") || s.includes("sucio") || s === "dirty") return "dirty";
  if (s.includes("limp") || s.includes("limpia") || s === "clean") return "clean";
  if (s.includes("no") && s.includes("dispon")) return "no-disponible";
  if (s.includes("disp")) return "disponible";
  // fallback: sanitize to a safe class name (replace spaces/punctuation)
  return s.replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '');
}

async function renderAll() {
  const rooms = (await getAll("rooms").catch(() => [])) || [];
  const maids = (await getAll("maids").catch(() => [])) || [];
  const reports = (await getAll("reports").catch(() => [])) || [];

  // remove existing pagers to avoid duplicates
  document.querySelectorAll('.pager').forEach(p => p.remove());

  // Render habitaciones (paginadas)
  roomsList.innerHTML = "";
  const totalRooms = rooms.length;
  const roomsStart = roomsPage * ITEMS_PER_PAGE;
  const roomsPageItems = rooms.slice(roomsStart, roomsStart + ITEMS_PER_PAGE);
  for (const r of roomsPageItems) {
    const card = document.createElement("div");
    card.className = "card room-card";

    const info = document.createElement("div");
    info.className = "info";
    const h3 = document.createElement("h3");
    h3.textContent = `Hab ${r.id}`;
    const badge = document.createElement("span");
    const key = getStatusKey(r.status);
    badge.className = `status-badge ${key}`;
    badge.textContent = r.status || "Limpia";
    const assigned = document.createElement('div');
    assigned.className = 'assigned';
    if (r.maid) {
      const maidObj = maids.find(m => (m.id || m.email) === r.maid);
      assigned.textContent = `Camarer@:`;
    }
    const occ = document.createElement("div");
    occ.className = "occ";
    occ.textContent = r.rented ? "Ocupada" : "";
    info.appendChild(h3);
    info.appendChild(badge);
    info.appendChild(assigned);
    info.appendChild(occ);

    const sel = document.createElement("select");
    sel.innerHTML = '<option value="">Seleccionar camarera</option>' +
      maids
        .map((m) =>
          `<option value="${m.id}" ${r.maid === m.id ? "selected" : ""} ${m.status === "No disponible" ? "disabled" : ""}>${m.name} ${m.status === "No disponible" ? "(No disponible)" : ""}</option>`
        )
        .join("");
    sel.addEventListener("change", async () => {
      const selected = sel.value || null;
      if (!selected) {
        r.maid = null;
      } else {
        const chosen = maids.find((m) => m.id === selected);
        if (chosen && chosen.status === "No disponible") {
          alert("La camarera no está disponible");
          sel.value = r.maid || "";
          return;
        }
        r.maid = selected;
      }
      await put("rooms", r);
      await renderAll();
    });

    const actions = document.createElement("div");
    actions.className = "actions";

  // edit room button
  const btnEditRoom = document.createElement('button');
  btnEditRoom.className = 'btn btn-sm btn-primary';
  btnEditRoom.innerHTML = '<i class="bi bi-pencil" aria-hidden="true"></i>';
  btnEditRoom.title = 'Editar habitación';
  btnEditRoom.addEventListener('click', () => editRoomModal(r));
  actions.appendChild(btnEditRoom);

    // show habilitar if blocked
    if (getStatusKey(r.status) === "blocked") {
      const btn = document.createElement("button");
      btn.textContent = "Habilitar";
      btn.addEventListener("click", async () => {
        r.status = "Sucio"; // marcar como sucio cuando se habilita
        await put("rooms", r);
        await renderAll();
      });
      actions.appendChild(btn);
    }

    card.appendChild(info);
    card.appendChild(sel);
    card.appendChild(actions);
    roomsList.appendChild(card);
  }
  // pagination controls for rooms
  const roomsPager = document.createElement('div');
  roomsPager.className = 'pager';
  const prevRooms = document.createElement('button');
  prevRooms.textContent = '←';
  prevRooms.disabled = roomsPage === 0;
  prevRooms.addEventListener('click', () => { roomsPage = Math.max(0, roomsPage - 1); renderAll(); });
  const nextRooms = document.createElement('button');
  nextRooms.textContent = '→';
  nextRooms.disabled = roomsStart + ITEMS_PER_PAGE >= totalRooms;
  nextRooms.addEventListener('click', () => { if (roomsStart + ITEMS_PER_PAGE < totalRooms) { roomsPage++; renderAll(); } });
  const infoRooms = document.createElement('span');
  infoRooms.textContent = `Página ${roomsPage + 1} / ${Math.max(1, Math.ceil(totalRooms / ITEMS_PER_PAGE))}`;
  roomsPager.appendChild(prevRooms);
  roomsPager.appendChild(infoRooms);
  roomsPager.appendChild(nextRooms);
  roomsList.parentNode.insertBefore(roomsPager, roomsList.nextSibling);
  

  // Render camareras en tabla (paginadas)
  maidsList.innerHTML = "";
  const totalMaids = maids.length;
  const maidsStart = maidsPage * ITEMS_PER_PAGE;
  const maidsPageItems = maids.slice(maidsStart, maidsStart + ITEMS_PER_PAGE);

  const table = document.createElement('table');
  table.className = 'maids-table table';
  const thead = document.createElement('thead');
  thead.innerHTML = '<tr><th>Nombre</th><th>Correo</th><th>Estado</th><th>Acciones</th></tr>';
  table.appendChild(thead);
  const tbody = document.createElement('tbody');

  for (const m of maidsPageItems) {
    const tr = document.createElement('tr');
    const tdName = document.createElement('td');
    tdName.textContent = m.name || '';
    const tdEmail = document.createElement('td');
    tdEmail.textContent = m.email || m.id || '';
    const tdStatus = document.createElement('td');
    const statusBadge = document.createElement('span');
    statusBadge.className = `status-badge ${getStatusKey(m.status)}`;
    statusBadge.textContent = m.status || 'Disponible';
    tdStatus.appendChild(statusBadge);

    const tdActions = document.createElement('td');
    const btnEditRow = document.createElement('button');
    btnEditRow.className = 'btn btn-sm btn-primary me-2';
    btnEditRow.innerHTML = '<i class="bi bi-pencil" aria-hidden="true"></i>';
    btnEditRow.title = 'Editar';
    btnEditRow.addEventListener('click', () => editMaidModal(m));

    const btnDelRow = document.createElement('button');
    btnDelRow.className = 'btn btn-sm btn-danger';
    btnDelRow.innerHTML = '<i class="bi bi-trash" aria-hidden="true"></i>';
    btnDelRow.title = 'Eliminar';
    btnDelRow.addEventListener('click', async () => {
      const ok = await confirmAction('¿Eliminar camarera ' + (m.name || '') + '? Esto quitará la asignación en habitaciones.');
      if (!ok) return;
      const roomsAll = await getAll('rooms').catch(() => []);
      for (const room of roomsAll) {
        if (room.maid === (m.id || m.email)) {
          room.maid = null;
          await put('rooms', room);
        }
      }
      await del('maids', m.id || m.email);
      await renderAll();
    });

    tdActions.appendChild(btnEditRow);
    tdActions.appendChild(btnDelRow);

    tr.appendChild(tdName);
    tr.appendChild(tdEmail);
    tr.appendChild(tdStatus);
    tr.appendChild(tdActions);
    tbody.appendChild(tr);
  }

  table.appendChild(tbody);
  maidsList.appendChild(table);
  // pager for maids
  const maidsPager = document.createElement('div');
  maidsPager.className = 'pager';
  const prevM = document.createElement('button');
  prevM.textContent = '←';
  prevM.disabled = maidsPage === 0;
  prevM.addEventListener('click', () => { maidsPage = Math.max(0, maidsPage - 1); renderAll(); });
  const nextM = document.createElement('button');
  nextM.textContent = '→';
  nextM.disabled = maidsStart + ITEMS_PER_PAGE >= totalMaids;
  nextM.addEventListener('click', () => { if (maidsStart + ITEMS_PER_PAGE < totalMaids) { maidsPage++; renderAll(); } });
  const infoM = document.createElement('span');
  infoM.textContent = `Página ${maidsPage + 1} / ${Math.max(1, Math.ceil(totalMaids / ITEMS_PER_PAGE))}`;
  maidsPager.appendChild(prevM);
  maidsPager.appendChild(infoM);
  maidsPager.appendChild(nextM);
  maidsList.parentNode.insertBefore(maidsPager, maidsList.nextSibling);

  // Render informes
  reportsEl.innerHTML = "";
  for (const rep of (reports || []).sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  )) {
    const r = document.createElement("div");
    r.className = "report";
    r.innerHTML = `<h4>Siniestro - Hab ${rep.roomId}</h4><p class="desc">${rep.description || "(sin descripción)"}</p><p class="meta"><strong>Registrado por:</strong> ${rep.createdBy || "—"} • <small>${rep.createdAt || ""}</small></p>`;
    if (rep.images && rep.images.length) {
      const imgs = document.createElement("div");
      imgs.className = "report-imgs";
      rep.images.forEach((src) => {
        const i = document.createElement("img");
        i.src = src;
        i.width = 120;
        imgs.appendChild(i);
      });
      r.appendChild(imgs);
    }
    reportsEl.appendChild(r);
  }
}

function addRoomModal() {
  modal.classList.remove("hidden");
  modal.innerHTML = `<div class="modal-content" role="dialog"><h3>Nueva Habitación</h3><label>Número de habitación</label><input id="newRoomNumber" required /><label>Estado</label><select id="newRoomStatus"><option value="Limpia">Limpia</option><option value="Sucio">Sucio</option><option value="Bloqueada">Bloqueada</option></select><label class="inline-check"><input type="checkbox" id="newRoomRented" /> <span>Ocupada</span></label><div class="row"><button id="saveRoom">Guardar</button><button id="closeModal">Cerrar</button></div></div>`;
  document.getElementById("closeModal").onclick = () => modal.classList.add("hidden");
  // style buttons
  const saveRoomBtn = document.getElementById("saveRoom");
  const closeRoomBtn = document.getElementById("closeModal");
  if (saveRoomBtn) saveRoomBtn.className = 'btn btn-primary';
  if (closeRoomBtn) closeRoomBtn.className = 'btn btn-secondary';

  document.getElementById("saveRoom").onclick = async () => {
    const id = document.getElementById("newRoomNumber").value.trim();
    const status = document.getElementById("newRoomStatus").value;
    const rented = document.getElementById("newRoomRented").checked;
    if (!id) return alert("Id requerido");
    await put("rooms", { id, status: status || "Limpia", rented: !!rented });
    modal.classList.add("hidden");
    await renderAll();
  };
}

function editRoomModal(room) {
  modal.classList.remove('hidden');
  modal.innerHTML = `<div class="modal-content" role="dialog"><h3>Editar Habitación ${room.id}</h3><label>Estado</label><select id="editRoomStatus"><option value="Limpia">Limpia</option><option value="Sucio">Sucio</option><option value="Bloqueada">Bloqueada</option></select><label class="inline-check"><input type="checkbox" id="editRoomRented" /> <span>Ocupada</span></label><div class="row"><button id="saveEditRoom">Guardar</button><button id="closeModal">Cerrar</button></div></div>`;
  const statusEl = document.getElementById('editRoomStatus');
  if (statusEl) statusEl.value = room.status || 'Limpia';
  const rentedEl = document.getElementById('editRoomRented');
  if (rentedEl) rentedEl.checked = !!room.rented;
  const saveBtn = document.getElementById('saveEditRoom');
  const closeBtn = document.getElementById('closeModal');
  if (saveBtn) saveBtn.className = 'btn btn-primary';
  if (closeBtn) closeBtn.className = 'btn btn-secondary';
  document.getElementById('closeModal').onclick = () => modal.classList.add('hidden');
  document.getElementById('saveEditRoom').onclick = async () => {
    const newStatus = document.getElementById('editRoomStatus').value || 'Limpia';
    const newRented = document.getElementById('editRoomRented').checked;
    room.status = newStatus;
    room.rented = !!newRented;
    await put('rooms', room);
    modal.classList.add('hidden');
    await renderAll();
  };
}

function addMaidModal() {
  modal.classList.remove("hidden");
  modal.innerHTML = `<div class="modal-content" role="dialog"><h3>Nueva Camarera</h3><label>Nombre</label><input id="maidName" required/><label>Correo</label><input id="maidEmail" type="email" required/><label>Contraseña</label><input id="maidPassword" type="password" required/><label>Estado</label><select id="maidStatus"><option value="Disponible">Disponible</option><option value="No disponible">No disponible</option></select><div class="row"><button id="saveMaid">Guardar</button><button id="closeModal">Cerrar</button></div></div>`;
  document.getElementById("closeModal").onclick = () => modal.classList.add("hidden");
  // style buttons
  const saveMaidBtn = document.getElementById("saveMaid");
  const closeMaidBtn = document.getElementById("closeModal");
  if (saveMaidBtn) saveMaidBtn.className = 'btn btn-primary';
  if (closeMaidBtn) closeMaidBtn.className = 'btn btn-secondary';

  document.getElementById("saveMaid").onclick = async () => {
    const name = document.getElementById("maidName").value.trim();
    const email = document.getElementById("maidEmail").value.trim();
    const password = document.getElementById("maidPassword").value;
    const status = document.getElementById("maidStatus").value || "Disponible";
    if (!email || !name || !password) return alert("Completa los campos");
    // Guardamos usando el correo como id (clave).
    const id = email;
    await put("maids", { id, name, email, password, status });
    modal.classList.add("hidden");
    await renderAll();
  };
}

function editMaidModal(maid) {
  modal.classList.remove("hidden");
  // allow editing email (id) — we'll perform migration if changed
  modal.innerHTML = `<div class="modal-content" role="dialog"><h3>Editar Camarera</h3><label>Nombre</label><input id="editMaidName" value="${maid.name || ''}" required/><label>Correo</label><input id="editMaidEmail" type="email" value="${maid.email || maid.id || ''}" required/><label>Estado</label><select id="editMaidStatus"><option value="Disponible">Disponible</option><option value="No disponible">No disponible</option><option value="Ocupado">Ocupado</option></select><div class="row"><button id="saveEditMaid">Guardar</button><button id="closeModal">Cerrar</button></div></div>`;
  const statusEl = modal.querySelector('#editMaidStatus');
  if (statusEl) statusEl.value = maid.status || 'Disponible';
  // style buttons with Bootstrap
  const saveBtn = document.getElementById("saveEditMaid");
  const closeBtn = document.getElementById("closeModal");
  if (saveBtn) saveBtn.className = 'btn btn-primary';
  if (closeBtn) closeBtn.className = 'btn btn-secondary';
  document.getElementById("closeModal").onclick = () => modal.classList.add("hidden");
  document.getElementById("saveEditMaid").onclick = async () => {
    const name = document.getElementById("editMaidName").value.trim();
    const newEmail = document.getElementById("editMaidEmail").value.trim();
    const status = document.getElementById("editMaidStatus").value || 'Disponible';
    if (!name || !newEmail) return alert("Nombre y correo requeridos");
    const oldId = maid.id || maid.email;
    const newId = newEmail;
    // if email changed, migrate record key in IndexedDB
    if (newId !== oldId) {
      const allMaids = (await getAll('maids').catch(() => [])) || [];
      const exists = allMaids.find(x => (x.id || x.email) === newId);
      if (exists) return alert('Ya existe una camarera con ese correo');
      // create new record with newId
      const newRecord = { ...maid, id: newId, name, email: newId, status };
      await put('maids', newRecord);
      // update rooms referencing oldId to point to newId
      const roomsAll = await getAll('rooms').catch(() => []);
      for (const room of roomsAll) {
        if (room.maid === oldId) {
          room.maid = newId;
          await put('rooms', room);
        }
      }
      // remove old record
      await del('maids', oldId);
    } else {
      // same id — just update record
      await put('maids', { ...maid, id: newId, name, email: newId, status });
    }
    modal.classList.add("hidden");
    await renderAll();
  };
}

async function openReportModal(room, maids = []) {
  modal.classList.remove("hidden");
  modal.innerHTML = `<div class="modal-content" role="dialog"><h3>Siniestro - Hab ${room.id}</h3><label>Descripción</label><textarea id="desc"></textarea><label>Fotos (máx 3)</label><input id="files" type="file" accept="image/*" multiple /><div class="row"><button id="send">Enviar</button><button id="close">Cerrar</button></div></div>`;
  document.getElementById("close").onclick = () => modal.classList.add("hidden");
  document.getElementById("send").onclick = async () => {
    const desc = document.getElementById("desc").value.trim();
    const files = document.getElementById("files").files;
    if (!desc) return alert("Descripción requerida");
    const images = [];
    for (let i = 0; i < Math.min(3, files.length); i++) images.push(await toBase64(files[i]));
    const report = {
      _id: "r_" + Date.now(),
      roomId: room.id,
      description: desc,
      images,
      createdAt: new Date().toISOString(),
      createdBy: "recepcion"
    };
    // marcar habitación como bloqueada (valor en español)
    room.status = "Bloqueada";
    await put("rooms", room);
    await put("reports", report);
    modal.classList.add("hidden");
    await renderAll();
  };
}

// simple confirm modal that returns a Promise<boolean>
function confirmAction(message) {
  return new Promise((res) => {
    modal.classList.remove('hidden');
    modal.innerHTML = `<div class="modal-content" role="dialog"><h4>Confirmar</h4><p>${message}</p><div class="row"><button id="confirmYes" class="btn btn-primary">Sí</button><button id="confirmNo" class="btn btn-secondary">No</button></div></div>`;
    document.getElementById('confirmNo').onclick = () => {
      modal.classList.add('hidden');
      res(false);
    };
    document.getElementById('confirmYes').onclick = () => {
      modal.classList.add('hidden');
      res(true);
    };
  });
}

// Enlazar botones
if (btnAddRoom) btnAddRoom.addEventListener("click", addRoomModal);
if (btnAddMaid) btnAddMaid.addEventListener("click", addMaidModal);

// Cerrar modal al clicar fuera
if (modal)
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.classList.add("hidden");
  });

// Cerrar modal con ESC
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && modal && !modal.classList.contains("hidden")) modal.classList.add("hidden");
});

// Inicializar render
renderAll();
