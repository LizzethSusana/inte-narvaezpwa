import { openDB, getAll, put } from "./idb.js";
import { saveReportOffline } from "./offline-sync.js";

const modal = document.getElementById("modal");
const grid = document.getElementById("maidRooms");
const filterBtns = Array.from(document.querySelectorAll(".filters button"));

const params = new URLSearchParams(location.search);
const user = params.get("user");
let currentFilter = "all";

if (!user) {
  alert("Usuario no especificado. Vuelve al login.");
  location.href = "/index.html";
}

filterBtns.forEach((b) => {
  b.addEventListener("click", () => {
    filterBtns.forEach((x) => x.classList.remove("active"));
    b.classList.add("active");
    currentFilter = b.getAttribute("data-filter") || "all";
    render();
  });
});

function matchesFilter(r, filter) {
  if (!filter || filter === "all") return true;
  if (filter === "to-clean")
    return (
      String(r.status || "")
        .toLowerCase()
        .includes("suc") || String(r.status || "").toLowerCase() === "dirty"
    );
  if (filter === "clean")
    return (
      String(r.status || "")
        .toLowerCase()
        .includes("limp") || String(r.status || "").toLowerCase() === "clean"
    );
  if (filter === "occupied") return !!r.rented;
  if (filter === "blocked")
    return (
      String(r.status || "")
        .toLowerCase()
        .includes("bloq") || String(r.status || "").toLowerCase() === "blocked"
    );
  return true;
}

export async function render() {
  const rooms = (await getAll("rooms").catch(() => [])) || [];
  // show only rooms assigned to this user
  let visible = rooms.filter((r) => r.maid === user || r.maid === user);
  visible = visible.filter((r) => matchesFilter(r, currentFilter));

  grid.innerHTML = "";
  if (!visible.length) {
    grid.innerHTML = "<p>No hay habitaciones asignadas.</p>";
    return;
  }

  for (const r of visible) {
    const el = document.createElement("div");
    el.className = "card room-card framed";
    const statusText = r.status || "Limpia";
    el.innerHTML = `<h3>Hab ${r.id}</h3><p>Estado: ${statusText}${
      r.rented ? " (ocupada)" : ""
    }</p>`;

    // action container for nicer layout
    const rowActions = document.createElement("div");
    rowActions.className = "row-actions";

    // show clean button only when status indicates 'sucia' / 'sucio'
    const statusLower = String(r.status || "").toLowerCase();
    if (statusLower.includes("suc") || statusLower === "dirty") {
      const btnClean = document.createElement("button");
      btnClean.className = "btn btn-sm btn-success";
      btnClean.innerHTML = '<i class="bi bi-broom"></i>Marcar limpia';
      btnClean.addEventListener("click", async () => {
        const ok = await confirmAction(
          "¿Marcar habitación " + r.id + " como limpia?"
        );
        if (!ok) return;
        r.status = "Limpia";
        await put("rooms", r);
        await render();
      });
      rowActions.appendChild(btnClean);
    }

    const btnReport = document.createElement("button");
    btnReport.className = "btn btn-sm btn-danger";
    btnReport.innerHTML =
      '<i class="bi bi-exclamation-triangle"></i>Levantar siniestro';
    btnReport.addEventListener("click", () => openReportModal(r));
    rowActions.appendChild(btnReport);

    el.appendChild(rowActions);

    const tag = document.createElement("small");
    tag.textContent = "Asignada";
    el.appendChild(tag);

    grid.appendChild(el);
  }
}

// simple confirm modal for maid page
function confirmAction(message) {
  return new Promise((res) => {
    modal.classList.remove("hidden");
    modal.innerHTML = `<div class="modal-content" role="dialog"><h4>Confirmar</h4><p>${message}</p><div class="row"><button id="confirmYes" class="btn btn-primary">Sí</button><button id="confirmNo" class="btn btn-secondary">No</button></div></div>`;
    document.getElementById("confirmNo").onclick = () => {
      modal.classList.add("hidden");
      res(false);
    };
    document.getElementById("confirmYes").onclick = () => {
      modal.classList.add("hidden");
      res(true);
    };
  });
}

