import{A as K,C as m,R as L}from"./constants-BVeJQJW2.js";import{p as v,r as Z,o as ee,g as H}from"./sw-register-DeILLKBX.js";import{s as ae,g as te,r as re,a as oe,b as ne,f as B,c as ie,d as se,e as D}from"./idb-cleanup-DYMc0oMr.js";const Q=K;function G(){return localStorage.getItem("authToken")}async function $(e,a={}){const t=G(),r={"Content-Type":"application/json",...a.headers};t&&(r.Authorization=`Bearer ${t}`);const o=await fetch(`${Q}${e}`,{...a,headers:r});if(!o.ok){const s=await o.json().catch(()=>({}));throw new Error(s.message||`HTTP Error ${o.status}`)}return o.json()}async function ce(){try{return(await $("/rooms")).data||[]}catch(e){throw console.error("Error al obtener habitaciones:",e),e}}async function le(e){try{return await $("/rooms",{method:"PUT",body:JSON.stringify(e)})}catch(a){throw console.error("Error al actualizar habitación:",a),a}}async function de(){try{return(await $("/room-assignments")).data||[]}catch(e){throw console.error("Error al obtener asignaciones:",e),e}}async function ue(e){try{const a=new FormData;if(a.append("title",e.title),a.append("description",e.description),a.append("user_id",e.user_id.toString()),a.append("room_id",e.room_id.toString()),a.append("active",e.active!==void 0?e.active.toString():"true"),e.images&&Array.isArray(e.images))for(let s=0;s<Math.min(e.images.length,3);s++){const i=e.images[s],c=me(i),l=`photo${s+1}.jpg`;a.append(`photo${s+1}`,c,l)}const t=G(),r={};t&&(r.Authorization=`Bearer ${t}`);const o=await fetch(`${Q}/reports`,{method:"POST",headers:r,body:a});if(!o.ok){const s=await o.json().catch(()=>({}));throw new Error(s.message||"Error al enviar reporte")}return o.json()}catch(a){throw console.error("Error al enviar reporte:",a),a}}function me(e){const a=e.split(";base64,"),t=a[0].split(":")[1],r=window.atob(a[1]),o=r.length,s=new Uint8Array(o);for(let i=0;i<o;++i)s[i]=r.charCodeAt(i);return new Blob([s],{type:t})}async function q(){if(!navigator.mediaDevices||!navigator.mediaDevices.enumerateDevices)return!1;try{const a=(await navigator.mediaDevices.enumerateDevices()).filter(r=>r.kind==="videoinput");if(!a.length)return!1;if(a.some(r=>r.label&&r.label.trim().length>0)){const r=/back|rear|environment|trasera|trasero|posterior/i;return a.some(o=>r.test(o.label))}try{return(await navigator.mediaDevices.getUserMedia({video:{facingMode:{exact:"environment"}}})).getTracks().forEach(o=>o.stop()),!0}catch{return!1}}catch(e){return console.error("Error al detectar cámara trasera:",e),!1}}async function fe(){if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia)return console.warn("getUserMedia no está disponible en este navegador"),!1;try{return(await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:"environment"}},audio:!1})).getTracks().forEach(a=>a.stop()),console.log("Permiso de cámara concedido"),!0}catch(e){return console.warn("Permiso de cámara denegado o no disponible:",e.name,e.message),e.name==="NotAllowedError"?console.error("El usuario denegó el permiso de cámara"):e.name==="NotFoundError"&&console.error("No se encontró ninguna cámara en el dispositivo"),!1}}async function V(e){if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia)throw new Error("Tu navegador no soporta acceso a cámara.");try{const a=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:m.FACING_MODE}},audio:!1});return e.srcObject=a,a}catch(a){throw console.error("Error al iniciar cámara:",a),new Error("No se pudo acceder a la cámara trasera. Verifica permisos.")}}function W(e){e&&e.getTracks().forEach(a=>a.stop())}function pe(e,a){const t=e.videoWidth,r=e.videoHeight;if(!t||!r)throw new Error("Cámara no lista. Intenta de nuevo.");return a.width=t,a.height=r,a.getContext("2d").drawImage(e,0,0,t,r),a.toDataURL(m.IMAGE_FORMAT,m.IMAGE_QUALITY)}function be(e,a){if(!window.jsQR)return console.warn("jsQR library not loaded"),null;if(e.readyState!==e.HAVE_ENOUGH_DATA)return null;a.width=e.videoWidth,a.height=e.videoHeight;const t=a.getContext("2d");t.drawImage(e,0,0,a.width,a.height);const r=t.getImageData(0,0,a.width,a.height),o=window.jsQR(r.data,r.width,r.height,{inversionAttempts:"dontInvert"});return o?o.data:null}async function ge(e,a,t){const r=document.createElement("div");r.className="modal show",r.style.display="flex",r.innerHTML=`
  <div class="modal-content report-modal">
    <header class="report-modal__header">
      <div>
        <p class="report-badge">Hab ${e.id}</p>
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
        <div id="permissionWarning" class="permission-warning" style="display:none; background:#fff3cd; border:1px solid #ffc107; padding:12px; border-radius:8px; margin-bottom:12px;">
          <strong>⚠️ Permiso de cámara requerido</strong>
          <p style="margin:8px 0 0 0; font-size:14px; color:#856404;">
            Para adjuntar evidencia fotográfica del siniestro, por favor habilita el permiso de cámara en la configuración de tu navegador.
          </p>
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
  </div>`,document.body.appendChild(r);const o=r.querySelector("#video"),s=r.querySelector("#canvas"),i=r.querySelector("#startCam"),c=r.querySelector("#capture"),l=r.querySelector("#thumbs"),E=r.querySelector("#photoCount"),S=r.querySelector(".camera-preview"),A=r.querySelector("#cameraPlaceholder"),b=r.querySelector("#close"),g=r.querySelector("#send"),X=r.querySelector("#subject"),Y=r.querySelector("#desc"),J=r.querySelector("#permissionWarning");let h=null;const d=[];let P=!1;const N=()=>{h&&(W(h),h=null),r.remove()};P=await fe(),P||(J.style.display="block",i.disabled=!0,i.textContent="Permiso denegado",g.disabled=!0,g.title="Debes adjuntar al menos 1 foto para enviar el reporte"),b.addEventListener("click",N),i.addEventListener("click",async()=>{alert("Se va a solicitar acceso a la cámara para capturar fotos del reporte."),i.disabled=!0,i.textContent="Iniciando...";try{h=await V(o),o.style.display="block",S.classList.add("active"),A.style.display="none",i.style.display="none",c.disabled=!1,k()}catch(u){i.disabled=!1,i.textContent="Iniciar cámara",alert(u.message||"No se pudo acceder a la cámara trasera.")}}),c.addEventListener("click",()=>{if(h){if(d.length>=m.MAX_PHOTOS){alert("Ya has tomado el máximo de 3 fotos permitidas.");return}try{const u=pe(o,s);d.push(u),O(),k(),d.length>=m.MAX_PHOTOS&&(c.disabled=!0,c.textContent="Máximo alcanzado (3/3)",c.title="Ya has adjuntado 3 fotos (máximo permitido)")}catch(u){alert(u.message||"Error al capturar foto")}}}),g.addEventListener("click",async()=>{const u=X.value.trim(),M=Y.value.trim();if(!u){alert("El tema es requerido");return}if(!M){alert("La descripción es requerida");return}if(d.length===0){alert("Debes tomar al menos 1 foto con la cámara.");return}const y=d.slice(0,m.MAX_PHOTOS),f={_id:"r_"+Date.now(),title:u,description:M,user_id:a,room_id:e.id,images:y,status:"Pendiente",createdAt:new Date().toISOString()};e.status="Bloqueada",await v("rooms",e);const p=navigator.onLine;try{if(p){console.log("Enviando reporte al backend:",f);const w=await ue(f);console.log("Respuesta del backend:",w),w.data&&await v("reports",{...w.data,_synced:!0}),alert("✓ El reporte fue enviado correctamente al servidor.")}else throw new Error("Sin conexión")}catch(w){console.warn("Error al enviar a servidor, guardando offline:",w),await ae(f),await v("reports",{...f,_synced:!1}),alert(p?`⚠️ ${w.message}

El reporte ha sido guardado en tu dispositivo y se sincronizará automáticamente con el servidor cuando sea posible.`:`📱 Sin conexión a internet.

El reporte se ha guardado en tu dispositivo y se sincronizará automáticamente cuando la conexión se restablezca.`)}N(),t&&t()});function k(){E.textContent=`${d.length} / ${m.MAX_PHOTOS}`,d.length>=m.MAX_PHOTOS?(c.disabled=!0,c.textContent="Máximo alcanzado (3/3)"):h?(c.disabled=!1,c.textContent="Tomar foto"):(c.disabled=!0,c.textContent="Tomar foto"),d.length===0?(g.disabled=!0,g.title="Debes adjuntar al menos 1 foto para enviar el reporte"):(g.disabled=!1,g.title="")}function O(){l.innerHTML="",d.forEach((u,M)=>{const y=document.createElement("div");y.className="thumb";const f=document.createElement("img");f.src=u,f.alt="Foto capturada",y.appendChild(f);const p=document.createElement("button");p.textContent="✕",p.title="Eliminar",p.className="thumb-remove",p.onclick=()=>{d.splice(M,1),O(),k(),d.length<m.MAX_PHOTOS&&h&&(c.disabled=!1,c.textContent="Tomar foto",c.title="")},y.appendChild(p),l.appendChild(y)})}k()}function he(e,a){const t=document.createElement("div");t.className="modal show",t.innerHTML=`
    <div class="modal-content" style="max-width: 500px;">
      <h4>Escanear QR/Código de barras</h4>
      <p style="font-size: 0.9rem; color: #666;">Apunta la cámara al código QR o barras de la habitación</p>
      <video id="qrVideo" autoplay playsinline style="width: 100%; border-radius: 8px; background: #000; margin: 16px 0;"></video>
      <div id="qrResult" style="min-height: 40px; padding: 12px; background: #f0f0f0; border-radius: 8px; margin: 12px 0; text-align: center; font-weight: 600;"></div>
      <div class="row">
        <button id="cancelQr" class="btn btn-secondary">Cerrar</button>
      </div>
    </div>
  `,document.body.appendChild(t);const r=t.querySelector("#qrVideo"),o=t.querySelector("#qrResult"),s=t.querySelector("#cancelQr");let i=null,c=!0,l=null;const E=()=>{c=!1,i&&(W(i),i=null),t.remove()};s.addEventListener("click",()=>{E(),a&&a()}),(async()=>{try{i=await V(r),r.play();const S=document.createElement("canvas"),A=()=>{if(!c)return;const b=be(r,S);if(b&&b!==l){l=b,o.textContent=`✓ Detectado: ${b}`,o.style.background="#d4edda",o.style.color="#155724",setTimeout(()=>{E(),e&&e(b)},600);return}requestAnimationFrame(A)};A()}catch(S){o.textContent=`✗ ${S.message||"No se pudo acceder a la cámara"}`,o.style.background="#f8d7da",o.style.color="#721c24"}})()}const n={currentFilter:"all",selectedFloor:null,rearCameraAvailable:null,currentUserId:null,allRooms:[]},ve=document.getElementById("userEmail"),ye=document.getElementById("logoutBtn"),U=document.getElementById("scanQrBtn"),j=document.getElementById("filterGroup"),T=document.getElementById("floorGrid"),I=document.getElementById("roomsList");async function z(){var e;if(!navigator.onLine){console.log("Sin conexión - usando datos locales");return}console.log("Sincronizando datos desde backend...");try{const[a,t]=await Promise.all([ce(),de()]);for(const r of a){const o=t.find(s=>{var i;return((i=s.room)==null?void 0:i.id)===r.id});await v("rooms",{id:r.id,number:r.number,status:r.status,maidId:((e=o==null?void 0:o.user)==null?void 0:e.id)||null,assignmentId:(o==null?void 0:o.id)||null,assignmentDate:(o==null?void 0:o.fechaAsignacion)||null})}console.log("Sincronización completada:",a.length,"habitaciones")}catch(a){console.error("Error en sincronización:",a),a.message&&a.message.includes("403")&&(alert("Tu sesión ha expirado. Por favor, inicia sesión nuevamente."),location.href="./index.html")}}function x(e){if(!e)return null;const a=String(e).match(/^(\d+)-/);return a?parseInt(a[1],10):null}function we(e){const a=new Set;return e.forEach(t=>{const r=x(t.number);r!==null&&a.add(r)}),Array.from(a).sort((t,r)=>t-r)}function xe(e){let a=e;switch(n.currentFilter){case"myRooms":a=a.filter(t=>t.maidId===n.currentUserId);break;case"dirty":a=a.filter(t=>t.status==="Sucia"||t.status==="limpieza");break;case"clean":a=a.filter(t=>t.status==="Limpia"||t.status==="disponible");break;case"incident":a=a.filter(t=>t.status==="Bloqueada"||t.status==="mantenimiento");break}return n.selectedFloor!==null&&(a=a.filter(t=>x(t.number)===n.selectedFloor)),a}function _(){const e=[{id:"all",label:"Todas"},{id:"myRooms",label:"Asignadas a mí"},{id:"dirty",label:"Sucias"},{id:"clean",label:"Limpias"},{id:"incident",label:"Siniestro"}];j.innerHTML=e.map(a=>`
    <button
      class="filter-btn ${n.currentFilter===a.id?"active":""}"
      data-filter="${a.id}"
    >
      ${a.label}
    </button>
  `).join(""),j.querySelectorAll(".filter-btn").forEach(a=>{a.addEventListener("click",()=>{n.currentFilter=a.dataset.filter,_(),R()})})}function F(){const e=we(n.allRooms);e.forEach(t=>{n.allRooms.filter(r=>x(r.number)===t).length});const a=n.allRooms.filter(t=>x(t.number)===null).length;if(T.innerHTML="",e.forEach(t=>{const r=document.createElement("div");r.className=`floor-card ${n.selectedFloor===t?"selected":""}`,r.innerHTML=`
      <div class="floor-card-content">
        <div class="floor-label">Piso</div>
      </div>
      <div class="floor-number-badge">${t}</div>
    `,r.addEventListener("click",()=>{n.selectedFloor=n.selectedFloor===t?null:t,F(),R()}),T.appendChild(r)}),a>0){const t=document.createElement("div");t.className=`floor-card ${n.selectedFloor==="others"?"selected":""}`,t.innerHTML=`
      <div class="floor-card-content">
        <div class="floor-label">Piso</div>
      </div>
      <div class="floor-number-badge">Otros</div>
    `,t.addEventListener("click",()=>{n.selectedFloor=n.selectedFloor==="others"?null:"others",F(),R()}),T.appendChild(t)}}function R(){let e=xe(n.allRooms);if(n.selectedFloor==="others"&&(e=e.filter(a=>x(a.number)===null)),I.innerHTML="",e.length===0){I.innerHTML=`
      <div style="text-align: center; padding: 40px 20px; color: var(--color-text-light);">
        <i class="bi bi-inbox" style="font-size: 48px; opacity: 0.3; display: block; margin-bottom: 16px;"></i>
        <p style="font-size: 16px; font-weight: 600;">No hay habitaciones con este filtro</p>
      </div>
    `;return}e.forEach(a=>{const t=Se(a);I.appendChild(t)})}function Se(e){const a=document.createElement("div"),t=`status-${(e.status||"disponible").toLowerCase()}`;a.className=`room-card ${t}`,a.innerHTML=`
    <div class="room-card-left">
      <div class="room-icon">
        <i class="bi bi-door-closed"></i>
      </div>
      <div class="room-info">
        <div class="room-number">${e.number||e.id}</div>
        <div class="room-status">${e.status||"Disponible"}</div>
      </div>
    </div>
    <div class="room-card-right">
      <button class="room-action-btn btn-clean" title="Marcar como limpia" data-action="clean">
        <i class="bi bi-check-circle"></i>
      </button>
      <button class="room-action-btn btn-report" title="Reportar siniestro" data-action="report">
        <i class="bi bi-exclamation-triangle"></i>
      </button>
    </div>
  `;const r=a.querySelector('[data-action="clean"]'),o=a.querySelector('[data-action="report"]');return r.addEventListener("click",()=>Ce(e)),o.addEventListener("click",()=>Ee(e)),n.rearCameraAvailable===!1&&(o.disabled=!0),a}async function Ce(e){if(!e||!await Ae(e))return;const t=e.status,r=navigator.onLine;e.status=L.CLEAN,e.cleanedBy=n.currentUserId,e.cleanedAt=new Date().toISOString(),e._pendingSync=!r;try{if(await v("rooms",e),r)try{await le({id:e.id,number:e.number,status:se(L.CLEAN),userId:n.currentUserId}),e._pendingSync=!1,await v("rooms",e),console.log(`[Maid] Habitación ${e.number} marcada como limpia y sincronizada`)}catch(o){console.warn("[Maid] Error al sincronizar con backend, guardando en outbox:",o),await D({room_id:e.id,room_number:e.number,status:L.CLEAN,user_id:n.currentUserId}),alert(`✓ Habitación marcada como limpia.

⚠️ No se pudo sincronizar con el servidor.
Se guardó para sincronizar más tarde.`)}else console.log("[Maid] Sin conexión, guardando en outbox"),await D({room_id:e.id,room_number:e.number,status:L.CLEAN,user_id:n.currentUserId}),alert(`✓ Habitación marcada como limpia.

📱 Sin conexión a internet.
Se sincronizará automáticamente cuando la conexión se restablezca.`);await C()}catch(o){console.error("Error al actualizar habitación:",o),e.status=t,await v("rooms",e),alert("No se pudo actualizar la habitación: "+(o&&o.message))}}async function Ee(e){if(e){if(n.rearCameraAvailable===null&&(n.rearCameraAvailable=await q()),!n.rearCameraAvailable){alert("Función no habilitada en dispositivos sin cámara trasera");return}ge(e,n.currentUserId,async()=>{await C()})}}function Ae(e){return new Promise(a=>{const t=navigator.onLine,r=t?"":"⚠ Conexión: Sin internet",o=t?"#2e8b57":"#b8860b",s=document.createElement("div");s.className="modal show",s.style.display="flex",s.innerHTML=`
      <div class="modal-content" role="dialog">
        <h4 style="margin-bottom: 20px; color: var(--color-text);">Marcar habitación como limpia</h4>
        <p style="font-size: 1rem; margin: 16px 0; line-height: 1.6; color: #555;">
          ¿Estás seguro de que la habitación <strong style="color: var(--color-primary-dark);">${e.number||e.id}</strong> ha sido limpiada correctamente?
        </p>
        <div style="background: #f8f9fa; padding: 14px; border-left: 4px solid ${o}; border-radius: 6px; margin: 16px 0; font-size: 0.95rem;">
          <div style="color: ${o}; font-weight: 600;">
            ${r}
          </div>
          ${t?"":'<div style="color: #b8860b; margin-top: 8px; font-size: 0.9rem;">Los datos se sincronizarán automáticamente cuando haya conexión.</div>'}
        </div>
        <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 24px;">
          <button id="confirmNo" class="btn btn-sm btn-secondary">Cancelar</button>
          <button id="confirmYes" class="btn btn-sm btn-primary">Sí, está limpia</button>
        </div>
      </div>
    `,document.body.appendChild(s);const i=()=>{s.remove()};s.querySelector("#confirmNo").addEventListener("click",()=>{i(),a(!1)}),s.querySelector("#confirmYes").addEventListener("click",()=>{i(),a(!0)})})}async function C(){let e=await H("rooms").catch(()=>[])||[];if(e.length===0&&navigator.onLine&&(await z(),e=await H("rooms").catch(()=>[])||[]),e.length===0&&!navigator.onLine){n.allRooms=[],_(),T.innerHTML="",ie(I,"Sin conexión - No hay habitaciones disponibles offline");return}n.allRooms=e,_(),F(),R()}async function ke(){if(await Z(),!localStorage.getItem("authToken")){console.warn("No hay token de autenticación, redirigiendo al login..."),alert("Tu sesión ha expirado. Por favor, inicia sesión nuevamente."),location.href="./index.html";return}if(n.currentUserId=te(),!n.currentUserId){alert("No se pudo obtener la información del usuario. Por favor, inicia sesión nuevamente."),location.href="./index.html";return}const a=localStorage.getItem("username");ve.textContent=a||"Usuario",await ee();try{await re()}catch(t){console.error("[Maid] Error al limpiar IndexedDB:",t)}try{n.rearCameraAvailable=await q(),console.log("Cámara trasera disponible:",n.rearCameraAvailable)}catch(t){console.error("Error al detectar cámara:",t),n.rearCameraAvailable=!1}if(await z(),ye.addEventListener("click",()=>{window.confirm("¿Estás seguro de que deseas cerrar sesión?")&&(localStorage.clear(),location.href="./index.html")}),U.addEventListener("click",async()=>{if(n.rearCameraAvailable===null&&(n.rearCameraAvailable=await q()),!n.rearCameraAvailable){alert("El escaneo de QR requiere cámara trasera. Esta función no está disponible en tu dispositivo.");return}alert("Se va a solicitar acceso a la cámara para escanear el código QR de la habitación."),he(t=>{const r=n.allRooms.find(o=>String(o.number)===String(t)||String(o.id)===String(t));if(r){n.currentFilter="all";const o=x(r.number);n.selectedFloor=o,C(),setTimeout(()=>{const i=Array.from(document.querySelectorAll(".room-card")).find(c=>{const l=c.querySelector(".room-number");return l&&(l.textContent===String(r.number)||l.textContent===String(r.id))});i&&(i.scrollIntoView({behavior:"smooth",block:"center"}),i.style.boxShadow="0 0 0 4px var(--color-primary)",setTimeout(()=>{i.style.boxShadow=""},2e3))},300)}else alert(`No se encontró la habitación "${t}"`)},()=>{console.log("Escaneo cancelado")})}),n.rearCameraAvailable===!1&&(U.disabled=!0),oe(),ne(async()=>{console.log("[Maid] Conexión recuperada, sincronizando datos...");try{console.log("[Maid] Sincronizando outbox...");const t=await B();t.success>0&&console.log(`[Maid] ✅ ${t.success} operaciones sincronizadas exitosamente`),t.failed>0&&console.warn(`[Maid] ⚠️ ${t.failed} operaciones fallaron al sincronizar`)}catch(t){console.error("[Maid] Error al sincronizar outbox:",t)}await z(),await C()},()=>{console.log("[Maid] Conexión perdida, usando datos locales")}),navigator.onLine){console.log("[Maid] Hay conexión, intentando sincronizar operaciones pendientes...");try{const t=await B();t.success>0&&console.log(`[Maid] Se sincronizaron ${t.success} operaciones pendientes al iniciar`)}catch(t){console.warn("[Maid] Error al sincronizar operaciones pendientes:",t)}}await C()}ke();
