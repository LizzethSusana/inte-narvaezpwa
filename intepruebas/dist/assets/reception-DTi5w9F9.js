const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/idb-cleanup-DYMc0oMr.js","assets/sw-register-DeILLKBX.js"])))=>i.map(i=>d[i]);
import{A as fe}from"./constants-BVeJQJW2.js";import{g as b,p as f,r as Pe,a as be,b as T}from"./sw-register-DeILLKBX.js";import{g as Fe,d as O,M as ge,b as ze,r as _e,h as H,i as qe,j as De,k as He}from"./idb-cleanup-DYMc0oMr.js";const Oe="modulepreload",je=function(e){return"/"+e},G={},Ue=function(t,o,a){let n=Promise.resolve();if(o&&o.length>0){let l=function(i){return Promise.all(i.map(u=>Promise.resolve(u).then(m=>({status:"fulfilled",value:m}),m=>({status:"rejected",reason:m}))))};document.getElementsByTagName("link");const d=document.querySelector("meta[property=csp-nonce]"),r=(d==null?void 0:d.nonce)||(d==null?void 0:d.getAttribute("nonce"));n=l(o.map(i=>{if(i=je(i),i in G)return;G[i]=!0;const u=i.endsWith(".css"),m=u?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${i}"]${m}`))return;const p=document.createElement("link");if(p.rel=u?"stylesheet":Oe,u||(p.as="script"),p.crossOrigin="",p.href=i,r&&p.setAttribute("nonce",r),document.head.appendChild(p),u)return new Promise((w,z)=>{p.addEventListener("load",w),p.addEventListener("error",()=>z(new Error(`Unable to preload CSS for ${i}`)))})}))}function c(l){const d=new Event("vite:preloadError",{cancelable:!0});if(d.payload=l,window.dispatchEvent(d),!d.defaultPrevented)throw l}return n.then(l=>{for(const d of l||[])d.status==="rejected"&&c(d.reason);return t().catch(c)})};let y=null;function Je(e){y=e,y&&y.addEventListener("click",t=>{t.target===y&&h()}),document.addEventListener("keydown",t=>{t.key==="Escape"&&y&&!y.classList.contains("hidden")&&h()})}function F(){y&&(y.style.display="flex",y.classList.remove("hidden"))}function h(){y&&y.classList.add("hidden")}function k(){return y}function Ge(e,t=2){const o=String(e);return o.length>=t?o:"0".repeat(t-o.length)+o}const ye=fe;function j(){return localStorage.getItem("authToken")}function Ve(e){try{const t=e.split(".");if(t.length!==3)return null;const o=JSON.parse(atob(t[1]));return console.log("Token decodificado:",o),o}catch(t){return console.error("Error al decodificar token:",t),null}}async function g(e,t={}){const o=j(),a={"Content-Type":"application/json",...t.headers};o&&(a.Authorization=`Bearer ${o}`);const n=await fetch(`${ye}${e}`,{...t,headers:a});if(!n.ok){const c=await n.json().catch(()=>({}));throw new Error(c.message||`HTTP Error ${n.status}`)}return n.json()}async function C(){try{return(await g("/rooms")).data||[]}catch(e){throw console.error("Error al obtener habitaciones:",e),e}}async function he(e){try{return await g("/rooms",{method:"POST",body:JSON.stringify(e)})}catch(t){throw console.error("Error al crear habitación:",t),t}}async function We(e){try{return await g("/rooms/batch",{method:"POST",body:JSON.stringify(e)})}catch(t){throw console.error("Error al crear habitaciones en lote:",t),t}}async function Ke(e){console.log("=== updateRoom API ==="),console.log("Datos recibidos:",e),console.log("ID:",e.id,"Tipo:",typeof e.id);try{const t=await g("/rooms",{method:"PUT",body:JSON.stringify(e)});return console.log("Respuesta del backend:",t),t}catch(t){throw console.error("Error al actualizar habitación:",t),t}}async function Ye(e){var o;console.log("=== INICIO deleteRoom ==="),console.log("ID a eliminar:",e);const t=j();if(console.log("Token existe:",!!t),console.log("Token (primeros 20 chars):",t==null?void 0:t.substring(0,20)),t){const a=Ve(t);console.log("Usuario del token:",a==null?void 0:a.sub),console.log("Authorities en token:",a==null?void 0:a.authorities),console.log("Rol en authorities:",(o=a==null?void 0:a.authorities)==null?void 0:o.map(n=>n.authority||n))}else console.error("⚠️ NO HAY TOKEN - Esto causará 403");try{const a=await g("/rooms",{method:"DELETE",body:JSON.stringify({id:e})});return console.log("✅ Eliminación exitosa"),a}catch(a){throw console.error("❌ Error al eliminar habitación:",a),console.error("Detalles del error:",a.message),a}}async function Qe(){try{return(await g("/room-assignments")).data||[]}catch(e){throw console.error("Error al obtener asignaciones:",e),e}}async function U(e){try{return await g("/room-assignments",{method:"POST",body:JSON.stringify(e)})}catch(t){throw console.error("Error al crear asignación:",t),t}}async function Xe(e){try{return await g("/room-assignments",{method:"PUT",body:JSON.stringify(e)})}catch(t){throw console.error("Error al actualizar asignación:",t),t}}async function Ze(e){try{return await g("/room-assignments",{method:"DELETE",body:JSON.stringify({id:e})})}catch(t){throw console.error("Error al eliminar asignación:",t),t}}async function J(){try{return(await g("/user")).data||[]}catch(e){throw console.error("Error al obtener usuarios:",e),e}}async function et(e){try{return await g("/user",{method:"DELETE",body:JSON.stringify({id:e})})}catch(t){throw console.error(`Error al eliminar usuario ${e}:`,t),t}}async function tt(){try{return(await g("/reports")).data||[]}catch(e){throw console.error("Error al obtener reportes:",e),e}}async function at(e){try{const t=j(),o={};t&&(o.Authorization=`Bearer ${t}`);const a=new FormData;e.id&&a.append("id",e.id),e.title&&a.append("title",e.title),e.description&&a.append("description",e.description),e.user_id&&a.append("user_id",e.user_id),e.room_id&&a.append("room_id",e.room_id),e.active!==void 0&&a.append("active",e.active),e.photo1&&a.append("photo1",e.photo1),e.photo2&&a.append("photo2",e.photo2),e.photo3&&a.append("photo3",e.photo3);const n=await fetch(`${ye}/reports`,{method:"PUT",headers:o,body:a});if(!n.ok)throw new Error("Network error");return n.json()}catch(t){throw console.error("Error al actualizar reporte:",t),t}}async function ot(e){try{return await g("/reports",{method:"DELETE",body:JSON.stringify({id:e})})}catch(t){throw console.error(`Error al eliminar reporte ${e}:`,t),t}}async function nt(){try{let e=await b("maids").catch(()=>[])||[];e.length===0&&navigator.onLine&&(e=(await J().catch(()=>[])).filter(l=>{var d;return((d=l.rol)==null?void 0:d.id)===2}).map(l=>({id:l.id,fullname:l.fullname,username:l.username,active:l.active})));const t=new Map;for(const c of e){const l=c.id||c.email||c.username;if(!t.has(l))t.set(l,c);else{const d=t.get(l);typeof c.id=="number"&&typeof d.id!="number"&&t.set(l,c)}}const a=Array.from(t.values()).map(c=>{const l=c.id,d=c.name||c.fullname||c.username||c.email||"Sin nombre",r=c.active?"":"disabled";return`<option value="${l}" ${r}>${d}${c.active?"":" (Inactivo)"}</option>`}).join(""),n=k();F(),n.innerHTML=`
      <div class="modal-content" role="dialog">
        <h3>Nueva Habitación</h3>
        <label>Número de habitación</label>
        <input id="newRoomNumber" type="text" required placeholder="Ej: 101" />
        <label>Estado</label>
        <select id="newRoomStatus">
          <option value="limpia">Disponible</option>
          <option value="ocupada">Ocupada</option>
          <option value="sucia">Sucia</option>
        </select>
        <label>Asignar camarera (opcional)</label>
        <select id="newRoomMaid">
          <option value="">-- Sin asignar --</option>
          ${a}
        </select>
        <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 20px;">
          <button id="saveRoom" class="btn btn-sm btn-primary">Guardar</button>
          <button id="closeModal" class="btn btn-sm btn-secondary">Cerrar</button>
        </div>
      </div>`,document.getElementById("closeModal").onclick=()=>h(),document.getElementById("saveRoom").onclick=async()=>{var r;const c=document.getElementById("newRoomNumber").value.trim(),l=document.getElementById("newRoomStatus").value,d=document.getElementById("newRoomMaid").value;if(!c){alert("El número de habitación es requerido");return}try{const i={number:c,status:O(l||"limpia")},u=await he(i);let m=(r=u==null?void 0:u.data)==null?void 0:r.id;if(!m){const w=(await C().catch(()=>[])).find(z=>z.number===c);m=(w==null?void 0:w.id)||null}d&&m&&await U({room:{id:m},user:{id:parseInt(d)}}),await f("rooms",{id:m||c,number:c,status:l,maid:d||null}),alert("Habitación creada exitosamente"),h(),location.reload()}catch(i){console.error("Error al crear habitación:",i),alert("Error al crear habitación: "+i.message)}}}catch(e){console.error("Error al abrir modal:",e),alert("Error al cargar usuarios")}}async function ve(e){try{let t=await b("maids").catch(()=>[])||[];t.length===0&&navigator.onLine&&(t=(await J().catch(()=>[])).filter(i=>{var u;return((u=i.rol)==null?void 0:u.id)===2}).map(i=>({id:i.id,fullname:i.fullname,username:i.username,active:i.active})));const o=new Map;for(const r of t){const i=r.id||r.email||r.username;if(!o.has(i))o.set(i,r);else{const u=o.get(i);typeof r.id=="number"&&typeof u.id!="number"&&o.set(i,r)}}const n=Array.from(o.values()).map(r=>{const i=r.id,u=r.name||r.fullname||r.username||r.email||"Sin nombre",m=e.maid&&String(e.maid)===String(i)?"selected":"",p=r.active?"":"disabled";return`<option value="${i}" ${m} ${p}>${u}${r.active?"":" (Inactivo)"}</option>`}).join(""),c=k();F(),c.innerHTML=`
      <div class="modal-content" role="dialog">
        <h3>Editar Habitación ${e.number||e.id}</h3>
        <label>Número de habitación</label>
        <input id="editRoomNumber" type="text" value="${e.number||""}" required />
        <label>Estado</label>
        <select id="editRoomStatus">
          <option value="limpia">Disponible</option>
          <option value="ocupada">Ocupada</option>
          <option value="sucia">Sucia</option>
          <option value="bloqueada">Bloqueada</option>
        </select>
        <label>Asignar camarera (opcional)</label>
        <select id="editRoomMaid">
          <option value="">-- Sin asignar --</option>
          ${n}
        </select>
        <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 20px;">
          <button id="saveEditRoom" class="btn btn-sm btn-primary">Guardar</button>
          <button id="closeModal" class="btn btn-sm btn-secondary">Cerrar</button>
        </div>
      </div>`;const l=document.getElementById("editRoomStatus");l&&(l.value=e.status||"limpia");const d=document.getElementById("editRoomMaid");d&&(d.value=e.maid?String(e.maid):""),document.getElementById("closeModal").onclick=()=>h(),document.getElementById("saveEditRoom").onclick=async()=>{const r=document.getElementById("editRoomNumber").value.trim(),i=document.getElementById("editRoomStatus").value,u=document.getElementById("editRoomMaid").value||null;if(!r){alert("El número de habitación es requerido");return}if(console.log("=== EDITAR HABITACIÓN ==="),console.log("Habitación original:",e),console.log("Room ID:",e.id,"Tipo:",typeof e.id),!e.id||typeof e.id!="number"){alert("Error: La habitación no tiene un ID válido. No se puede actualizar."),console.error("ID inválido:",e.id);return}try{const m=Fe(),p={id:e.id,number:r,status:O(i),userId:m};console.log("Datos a enviar al backend:",p),await Ke(p),u&&u!==e.maid&&await U({room:{id:e.id},user:{id:parseInt(u)}}),await f("rooms",{...e,number:r,status:i,maid:u}),alert("Habitación actualizada exitosamente"),h(),location.reload()}catch(m){console.error("Error al actualizar habitación:",m),alert("Error al actualizar habitación: "+m.message)}}}catch(t){console.error("Error al abrir modal:",t),alert("Error al cargar usuarios")}}async function Ee(e,t){var r;let o=[],a=[];navigator.onLine&&(o=await C().catch(()=>[])),a=await b("rooms").catch(()=>[])||[];const n=new Map;for(const i of o)n.set(i.number||i.id,i);for(const i of a){const u=i.number||i.id;n.has(u)||n.set(u,i)}const c=new Set(n.keys()),l=[];for(let i=1;i<=e;i++)for(let u=1;u<=t;u++){const m=`${i}-${Ge(u)}`;c.has(m)||l.push({number:m,status:O("limpia")})}let d=0;if(l.length>0&&navigator.onLine)try{console.log(`Creando ${l.length} habitaciones en lote...`);const i=await We(l);console.log("Respuesta del batch:",i);const u=await C().catch(()=>[]);for(const m of l){const p=u.find(w=>w.number===m.number);p&&(await f("rooms",{id:p.id,number:p.number,status:p.status,maid:null,rented:!1}),d++)}}catch(i){console.warn("No se pudo crear en lote en el backend, creando individualmente:",i);for(const u of l)try{const m=await he(u),p=((r=m==null?void 0:m.data)==null?void 0:r.id)||null;await f("rooms",{id:p||u.number,number:u.number,status:u.status,maid:null,rented:!1}),d++}catch(m){console.warn(`No se pudo crear habitación ${u.number}:`,m)}}else if(l.length>0)for(const i of l)await f("rooms",{id:i.number,number:i.number,status:i.status,maid:null,rented:!1}),d++;return console.log(`ensureRoomsFromLayout: ${d} habitaciones nuevas creadas`),d}const it=fe;function rt(){return localStorage.getItem("authToken")}async function we(e,t={}){const o=rt(),a={"Content-Type":"application/json",...t.headers};o&&(a.Authorization=`Bearer ${o}`);const n=await fetch(`${it}${e}`,{...t,headers:a}),c=await n.json().catch(()=>({}));if(!n.ok||c.error){const l=c.message||`HTTP ${n.status}`;throw new Error(l)}return c}async function st({fullname:e,username:t,password:o}){return we("/auth/register",{method:"POST",body:JSON.stringify({fullname:e,username:t,password:o,active:!0,rol:{id:2}})})}async function lt({id:e,fullname:t,username:o,password:a,active:n}){return we("/user",{method:"PUT",body:JSON.stringify({id:e,fullname:t,username:o,password:a,active:n})})}async function ct(){const e=k();F(),e.innerHTML=`
    <div class="modal-content" role="dialog">
      <h3>Nueva Camarera</h3>
      <label for="maidName">Nombre</label>
      <input id="maidName" required/>
      <label for="maidEmail">Correo</label>
      <input id="maidEmail" type="email" required/>
      <label for="maidPassword">Contraseña</label>
      <div style="position: relative;">
        <input id="maidPassword" type="password" autocomplete="new-password" autocorrect="off" autocapitalize="off" spellcheck="false" style="padding-right: 40px;" />
        <button id="pwdToggle" type="button" style="position: absolute; right: 8px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; font-size: 1.2rem; color: #666; padding: 4px 8px;" title="Mostrar/Ocultar contraseña">
          <i class="bi bi-eye-slash" id="pwdEye"></i>
        </button>
      </div>
      <label for="maidStatus">Estado</label>
      <select id="maidStatus"><option value="Disponible">Disponible</option><option value="No disponible">No disponible</option></select>
      <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 20px;">
        <button id="saveMaid" class="btn btn-sm btn-primary">Guardar</button>
        <button id="closeModal" class="btn btn-sm btn-secondary">Cerrar</button>
      </div>
    </div>`,xe("pwdToggle","maidPassword","pwdEye"),Re("maidPassword"),document.getElementById("closeModal").onclick=()=>h(),document.getElementById("saveMaid").onclick=async()=>{const t=document.getElementById("maidName").value.trim(),o=document.getElementById("maidEmail").value.trim(),a=document.getElementById("maidPassword").value.trim();if(document.getElementById("maidStatus").value||ge.AVAILABLE,!o||!t)return alert("Nombre y correo requeridos");if(!a)return alert("La contraseña es requerida");try{const n=await st({fullname:t,username:o,password:a});alert("Camarera creada exitosamente"),h(),location.reload()}catch(n){console.error("Error al crear camarera:",n),alert("No se pudo crear la camarera: "+n.message)}}}async function Ie(e){const t=k();F(),t.innerHTML=`
    <div class="modal-content" role="dialog">
      <h3>Editar Camarera</h3>

      <label>Nombre</label>
      <input id="editMaidName" value="${e.name||""}" required/>

      <label>Correo</label>
      <input id="editMaidEmail" type="email"
             value="${e.email||e.id||""}" required/>

      <label for="editMaidPassword">Nueva Contraseña (opcional)</label>
      <div style="position: relative;">
        <input id="editMaidPassword" type="password" placeholder="Nueva contraseña" autocomplete="new-password" autocorrect="off" autocapitalize="off" spellcheck="false" style="padding-right: 40px;"/>
        <button id="editPwdToggle" type="button" style="position: absolute; right: 8px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; font-size: 1.2rem; color: #666; padding: 4px 8px;" title="Mostrar/Ocultar contraseña">
          <i class="bi bi-eye-slash" id="editPwdEye"></i>
        </button>
      </div>

      <label>Estado</label>
      <select id="editMaidStatus">
        <option value="Disponible">Disponible</option>
        <option value="No disponible">No disponible</option>
        <option value="Ocupado">Ocupado</option>
      </select>

      <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 20px;">
        <button id="saveEditMaid" class="btn btn-sm btn-primary">Guardar</button>
        <button id="closeModal" class="btn btn-sm btn-secondary">Cerrar</button>
      </div>
    </div>`;const o=document.getElementById("editMaidStatus");o.value=e.status||ge.AVAILABLE,xe("editPwdToggle","editMaidPassword","editPwdEye"),Re("editMaidPassword"),document.getElementById("closeModal").onclick=()=>h(),document.getElementById("saveEditMaid").onclick=async()=>{const a=document.getElementById("editMaidName").value.trim(),n=document.getElementById("editMaidEmail").value.trim(),c=document.getElementById("editMaidPassword").value.trim(),l=document.getElementById("editMaidStatus").value;if(!a||!n)return alert("Nombre y correo requeridos");try{const d={id:e.id,fullname:a,username:n,active:e.active!==!1};c&&(d.password=c),console.log("Actualizando camarera en backend:",d),await lt(d);const r={id:e.id,name:a,email:n,status:l,active:d.active};if(await f("maids",r),n!==(e.email||e.username)){const i=await b("rooms").catch(()=>[]);for(const u of i)u.maid===e.id&&(u.maid=e.id,await f("rooms",u))}alert("Camarera actualizada exitosamente"),h(),location.reload()}catch(d){console.error("Error al actualizar camarera:",d),alert("No se pudo actualizar la camarera: "+d.message)}}}function xe(e,t,o){const a=document.getElementById(t),n=document.getElementById(e),c=document.getElementById(o);n&&a&&c&&(n.onclick=l=>{l.preventDefault(),l.stopPropagation();const d=a.type==="password";a.type=d?"text":"password",c.className=d?"bi bi-eye":"bi bi-eye-slash",a.focus()})}function Re(e){const t=document.getElementById(e);t&&t.addEventListener("click",()=>{t.focus()})}function Se(e,t){var u;const o=e.createdAt?new Date(e.createdAt).toLocaleString():"—",a=((u=e.room)==null?void 0:u.number)||e.roomId||e.room_id||"—",n=ut(e,t),c=k();c.classList.remove("hidden"),c.innerHTML=`<div class="modal-content" role="dialog" style="max-width: 600px;">
    <h3 style="color: var(--primary-dark); margin-bottom: 20px;">Detalle del Reporte</h3>
    
    <div style="background: #f8f9fc; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
      <div style="display: grid; grid-template-columns: 120px 1fr; gap: 12px; font-size: 0.95rem;">
        <div style="font-weight: 600; color: #555;">Fecha:</div>
        <div>${o}</div>
        
        <div style="font-weight: 600; color: #555;">Habitación:</div>
        <div style="font-weight: 600; color: var(--primary);">${a}</div>
        
        <div style="font-weight: 600; color: #555;">Camarera:</div>
        <div>${n}</div>
        
        <div style="font-weight: 600; color: #555;">Tema:</div>
        <div style="font-weight: 600; color: #d9534f;">${e.title||e.subject||"—"}</div>
      </div>
    </div>

    <div style="margin-bottom: 16px;">
      <h4 style="font-size: 1rem; color: #555; margin-bottom: 8px;">Descripción:</h4>
      <div style="background: #fff; border: 1px solid #e3e8ef; padding: 12px; border-radius: 6px; white-space: pre-wrap; line-height: 1.6;">
        ${e.description||"(sin descripción)"}
      </div>
    </div>

    <div style="margin-bottom: 20px;">
      <h4 style="font-size: 1rem; color: #555; margin-bottom: 8px;">Imágenes:</h4>
      <div id="reportImages" style="display:flex; gap:12px; flex-wrap:wrap;">
      </div>
    </div>

    <div style="display: flex; justify-content: flex-end;">
      <button id="closeModalReport" class="btn btn-sm btn-secondary">Cerrar</button>
    </div>
  </div>`;const l=document.getElementById("reportImages"),d=[];e.photo1&&d.push(_(e.photo1)),e.photo2&&d.push(_(e.photo2)),e.photo3&&d.push(_(e.photo3));const r=e.images||[],i=d.length>0?d:r;if(i&&i.length)i.forEach(m=>{const p=dt(m,i);l.appendChild(p)});else{const m=document.createElement("div");m.style.color="#999",m.style.fontStyle="italic",m.textContent="No hay imágenes adjuntas",l.appendChild(m)}document.getElementById("closeModalReport").onclick=()=>h()}function dt(e,t){const o=document.createElement("div");o.style.width="120px",o.style.height="120px",o.style.border="2px solid #ddd",o.style.borderRadius="8px",o.style.overflow="hidden",o.style.cursor="pointer",o.style.transition="transform 0.2s, border-color 0.2s",o.onmouseenter=()=>{o.style.transform="scale(1.05)",o.style.borderColor="var(--primary)"},o.onmouseleave=()=>{o.style.transform="scale(1)",o.style.borderColor="#ddd"};const a=document.createElement("img");return a.src=e,a.style.width="100%",a.style.height="100%",a.style.objectFit="cover",o.appendChild(a),o.onclick=()=>{window.openImagesModal&&window.openImagesModal(t)},o}function _(e){return e?e.startsWith("http")||e.startsWith("data:")?e:`https://drp1k7c3-8081.usw3.devtunnels.ms${e}`:""}function ut(e,t){if(e.user)return e.user.fullname||e.user.username||e.user.id||"—";const o=e.user_id||e.maidId;if(o){const a=t.find(n=>n.id===o||(n.id||n.email)===o);return a?a.name||a.fullname||a.email||a.id:o}if(e.createdBy&&e.createdBy!=="recepcion"){const a=t.find(n=>(n.id||n.email)===e.createdBy);return a?a.name||a.fullname||a.email||a.id:e.createdBy}return Array.isArray(e.maids)&&e.maids.length?e.maids.map(a=>{const n=t.find(c=>(c.id||c.email)===a);return n?n.name||n.fullname||n.email||n.id:a}).join(", "):e.createdBy||"—"}const s={currentSection:"rooms",allRooms:[],allMaids:[],allReports:[],allAssignments:[],currentFloor:"all",layoutSettings:null,searchTerm:"",statusFilter:"",maidFilter:"",maidStatusFilter:"",reportRoomFilter:"",reportMaidFilter:"",reportStatusFilter:""},mt=document.getElementById("modal"),Le=document.querySelectorAll(".sidebar-item[data-section]"),Me=document.querySelectorAll(".mobile-menu-item[data-section]"),V=document.getElementById("hamburgerBtn"),$e=document.getElementById("mobileMenu"),W=document.getElementById("logoutBtn"),K=document.getElementById("mobileLogoutBtn"),pt=document.getElementById("sectionTitle"),ft=document.getElementById("mobileTitle"),bt=document.getElementById("btnCreate"),Y=document.getElementById("section-rooms"),Q=document.getElementById("section-maids"),X=document.getElementById("section-reports"),q=document.getElementById("floorFilters"),Z=document.getElementById("searchRooms"),ee=document.getElementById("filterStatus"),S=document.getElementById("filterMaid"),L=document.getElementById("layoutFloors"),M=document.getElementById("layoutRooms"),te=document.getElementById("btnGenerateRooms"),I=document.getElementById("layoutStatus"),ae=document.getElementById("roomsTableBody"),oe=document.getElementById("roomsCards");document.getElementById("roomsPager");const ne=document.getElementById("searchMaids"),ie=document.getElementById("filterMaidStatus"),re=document.getElementById("maidsTableBody"),se=document.getElementById("maidsCards");document.getElementById("maidsPager");const le=document.getElementById("searchReports"),$=document.getElementById("filterReportRoom"),B=document.getElementById("filterReportMaid"),ce=document.getElementById("filterReportStatus"),de=document.getElementById("reportsTableBody"),ue=document.getElementById("reportsCards");document.getElementById("reportsPager");Je(mt);function me(e){return{disponible:{text:"Limpia",className:"disponible"},ocupada:{text:"Ocupada",className:"ocupada"},limpieza:{text:"Sucia",className:"limpieza"},mantenimiento:{text:"Bloqueada",className:"mantenimiento"}}[e]||{text:"Limpia",className:"disponible"}}function A(e){s.currentSection=e,Le.forEach(t=>{t.dataset.section===e?t.classList.add("active"):t.classList.remove("active")}),Me.forEach(t=>{t.dataset.section===e?t.classList.add("active"):t.classList.remove("active")}),Y.classList.remove("active"),Q.classList.remove("active"),X.classList.remove("active"),e==="rooms"?(Y.classList.add("active"),D("Habitaciones"),pe("Nueva Habitación","bi-plus-circle",()=>nt()),v()):e==="maids"?(Q.classList.add("active"),D("Camareras"),pe("Nueva Camarera","bi-person-plus",()=>ct()),R()):e==="reports"&&(X.classList.add("active"),D("Reportes"),bt.style.display="none",E())}function D(e){pt.textContent=e,ft.textContent=e}function pe(e,t,o){const a=document.getElementById("btnCreate");if(!a)return;a.innerHTML=`<i class="bi ${t}"></i><span>${e}</span>`,a.style.display="flex";const n=a.cloneNode(!0);a.parentNode.replaceChild(n,a),n.addEventListener("click",o)}Le.forEach(e=>{e.addEventListener("click",()=>{A(e.dataset.section)})});Me.forEach(e=>{e.addEventListener("click",()=>{A(e.dataset.section),$e.classList.remove("open")})});V&&V.addEventListener("click",()=>{$e.classList.toggle("open")});const Be=()=>{confirm("¿Estás seguro de que deseas cerrar sesión?")&&(localStorage.clear(),window.location.href="./index.html")};W&&W.addEventListener("click",Be);K&&K.addEventListener("click",Be);async function Te(){try{const e=await b("rooms").catch(()=>[])||[],t=new Map;for(const a of e){const n=a.number||a.id;t.has(n)||t.set(n,[]),t.get(n).push(a)}let o=0;for(const[a,n]of t.entries())if(n.length>1){n.sort((l,d)=>{const r=typeof l.id=="number",i=typeof d.id=="number";return r&&!i?-1:!r&&i?1:0});const c=n[0];for(let l=1;l<n.length;l++)await T("rooms",n[l].id),o++}o>0&&console.log(`${o} habitaciones duplicadas eliminadas`)}catch(e){console.error("Error al limpiar duplicados:",e)}}async function ke(){try{const e=await b("maids").catch(()=>[]),t=new Map;for(const a of e){const n=a.id||a.email;t.has(n)||t.set(n,[]),t.get(n).push(a)}let o=0;for(const[a,n]of t.entries())if(n.length>1){n.sort((l,d)=>{const r=typeof l.id=="number",i=typeof d.id=="number";return r&&!i?-1:!r&&i?1:0});const c=n[0];for(let l=1;l<n.length;l++)await T("maids",n[l].id||n[l].email),o++}o>0&&console.log(`${o} camareras duplicadas eliminadas`)}catch(e){console.error("Error al limpiar camareras duplicadas:",e)}}async function N(){if(!navigator.onLine){console.log("Sin conexión - usando datos locales");return}try{const e=await C(),t=await b("rooms").catch(()=>[])||[],o=new Map(t.map(r=>[r.number||r.id,r]));for(const r of e){const i=o.get(r.number);await f("rooms",{id:r.id,number:r.number,status:qe(r.status),maid:(i==null?void 0:i.maid)||null,rented:(i==null?void 0:i.rented)||!1})}await Te();const n=(await J()).filter(r=>{var i;return((i=r.rol)==null?void 0:i.id)===2}),c=new Map;for(const r of n)c.has(r.id)||c.set(r.id,{id:r.id,name:r.fullname,email:r.username,active:r.active});for(const r of c.values())await f("maids",r);await ke();const l=await Qe();s.allAssignments=l;for(const r of l)if(r.room&&r.user){const i=await be("rooms",r.room.id);i&&(i.maid=r.user.id,await f("rooms",i))}const d=await tt();for(const r of d)await f("reports",{_id:`report_${r.id}`,id:r.id,title:r.title,description:r.description,photo1:r.photo1,photo2:r.photo2,photo3:r.photo3,room:r.room,user:r.user,active:r.active,status:H(r.active),createdAt:new Date().toISOString(),_synced:!0});console.log("Datos sincronizados correctamente")}catch(e){console.error("Error al sincronizar datos:",e)}}async function x(){try{await Te(),await ke();let e=await b("rooms").catch(()=>[])||[],t=await b("maids").catch(()=>[])||[],o=await b("reports").catch(()=>[])||[];navigator.onLine&&(await N(),e=await b("rooms").catch(()=>[])||[],t=await b("maids").catch(()=>[])||[],o=await b("reports").catch(()=>[])||[]),s.allRooms=e,s.allMaids=t,s.allReports=o,console.log("Datos cargados:",{rooms:e.length,maids:t.length,reports:o.length})}catch(e){console.error("Error al cargar datos:",e)}}function P(e){if(!e)return null;const t=String(e).match(/^(\d+)-/);return t?parseInt(t[1],10):null}function gt(){const e=new Set;return s.allRooms.forEach(t=>{const o=P(t.number);o!==null&&e.add(o)}),Array.from(e).sort((t,o)=>t-o)}function yt(){const e=gt(),t=s.allRooms.filter(a=>P(a.number)===null).length;let o='<button class="floor-btn active" data-floor="all">Todos</button>';e.forEach(a=>{o+=`<button class="floor-btn" data-floor="${a}">Piso ${a}</button>`}),t>0&&(o+='<button class="floor-btn" data-floor="others">Otros</button>'),q.innerHTML=o,q.querySelectorAll(".floor-btn").forEach(a=>{a.addEventListener("click",()=>{s.currentFloor=a.dataset.floor,q.querySelectorAll(".floor-btn").forEach(n=>n.classList.remove("active")),a.classList.add("active"),v()})})}function ht(){let e=s.allRooms;if(s.currentFloor!=="all")if(s.currentFloor==="others")e=e.filter(t=>P(t.number)===null);else{const t=parseInt(s.currentFloor,10);e=e.filter(o=>P(o.number)===t)}if(s.searchTerm){const t=s.searchTerm.toLowerCase();e=e.filter(o=>{const a=(o.number||o.id||"").toString().toLowerCase(),n=(o.status||"").toLowerCase();return a.includes(t)||n.includes(t)})}if(s.statusFilter&&(e=e.filter(t=>t.status===s.statusFilter)),s.maidFilter){const t=parseInt(s.maidFilter,10);e=e.filter(o=>o.maid===t)}return e}async function v(){yt(),vt();const e=ht();ae.innerHTML="",e.forEach(t=>{const o=me(t.status),a=document.createElement("tr");a.innerHTML=`
      <td><strong>${t.number||t.id}</strong></td>
      <td><span class="status-badge ${o.className}">${o.text}</span></td>
      <td>
        <select class="maid-select" data-room-id="${t.id}">
          <option value="">Sin asignar</option>
          ${s.allMaids.map(n=>`
            <option value="${n.id}" ${t.maid===n.id?"selected":""}>
              ${n.name||n.email}
            </option>
          `).join("")}
        </select>
      </td>
      <td>
        <div class="action-btns">
          <button class="action-btn btn-edit" data-room-id="${t.id}" title="Editar">
            <i class="bi bi-pencil"></i>
          </button>
          <button class="action-btn btn-delete" data-room-id="${t.id}" title="Eliminar">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </td>
    `,ae.appendChild(a)}),oe.innerHTML="",e.forEach(t=>{const o=me(t.status),a=document.createElement("div");a.className="data-card",a.innerHTML=`
      <div class="card-header">
        <div class="card-title">${t.number||t.id}</div>
        <button class="card-menu-btn" data-room-id="${t.id}">
          <i class="bi bi-three-dots-vertical"></i>
        </button>
      </div>
      <div class="card-body">
        <div class="card-icon">
          <i class="bi bi-door-closed"></i>
        </div>
        <div class="card-info">
          <div class="card-info-row">
            <span class="card-label">Estado</span>
            <span class="status-badge ${o.className}">${o.text}</span>
          </div>
          <div class="card-info-row">
            <span class="card-label">Camarera Asignada</span>
            <select class="maid-select" data-room-id="${t.id}">
              <option value="">Sin asignar</option>
              ${s.allMaids.map(n=>`
                <option value="${n.id}" ${t.maid===n.id?"selected":""}>
                  ${n.name||n.email}
                </option>
              `).join("")}
            </select>
          </div>
        </div>
      </div>
    `,oe.appendChild(a)}),document.querySelectorAll(".maid-select").forEach(t=>{t.addEventListener("change",async o=>{const a=parseInt(o.target.dataset.roomId,10),n=o.target.value?parseInt(o.target.value,10):null;await Et(a,n)})}),document.querySelectorAll(".action-btn.btn-edit").forEach(t=>{t.addEventListener("click",()=>{const o=parseInt(t.dataset.roomId,10),a=s.allRooms.find(n=>n.id===o);a&&ve(a)})}),document.querySelectorAll(".action-btn.btn-delete").forEach(t=>{t.addEventListener("click",async()=>{const o=parseInt(t.dataset.roomId,10);confirm("¿Estás seguro de eliminar esta habitación?")&&await Ce(o)})}),document.querySelectorAll(".card-menu-btn").forEach(t=>{t.addEventListener("click",()=>{const o=parseInt(t.dataset.roomId,10),a=s.allRooms.find(n=>n.id===o);a&&wt(a,t)})})}function vt(){S&&(S.innerHTML='<option value="">Camarera</option>',s.allMaids.forEach(e=>{S.innerHTML+=`<option value="${e.id}">${e.name||e.email}</option>`}))}async function Et(e,t){try{const o=s.allRooms.find(n=>n.id===e);if(!o)return;o.maid=t,await f("rooms",o);const a=s.allAssignments.find(n=>{var c;return((c=n.room)==null?void 0:c.id)===e});navigator.onLine?(t?a?await Xe(a.id,{userId:t,roomId:e}):await U({room:{id:e},user:{id:parseInt(t,10)}}):a&&await Ze(a.id),await N(),await x()):(console.log("[Reception] Sin conexión, guardando asignación en outbox"),await De({room_id:e,maid_id:t,assignment_id:(a==null?void 0:a.id)||null}),alert("Sin conexión. La asignación se sincronizará cuando se restablezca la conexión.")),v()}catch(o){console.error("Error al asignar camarera:",o),alert("No se pudo asignar la camarera")}}async function Ce(e){try{await T("rooms",e),navigator.onLine&&await Ye(e),s.allRooms=s.allRooms.filter(t=>t.id!==e),v()}catch(t){console.error("Error al eliminar habitación:",t),alert("No se pudo eliminar la habitación")}}function wt(e,t){const o=t.getBoundingClientRect(),a=document.createElement("div");a.style.position="fixed",a.style.top=`${o.bottom+5}px`,a.style.right="20px",a.style.background="white",a.style.borderRadius="12px",a.style.boxShadow="var(--shadow-lg)",a.style.zIndex="1000",a.style.minWidth="150px",a.innerHTML=`
    <button style="display:flex;align-items:center;gap:8px;width:100%;padding:12px 16px;border:none;background:transparent;cursor:pointer;font-size:15px;font-weight:600;" id="menuEdit">
      <i class="bi bi-pencil" style="color:var(--color-info);"></i> Editar
    </button>
    <button style="display:flex;align-items:center;gap:8px;width:100%;padding:12px 16px;border:none;background:transparent;cursor:pointer;font-size:15px;font-weight:600;" id="menuDelete">
      <i class="bi bi-trash" style="color:var(--color-danger);"></i> Eliminar
    </button>
  `,document.body.appendChild(a);const n=()=>a.remove();document.getElementById("menuEdit").onclick=()=>{n(),ve(e)},document.getElementById("menuDelete").onclick=async()=>{n(),confirm("¿Estás seguro de eliminar esta habitación?")&&await Ce(e.id)},setTimeout(()=>{document.addEventListener("click",n,{once:!0})},100)}Z&&Z.addEventListener("input",e=>{s.searchTerm=e.target.value,v()});ee&&ee.addEventListener("change",e=>{s.statusFilter=e.target.value,v()});S&&S.addEventListener("change",e=>{s.maidFilter=e.target.value,v()});async function It(){try{const e=await be("settings","hotelLayout");e&&(s.layoutSettings=e,L&&(L.value=e.floors),M&&(M.value=e.roomsPerFloor),I&&(I.textContent=`${e.floors} pisos × ${e.roomsPerFloor} hab.`))}catch(e){console.warn("No se pudo cargar layout",e)}}async function xt(e,t){s.layoutSettings={key:"hotelLayout",floors:e,roomsPerFloor:t,updatedAt:new Date().toISOString()},await f("settings",s.layoutSettings)}te&&te.addEventListener("click",async()=>{const e=parseInt((L==null?void 0:L.value)||"0",10),t=parseInt((M==null?void 0:M.value)||"0",10);if(!e||e<1)return alert("Ingresa el número de pisos");if(!t||t<1)return alert("Ingresa habitaciones por piso");if(confirm(`¿Generar ${e*t} habitaciones (${e} pisos × ${t})?`)){I&&(I.textContent="Generando..."),await xt(e,t);const a=await Ee(e,t);I&&(I.textContent=`${e} pisos × ${t} hab. (${a} nuevas)`),await x(),v()}});function Rt(){let e=s.allMaids;if(s.searchTerm){const t=s.searchTerm.toLowerCase();e=e.filter(o=>{const a=(o.name||"").toLowerCase(),n=(o.email||"").toLowerCase();return a.includes(t)||n.includes(t)})}return s.maidStatusFilter&&(e=e.filter(t=>{const o=t.active!==!1;return s.maidStatusFilter==="disponible"?o:s.maidStatusFilter==="no disponible"?!o:!0})),e}function R(){const e=Rt();re.innerHTML="",e.forEach(t=>{const o=document.createElement("tr"),a=t.active!==!1?"Disponible":"No Disponible",n=t.active!==!1?"disponible":"mantenimiento";o.innerHTML=`
      <td><strong>${t.name||t.email}</strong></td>
      <td>${t.email||""}</td>
      <td><span class="status-badge ${n}">${a}</span></td>
      <td>
        <div class="action-btns">
          <button class="action-btn btn-edit" data-maid-id="${t.id}" title="Editar">
            <i class="bi bi-pencil"></i>
          </button>
          <button class="action-btn btn-delete" data-maid-id="${t.id}" title="Eliminar">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </td>
    `,re.appendChild(o)}),se.innerHTML="",e.forEach(t=>{const o=t.active!==!1?"Disponible":"No Disponible",a=t.active!==!1?"disponible":"mantenimiento",n=document.createElement("div");n.className="data-card",n.innerHTML=`
      <div class="card-header">
        <div class="card-title">${t.name||t.email}</div>
        <button class="card-menu-btn" data-maid-id="${t.id}">
          <i class="bi bi-three-dots-vertical"></i>
        </button>
      </div>
      <div class="card-body">
        <div class="card-icon">
          <i class="bi bi-person"></i>
        </div>
        <div class="card-info">
          <div class="card-info-row">
            <span class="card-label">Email</span>
            <span class="card-value">${t.email||""}</span>
          </div>
          <div class="card-info-row">
            <span class="card-label">Estado</span>
            <span class="status-badge ${a}">${o}</span>
          </div>
        </div>
      </div>
    `,se.appendChild(n)}),document.querySelectorAll(".action-btn.btn-edit[data-maid-id]").forEach(t=>{t.addEventListener("click",()=>{const o=parseInt(t.dataset.maidId,10),a=s.allMaids.find(n=>n.id===o);a&&Ie(a)})}),document.querySelectorAll(".action-btn.btn-delete[data-maid-id]").forEach(t=>{t.addEventListener("click",async()=>{const o=parseInt(t.dataset.maidId,10),a=s.allMaids.find(n=>n.id===o);a&&confirm(`¿Estás seguro de que deseas eliminar a ${a.name||a.email}?`)&&await Ae(o)})}),document.querySelectorAll(".card-menu-btn[data-maid-id]").forEach(t=>{t.addEventListener("click",()=>{const o=parseInt(t.dataset.maidId,10),a=s.allMaids.find(n=>n.id===o);a&&St(a,t)})})}async function Ae(e){try{await T("maids",e),navigator.onLine&&await et(e),s.allMaids=s.allMaids.filter(t=>t.id!==e),R(),alert("Camarera eliminada exitosamente")}catch(t){console.error("Error al eliminar camarera:",t),alert("No se pudo eliminar la camarera")}}function St(e,t){const o=t.getBoundingClientRect(),a=document.createElement("div");a.style.position="fixed",a.style.top=`${o.bottom+5}px`,a.style.right="20px",a.style.background="white",a.style.borderRadius="12px",a.style.boxShadow="var(--shadow-lg)",a.style.zIndex="1000",a.style.minWidth="150px",a.innerHTML=`
    <button style="display:flex;align-items:center;gap:8px;width:100%;padding:12px 16px;border:none;background:transparent;cursor:pointer;font-size:15px;font-weight:600;" id="menuEdit">
      <i class="bi bi-pencil" style="color:var(--color-info);"></i> Editar
    </button>
    <button style="display:flex;align-items:center;gap:8px;width:100%;padding:12px 16px;border:none;background:transparent;cursor:pointer;font-size:15px;font-weight:600;" id="menuDelete">
      <i class="bi bi-trash" style="color:var(--color-danger);"></i> Eliminar
    </button>
  `,document.body.appendChild(a);const n=()=>a.remove();document.getElementById("menuEdit").onclick=()=>{n(),Ie(e)},document.getElementById("menuDelete").onclick=async()=>{n(),confirm(`¿Estás seguro de que deseas eliminar a ${e.name||e.email}?`)&&await Ae(e.id)},setTimeout(()=>{document.addEventListener("click",n,{once:!0})},100)}ne&&ne.addEventListener("input",e=>{s.searchTerm=e.target.value,R()});ie&&ie.addEventListener("change",e=>{s.maidStatusFilter=e.target.value,R()});function Lt(){let e=s.allReports;if(s.searchTerm){const t=s.searchTerm.toLowerCase();e=e.filter(o=>{var c;const a=(o.title||o.subject||"").toLowerCase(),n=(((c=o.room)==null?void 0:c.number)||"").toString().toLowerCase();return a.includes(t)||n.includes(t)})}return s.reportRoomFilter&&(e=e.filter(t=>{var o;return(((o=t.room)==null?void 0:o.id)||t.room_id)==s.reportRoomFilter})),s.reportMaidFilter&&(e=e.filter(t=>{var o;return(((o=t.user)==null?void 0:o.id)||t.user_id)==s.reportMaidFilter})),s.reportStatusFilter&&(e=e.filter(t=>t.status===s.reportStatusFilter)),e}function E(){Bt();const e=Lt();de.innerHTML="",e.forEach(t=>{var i,u,m;const o=document.createElement("tr"),a=t.createdAt?new Date(t.createdAt).toLocaleDateString():"—",n=((i=t.room)==null?void 0:i.number)||t.roomId||t.room_id||"—",c=((u=t.user)==null?void 0:u.fullname)||((m=t.user)==null?void 0:m.username)||"—",l=t.title||t.subject||"—";let d=t.status||"pendiente";typeof t.active=="boolean"&&(d=H(t.active));const r=d.charAt(0).toUpperCase()+d.slice(1).toLowerCase();o.innerHTML=`
      <td>${a}</td>
      <td><strong>${n}</strong></td>
      <td>${c}</td>
      <td>${l}</td>
      <td>
        <select class="report-status-select" data-report-id="${t._id||t.id}">
          <option value="Pendiente" ${r==="Pendiente"?"selected":""}>Pendiente</option>
          <option value="Resuelto" ${r==="Resuelto"?"selected":""}>Resuelto</option>
        </select>
      </td>
      <td>
        <div class="action-btns">
          <button class="action-btn btn-view" data-report-id="${t._id}" title="Ver más">
            <i class="bi bi-eye"></i>
          </button>
          <button class="action-btn btn-delete" data-report-id="${t._id}" title="Eliminar">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </td>
    `,de.appendChild(o)}),ue.innerHTML="",e.forEach(t=>{var i,u,m;const o=t.createdAt?new Date(t.createdAt).toLocaleDateString():"—",a=((i=t.room)==null?void 0:i.number)||t.roomId||t.room_id||"—",n=((u=t.user)==null?void 0:u.fullname)||((m=t.user)==null?void 0:m.username)||"—",c=t.title||t.subject||"—";let l=t.status||"pendiente";typeof t.active=="boolean"&&(l=H(t.active));const d=l.charAt(0).toUpperCase()+l.slice(1).toLowerCase(),r=document.createElement("div");r.className="data-card",r.innerHTML=`
      <div class="card-header">
        <div class="card-title">${c}</div>
        <button class="card-menu-btn" data-report-id="${t._id}">
          <i class="bi bi-three-dots-vertical"></i>
        </button>
      </div>
      <div class="card-body">
        <div class="card-icon">
          <i class="bi bi-file-earmark-text"></i>
        </div>
        <div class="card-info">
          <div class="card-info-row">
            <span class="card-label">Fecha</span>
            <span class="card-value">${o}</span>
          </div>
          <div class="card-info-row">
            <span class="card-label">Habitación</span>
            <span class="card-value">${a}</span>
          </div>
          <div class="card-info-row">
            <span class="card-label">Camarera</span>
            <span class="card-value">${n}</span>
          </div>
          <div class="card-info-row">
            <span class="card-label">Estado</span>
            <select class="report-status-select" data-report-id="${t._id||t.id}">
              <option value="Pendiente" ${d==="Pendiente"?"selected":""}>Pendiente</option>
              <option value="Resuelto" ${d==="Resuelto"?"selected":""}>Resuelto</option>
            </select>
          </div>
        </div>
      </div>
    `,ue.appendChild(r)}),document.querySelectorAll(".action-btn.btn-view").forEach(t=>{t.addEventListener("click",()=>{const o=t.dataset.reportId,a=s.allReports.find(n=>n._id===o);a&&Se(a,s.allMaids)})}),document.querySelectorAll(".action-btn.btn-delete[data-report-id]").forEach(t=>{t.addEventListener("click",async()=>{const o=t.dataset.reportId;s.allReports.find(n=>(n._id||n.id)===o)&&confirm("¿Estás seguro de que deseas eliminar este reporte?")&&await Ne(o)})}),document.querySelectorAll(".card-menu-btn[data-report-id]").forEach(t=>{t.addEventListener("click",()=>{const o=t.dataset.reportId,a=s.allReports.find(n=>n._id===o);a&&Mt(a,t)})}),document.querySelectorAll(".report-status-select").forEach(t=>{t.addEventListener("change",async o=>{const a=t.dataset.reportId,n=o.target.value;await $t(a,n)})})}async function Ne(e){try{if(await T("reports",e),navigator.onLine)try{await ot(e),console.log(`Reporte ${e} eliminado del backend`)}catch(t){console.warn("Error al eliminar del backend:",t)}s.allReports=s.allReports.filter(t=>(t._id||t.id)!==e),E(),alert("Reporte eliminado exitosamente")}catch(t){console.error("Error al eliminar reporte:",t),alert("No se pudo eliminar el reporte")}}function Mt(e,t){const o=t.getBoundingClientRect(),a=document.createElement("div");a.style.position="fixed",a.style.top=`${o.bottom+5}px`,a.style.right="20px",a.style.background="white",a.style.borderRadius="12px",a.style.boxShadow="var(--shadow-lg)",a.style.zIndex="1000",a.style.minWidth="150px",a.innerHTML=`
    <button style="display:flex;align-items:center;gap:8px;width:100%;padding:12px 16px;border:none;background:transparent;cursor:pointer;font-size:15px;font-weight:600;" id="menuView">
      <i class="bi bi-eye" style="color:var(--color-info);"></i> Ver más
    </button>
    <button style="display:flex;align-items:center;gap:8px;width:100%;padding:12px 16px;border:none;background:transparent;cursor:pointer;font-size:15px;font-weight:600;" id="menuDelete">
      <i class="bi bi-trash" style="color:var(--color-danger);"></i> Eliminar
    </button>
  `,document.body.appendChild(a);const n=()=>a.remove();document.getElementById("menuView").onclick=()=>{n(),Se(e,s.allMaids)},document.getElementById("menuDelete").onclick=async()=>{n(),confirm("¿Estás seguro de que deseas eliminar este reporte?")&&await Ne(e._id||e.id)},setTimeout(()=>{document.addEventListener("click",n,{once:!0})},100)}async function $t(e,t){var o,a;try{const n=s.allReports.find(l=>(l._id||l.id)===e);if(!n){console.error("Reporte no encontrado:",e);return}const c=He(t);if(navigator.onLine)try{await at({id:n.id||n._id,title:n.title||n.subject||"Reporte",description:n.description||"",user_id:((o=n.user)==null?void 0:o.id)||n.user_id||n.maidId,room_id:((a=n.room)==null?void 0:a.id)||n.roomId||n.room_id,active:c}),console.log(`Reporte ${e} actualizado en backend: active=${c}`)}catch(l){console.warn("Error al actualizar en backend, continuando con IndexedDB:",l)}n.status=t,n.active=c,await f("reports",n),console.log(`Estado del reporte ${e} actualizado a ${t}`),location.reload()}catch(n){console.error("Error al actualizar estado del reporte:",n),alert("No se pudo actualizar el estado del reporte")}}function Bt(){if($){$.innerHTML='<option value="">Habitación</option>';const e=new Set;s.allReports.forEach(t=>{var n,c;const o=((n=t.room)==null?void 0:n.id)||t.room_id,a=((c=t.room)==null?void 0:c.number)||t.roomId;o&&a&&!e.has(o)&&(e.add(o),$.innerHTML+=`<option value="${o}">${a}</option>`)})}if(B){B.innerHTML='<option value="">Camarera</option>';const e=new Set;s.allReports.forEach(t=>{var n,c,l;const o=((n=t.user)==null?void 0:n.id)||t.user_id,a=((c=t.user)==null?void 0:c.fullname)||((l=t.user)==null?void 0:l.username);o&&a&&!e.has(o)&&(e.add(o),B.innerHTML+=`<option value="${o}">${a}</option>`)})}}le&&le.addEventListener("input",e=>{s.searchTerm=e.target.value,E()});$&&$.addEventListener("change",e=>{s.reportRoomFilter=e.target.value,E()});B&&B.addEventListener("change",e=>{s.reportMaidFilter=e.target.value,E()});ce&&ce.addEventListener("change",e=>{s.reportStatusFilter=e.target.value,E()});(async()=>{var e,t;try{if(await Pe(),!localStorage.getItem("authToken")){console.warn("No hay token de autenticación"),alert("Tu sesión ha expirado. Por favor, inicia sesión nuevamente."),window.location.href="./index.html";return}ze(async()=>{console.log("[Reception] Conexión recuperada, sincronizando datos...");try{const{flushOutbox:a}=await Ue(async()=>{const{flushOutbox:c}=await import("./idb-cleanup-DYMc0oMr.js").then(l=>l.o);return{flushOutbox:c}},__vite__mapDeps([0,1]));console.log("[Reception] Sincronizando outbox...");const n=await a();n.success>0&&console.log(`[Reception] ✅ ${n.success} operaciones sincronizadas exitosamente`),n.failed>0&&console.warn(`[Reception] ⚠️ ${n.failed} operaciones fallaron al sincronizar`)}catch(a){console.error("[Reception] Error al sincronizar outbox:",a)}await N(),await x(),s.currentSection==="rooms"?v():s.currentSection==="maids"?R():s.currentSection==="reports"&&E()},()=>{console.log("[Reception] Conexión perdida, usando datos locales")});try{await _e()}catch(a){console.error("[Reception] Error al limpiar IndexedDB:",a)}await It(),await N(),(e=s.layoutSettings)!=null&&e.floors&&((t=s.layoutSettings)!=null&&t.roomsPerFloor)&&await Ee(s.layoutSettings.floors,s.layoutSettings.roomsPerFloor),await x(),A("rooms"),console.log("Aplicación inicializada correctamente")}catch(o){if(console.error("Error al inicializar:",o),o.message&&o.message.includes("403")){alert("Tu sesión ha expirado. Por favor, inicia sesión nuevamente."),window.location.href="./index.html";return}await x(),A("rooms")}})();window.addEventListener("modal-closed",async()=>{await x(),s.currentSection==="rooms"?v():s.currentSection==="maids"?R():s.currentSection==="reports"&&E()});