function warningModal(msg) {
  return new Promise((res) => {
    modal.classList.remove("hidden");
    modal.innerHTML = `
    <div class="modal-content" style="border-left: 6px solid #f5c048;">
      <h4 style="color:#b8860b;">Advertencia</h4>
      <p>${msg}</p>
      <div class="row">
        <button id="warnOk" class="btn btn-primary">Aceptar</button>
      </div>
    </div>`;
    document.getElementById("warnOk").onclick = () => {
      modal.classList.add("hidden");
      res(true);
    };
  });
}
function modalSuccess(msg) {
  return new Promise((res) => {
    modal.classList.remove("hidden");
    modal.innerHTML = `
    <div class="modal-content" style="border-left: 6px solid #42c76a;">
      <h3 style="color:#2e8b57;">Éxito</h3>
      <p>${msg}</p>
      <div class="row">
        <button id="okSuccess" class="btn btn-primary">Aceptar</button>
      </div>
    </div>`;
    document.getElementById("okSuccess").onclick = () => {
      modal.classList.add("hidden");
      res(true);
    };
  });
}

function modalError(msg) {
  return new Promise((res) => {
    modal.classList.remove("hidden");
    modal.innerHTML = `
    <div class="modal-content" style="border-left: 6px solid #ff5d5d;">
      <h3 style="color:#b00020;">Error</h3>
      <p>${msg}</p>
      <div class="row">
        <button id="okError" class="btn btn-secondary">Cerrar</button>
      </div>
    </div>`;
    document.getElementById("okError").onclick = () => {
      modal.classList.add("hidden");
      res(true);
    };
  });
}

function toBase64(file) {
  return new Promise((res, rej) => {
    const fr = new FileReader();
    fr.onload = () => res(fr.result);
    fr.onerror = rej;
    fr.readAsDataURL(file);
  });
}

function openReportModal(room) {
  modal.classList.remove("hidden");
  modal.classList.add("show");

  modal.innerHTML = `
  <div class="modal-content">
    <h3>Siniestro - Hab ${room.id}</h3>
    <label>Descripción</label>
    <textarea id="desc"></textarea>
    <label>Fotos (máx 3)</label>
    <input id="files" type="file" accept="image/*" multiple />
    <div class="row">
      <button id="send" class="btn btn-primary">Enviar</button>
      <button id="close" class="btn btn-secondary">Cerrar</button>
    </div>
  </div>`;

  document.getElementById("close").onclick = () =>
    modal.classList.add("hidden");

  document.getElementById("send").onclick = async () => {
    const desc = document.getElementById("desc").value.trim();
    const files = document.getElementById("files").files; // ✅ AQUÍ DEBE IR

    // ⚠️ VALIDACIÓN DE MÁS DE 3 FOTOS
    if (files.length > 3) {
      await warningModal("Solo puedes subir máximo 3 fotos.");
      return;
    }

    if (!desc) return alert("Descripción requerida");

    const images = [];
    for (let i = 0; i < Math.min(3, files.length); i++) {
      images.push(await toBase64(files[i]));
    }

    const report = {
      _id: "r_" + Date.now(),
      roomId: room.id,
      description: desc,
      images,
      createdAt: new Date().toISOString(),
      createdBy: user,
    };
    // marcar habitación como bloqueada
    room.status = "Bloqueada";
    await put("rooms", room);
    try {
      const resp = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(report),
      });

      if (!resp.ok) throw new Error("Network");

      const rjson = await resp.json();
      await put("reports", rjson);

      // ✔ Mostrar modal de éxito
      await modalSuccess("El reporte fue enviado correctamente.");
    } catch (e) {
      // guardar offline
      await saveReportOffline(report);
      await put("reports", report);

      // ❌ Modal de error
      await modalError(
        "No se pudo enviar el reporte. Se guardó para enviar más tarde."
      );
    }

    // cerrar modal y refrescar
    modal.classList.add("hidden");
    await render();
  };
}

async function init() {
  await openDB();
  // set default active filter button
  const btnAll = document.querySelector('.filters button[data-filter="all"]');
  if (btnAll) btnAll.classList.add("active");
  await render();
}

init();
