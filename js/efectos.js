// Mantenimientos Integrales · efectos visuales y sorpresas
// Todo respeta "reducir movimiento" del sistema: si la persona lo pidió, no hay animaciones.
const reducirMovimiento = matchMedia("(prefers-reduced-motion: reduce)").matches;
const raiz = document.documentElement;

function leerPreferencia(clave) { try { return localStorage.getItem(clave); } catch { return null; } }
function guardarPreferencia(clave, valor) { try { localStorage.setItem(clave, valor); } catch {} }

// ===== Avisos pequeños (abajo a la izquierda) =====
const aviso = document.createElement("div");
aviso.className = "aviso";
aviso.setAttribute("role", "status");
aviso.title = "Toca para cerrar";
document.body.append(aviso);
let avisoTiempo;
function avisar(texto) {
  aviso.textContent = texto;
  aviso.classList.add("visible");
  clearTimeout(avisoTiempo);
  // Más texto, más tiempo para leerlo
  avisoTiempo = setTimeout(() => aviso.classList.remove("visible"), Math.max(6000, texto.length * 95));
}
aviso.addEventListener("click", () => aviso.classList.remove("visible"));

// Cada sorpresa tiene varios mensajes que van rotando (el primero es el original)
function rotar(mensajes) {
  let i = 0;
  return () => mensajes[i++ % mensajes.length];
}
const MENSAJES = {
  llaveCerrada: rotar([
    "Llave cerrada. Así de rápido controlamos una fuga. 😉",
    "Llave cerrada. ¿Ves? Sin agua, sin fugas. 🔧",
    "Cerradita. Así de fácil se arregla cuando sabes cómo. 😎",
    "¡Cerrada! Con nosotros no se escapa ni una gota. 💧",
  ]),
  llaveAbierta: rotar([
    "¡Agua de vuelta! 💧",
    "¡Y el agua vuelve a correr! 🌊",
    "Abierta otra vez. Todo fluye como debe. 😉",
    "¡Agua! Tuberías llenas y sin fugas. 🔧",
  ]),
  inundacion: rotar([
    "¡Tranquilo! Para inundaciones (y fugas) estamos nosotros. 🔧",
    "¡Uy, se nos llenó la página! No te preocupes, sabemos de drenajes. 😅",
    "¡Glu glu! Si esto pasa en tu casa, ya sabes a quién llamar. 🌊",
    "¿Inundación? Nada que no podamos resolver. 💪",
  ]),
  apagon: rotar([
    "¡Se fue la luz! Tranquilo, también somos electricistas. ⚡ Toca el foco para regresarla.",
    "¡Apagón! Usa tu linterna 🔦 y toca el foco para volver la luz.",
    "Oscuridad total… menos mal que sabemos de electricidad. ⚡ Toca el foco.",
    "¿Se botó la pastilla? 😄 Toca el foco y lo arreglamos.",
  ]),
  luz: rotar([
    "¡Luz de vuelta! 💡",
    "¡Hágase la luz! ✨",
    "Listo, luz restablecida. Así de rápido. ⚡",
    "💡 ¡Todo iluminado otra vez!",
  ]),
  pintura: rotar([
    "¿De qué color quieres tu casa? Nosotros la pintamos.",
    "¿Te gusta? Imagínalo en tu sala.",
    "Más de 20 años pintando: el color lo eliges tú.",
    "¿Así o más bonito? 😄",
  ]),
};

// ===== Agua de fondo: sube y llena la página mientras bajas =====
const aguaFondo = document.createElement("div");
aguaFondo.className = "agua-fondo";
aguaFondo.setAttribute("aria-hidden", "true");
aguaFondo.innerHTML = "<span></span>".repeat(8);
document.body.prepend(aguaFondo);

// ===== Patitos de hule: flotan en la superficie y dicen cuac =====
// Viven dentro del agua de fondo: quedan detrás del contenido y solo se asoman donde se ve el agua
const DIBUJO_PATITO = `
  <svg viewBox="0 0 84 70" aria-hidden="true">
    <path d="M12 40c-6-2-9-8-6-13 4 2 8 6 12 9Z" fill="#facc15"/>
    <ellipse cx="38" cy="47" rx="30" ry="17" fill="#fde047"/>
    <ellipse cx="34" cy="40" rx="18" ry="6" fill="#fef9c3" opacity="0.7"/>
    <path d="M24 46c5-8 18-9 24-1-6 7-18 8-24 1Z" fill="#facc15"/>
    <circle cx="56" cy="24" r="16" fill="#fde047"/>
    <circle cx="51" cy="18" r="5" fill="#fef9c3" opacity="0.7"/>
    <path d="M68 25c6-1 12 1 12 4s-6 4-12 3Z" fill="#fb923c"/>
    <path d="M68 31c5 1 9 1 10 2-3 3-8 3-11 0Z" fill="#f97316"/>
    <g class="patito__ojo"><circle cx="61" cy="20" r="4" fill="#0f2a44"/><circle cx="62.5" cy="18.5" r="1.5" fill="#fff"/></g>
    <path class="patito__ojo-feliz" d="M57 21q4-5 8 0" fill="none" stroke="#0f2a44" stroke-width="2.2" stroke-linecap="round"/>
    <ellipse cx="62" cy="30" rx="3.5" ry="2.2" fill="#fb7185" opacity="0.45"/>
  </svg>`;

// Mamá pato alterna saludos, pistas de los secretos y consejos de mantenimiento y seguridad
const DICHOS_MAMA = [
  "¡Cuac! 🦆 Soy el patito de la casa. Tócame otra vez y te cuento secretos…",
  "🦆 Pista: el foco de Electricidad esconde algo. ⚡",
  "🦆 Consejo: si tu recibo de agua subió sin razón, puede haber una fuga escondida. 💧",
  "🦆 Seguridad: nunca toques contactos ni aparatos con las manos mojadas. ⚡",
  "🦆 Pista: el rodillo de Pintura cambia de color. 🎨",
  "🦆 Consejo: si una pastilla eléctrica se bota seguido, no la fuerces. Puede ser una falla: escríbenos.",
  "🦆 Pista: dale 5 clics rápidos a la llave de la portada… si te atreves. 🔧",
  "🦆 Seguridad: si hay agua cerca de cables o contactos, corta la luz antes de acercarte. 💧⚡",
  "🦆 Consejo: antes de la temporada de lluvias es el mejor momento para impermeabilizar. ☔",
  "🦆 Pista: escribe «agua» con el teclado en cualquier página. 🌊",
  "🦆 Consejo: pintar en días secos ayuda a que la pintura seque pareja y dure más.",
  "¡Cuac! ¿Ya cotizaste por WhatsApp? 😉",
];
// El patito bebé (solo en el inicio) es el experto en seguridad
const DICHOS_BEBE = [
  "¡Cuic! 🐤 Soy el patito bebé. Yo me sé los consejos de seguridad…",
  "🐤 Seguridad: antes de cambiar un apagador o una lámpara, baja la pastilla. 🔌",
  "🐤 Seguridad: si un contacto se calienta, huele a quemado o echa chispas, deja de usarlo y escríbenos.",
  "🐤 Seguridad: no conectes muchos aparatos en una sola extensión. 🔥",
  "🐤 Seguridad: nunca toques contactos ni aparatos con las manos mojadas. ⚡",
  "🐤 Seguridad: al pintar, ventila bien el cuarto y sal a tomar aire de vez en cuando. 🎨",
  "🐤 Seguridad: para subir al techo, usa una escalera firme y que alguien te la sostenga. 🪜",
  "🐤 Seguridad: si se te mete el agua por una fuga grande, cierra la llave de paso general. 🔧",
  "¡Cuic cuic! Mamá pato dice que te portes bien. 🦆💛",
];

function crearPatito(clase, dichos) {
  const el = document.createElement("div");
  el.className = `patito ${clase}`;
  el.innerHTML = DIBUJO_PATITO;
  el.dichos = rotar(dichos);
  aguaFondo.append(el);
  return el;
}
const patitos = [crearPatito("patito--mama", DICHOS_MAMA)];
if (document.querySelector(".portada")) {
  aguaFondo.classList.add("con-bebe");
  patitos.push(crearPatito("patito--bebe", DICHOS_BEBE));
}

// Como están detrás del contenido, revisamos a mano si el clic cayó en la parte visible de un patito
const INTERACTIVOS = "a, button, input, textarea, select, dialog, figure, .servicio, .paso, .extra, .tarjeta, .salida, .especialidad, .portada, .cabecera-pagina, .llamado, .pie, .encabezado";
function patitoTocado(e) {
  if (e.target.closest(INTERACTIVOS)) return null;
  return patitos.find((p) => {
    const r = p.getBoundingClientRect();
    return e.clientX >= r.left + 4 && e.clientX <= r.right - 4 && e.clientY >= r.top + 4 && e.clientY <= r.bottom - 8;
  }) || null;
}
document.addEventListener("click", (e) => {
  const p = patitoTocado(e);
  if (!p) return;
  p.classList.remove("cuac");
  void p.offsetWidth; // reinicia la animación del salto
  p.classList.add("cuac");
  avisar(p.dichos());
});
document.addEventListener("pointermove", (e) => {
  raiz.classList.toggle("sobre-patito", !!patitoTocado(e));
}, { passive: true });

// ===== Capi: el capibara ayudante de obra, junto al botón de WhatsApp =====
const capi = document.createElement("button");
capi.type = "button";
capi.className = "capi";
capi.setAttribute("aria-label", "Capi, el capibara ayudante");
capi.innerHTML = `
  <span class="capi__globo" aria-hidden="true">¿Te ayudo? Escríbenos 👉</span>
  <svg viewBox="0 0 100 120" aria-hidden="true">
    <defs>
      <linearGradient id="capi-pelo" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#c98c52"/><stop offset="0.55" stop-color="#a8683a"/><stop offset="1" stop-color="#7d4a25"/>
      </linearGradient>
      <linearGradient id="capi-espejo" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#38bdf8"/><stop offset="0.5" stop-color="#0369a1"/><stop offset="1" stop-color="#0f172a"/>
      </linearGradient>
      <radialGradient id="capi-hocico" cx="0.3" cy="0.4" r="0.7">
        <stop offset="0" stop-color="#a0602f"/><stop offset="1" stop-color="#a0602f" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <g class="capi__cabeza">
      <!-- pata trasera y patita de adelante -->
      <rect x="68" y="98" width="13" height="16" rx="6" fill="#7d4a25"/>
      <ellipse cx="75" cy="114.5" rx="8" ry="3.4" fill="#4a2a14"/>
      <rect x="38" y="98" width="13" height="16" rx="6" fill="#8a5430"/>
      <ellipse cx="44" cy="114.5" rx="8" ry="3.4" fill="#4a2a14"/>
      <!-- oreja (atrás de la cabeza, sin atravesar el casco) -->
      <ellipse cx="84" cy="24" rx="4.6" ry="5.8" fill="#8a5430" transform="rotate(20 84 24)"/>
      <ellipse cx="84.6" cy="24.6" rx="2.2" ry="3.4" fill="#4a2a14" transform="rotate(20 84 24)"/>
      <!-- silueta de capibara real: cabeza larga, cuello grueso y pecho -->
      <path d="M14 26C24 20 50 16 70 17c10 1 16 9 16 19 6 12 10 34 8 62-1 10-8 14-18 14H40c-8 0-12-6-10-16 1-14 4-26 10-34-10 0-22-4-28-10-6-6-6-18 2-26Z" fill="url(#capi-pelo)"/>
      <!-- luces y sombras del pelaje -->
      <path d="M22 22c14-4 32-5 46-3" fill="none" stroke="#dba06a" stroke-width="3" stroke-linecap="round" opacity="0.55"/>
      <path d="M40 62c-6 10-8 22-7 34" fill="none" stroke="#d39a62" stroke-width="5" stroke-linecap="round" opacity="0.45"/>
      <path d="M22 56c12 5 26 5 38-1" fill="none" stroke="#6b3d1e" stroke-width="2" stroke-linecap="round" opacity="0.35"/>
      <path d="M62 52l3 6M70 62l3 6M60 72l3 6M76 76l3 6M66 86l3 6" stroke="#6b3d1e" stroke-width="1.2" stroke-linecap="round" opacity="0.3"/>
      <!-- hocico redondito, como de caricatura -->
      <circle cx="17" cy="39" r="15" fill="url(#capi-pelo)"/>
      <ellipse cx="15" cy="40" rx="13" ry="13" fill="url(#capi-hocico)"/>
      <path d="M8 27c5-3 12-3 17 0" fill="none" stroke="#dba06a" stroke-width="2.2" stroke-linecap="round" opacity="0.5"/>
      <ellipse cx="8.5" cy="35" rx="5.2" ry="4" fill="#5b331a"/>
      <ellipse cx="7.4" cy="33.8" rx="1.6" ry="1" fill="#a0704a" opacity="0.8"/>
      <path d="M6 47q7 5 15 1.5" fill="none" stroke="#4a2a14" stroke-width="1.7" stroke-linecap="round"/>
      
      <!-- ojo oscuro y redondito con brillo, como de capibara real -->
      <g class="capi__ojos">
        <ellipse cx="56" cy="28" rx="3.6" ry="3.9" fill="#1a0f07"/>
        <circle cx="57.4" cy="26.6" r="1.35" fill="#fff"/>
        <circle cx="55" cy="29.6" r="0.6" fill="#fff" opacity="0.6"/>
      </g>
      <!-- cinturón con pinzas y rodillo -->
      <path d="M31 86c20 3 43 3 63-1v8c-20 4-43 4-63 1Z" fill="#5b3a21"/>
      <rect x="54" y="85" width="10" height="10" rx="2" fill="#fbbf24"/>
      <rect x="56.5" y="87.5" width="5" height="5" rx="1" fill="#5b3a21"/>
      <!-- pinzas de electricista: mordaza plateada, remache y mangos rojos -->
      <g transform="translate(39 80) rotate(-10)">
        <path d="M-4 -5C-5.2 3-6.4 9-6 15" fill="none" stroke="#dc2626" stroke-width="3.6" stroke-linecap="round"/>
        <path d="M4 -5C4.8 3 5.8 9 6.6 15" fill="none" stroke="#dc2626" stroke-width="3.6" stroke-linecap="round"/>
        <path d="M-4.4 -3C-5.2 3-5.8 8-5.6 12M4.4 -3C5 3 5.6 8 6 12" fill="none" stroke="#f87171" stroke-width="1" stroke-linecap="round" opacity="0.8"/>
        <path d="M-3.4 -10.5h6.8l1.4 5.5h-9.6Z" fill="#cbd5e1" stroke="#64748b" stroke-width="0.6" stroke-linejoin="round"/>
        <circle cx="0" cy="-12" r="3.3" fill="#e2e8f0" stroke="#94a3b8" stroke-width="0.8"/>
        <circle cx="0" cy="-12" r="1.2" fill="#94a3b8"/>
        <path d="M-3.2 -14.4L-1.8 -23.5Q0 -25.6 1.8 -23.5L3.2 -14.4Z" fill="#e2e8f0" stroke="#64748b" stroke-width="0.6" stroke-linejoin="round"/>
        <ellipse cx="0" cy="-17.6" rx="0.9" ry="2" fill="#475569"/>
        <path d="M-1.2 -21.5h2.4M-1.4 -20h2.8" stroke="#94a3b8" stroke-width="0.5"/>
        <path d="M0 -24.8v4.6" stroke="#64748b" stroke-width="0.5"/>
      </g>
      <rect x="33" y="92" width="12" height="11" rx="3" fill="#6b3d1e"/>
      <!-- desarmador en el bolsillo de atrás -->
      <rect x="79.6" y="76" width="4.8" height="15" rx="2" fill="#f59e0b"/>
      <path d="M79.6 80h4.8M79.6 84h4.8" stroke="#1e293b" stroke-width="1.2"/>
      <rect x="81.2" y="71" width="1.6" height="5.5" rx="0.6" fill="#cbd5e1"/>
      <rect x="76" y="91" width="12" height="11" rx="3" fill="#6b3d1e"/>
      <!-- rodillo de impermeabilizar, sostenido con su manita y apoyado en el piso -->
      <rect x="4" y="105" width="20" height="9" rx="4" fill="#f1f5f9" stroke="#94a3b8" stroke-width="1.2"/>
      <path d="M7 107.5h14" stroke="#cbd5e1" stroke-width="1.2" stroke-linecap="round"/>
      <path d="M14 105v-6h12v-7" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linejoin="round"/>
      <rect x="23.4" y="81" width="5.2" height="12" rx="2.2" fill="#1e293b"/>
      <ellipse cx="32" cy="76" rx="5" ry="11" fill="#a8693a" transform="rotate(34 32 76)"/>
      <ellipse cx="26" cy="84" rx="4.4" ry="3.8" fill="#8a5430"/>
      <!-- lentes de sol (de perfil) -->
      <g class="capi__lentes">
        <path d="M48 22.5h16l-1.3 7.4c-.5 2.6-2.5 3.7-5 3.7h-3.8c-3.2 0-5.6-2.1-6-4.9Z" fill="url(#capi-espejo)" stroke="#0f172a" stroke-width="1.4" stroke-linejoin="round"/>
        <path d="M64 24.2l11-3.6" stroke="#0f172a" stroke-width="1.8" stroke-linecap="round"/>
        <path d="M51.5 30.5l4.6-6.4M55.6 31.4l3.6-5" stroke="#fff" stroke-width="1.5" stroke-linecap="round" opacity="0.8"/>
      </g>
      <!-- casco de constructor -->
      <g class="capi__casco">
        <path d="M40 17.5c1.6-8.6 9.4-12.6 18.6-12.6s17 4 18.4 12Z" fill="#facc15"/>
        <path d="M58.6 5.2v11.4" stroke="#eab308" stroke-width="3.2"/>
        <rect x="36" y="15" width="46" height="4.6" rx="2.3" fill="#eab308"/>
        <path d="M45.5 10q4.5-3.4 9-4" fill="none" stroke="#fef9c3" stroke-width="2" stroke-linecap="round"/>
      </g>
    </g>
  </svg>`;
document.body.append(capi);
const DICHOS_CAPI = rotar([
  "👷 ¡Hola! Soy Capi, el ayudante de la obra. 😎",
  "👉 ¿Fuga, apagón o pared sin pintar? Escríbenos por WhatsApp aquí al lado.",
  "🔧 Consejo de Capi: revisa tus llaves y mezcladoras; si gotean, mejor arreglarlas pronto.",
  "😌 Los capibaras somos tranquilos… como tu casa después de que la arreglamos.",
  "⚡ Consejo de Capi: si un apagador hace chispa o se siente caliente, no lo uses y avísanos.",
  "⛑️ Mi casco es de verdad: en la obra, la seguridad primero.",
  "🎨 Consejo de Capi: antes de pintar, hay que resanar y limpiar la pared. Así queda pareja.",
  "🧰 En mi cinturón traigo pinzas de electricista y rodillo. ¿Qué arreglamos hoy?",
  "☔ Consejo de Capi: limpia tu azotea y las bajadas de agua antes de que lleguen las lluvias.",
  "🦆 Psst… en el agua de la página hay patitos escondidos.",
  "😎 ¿Ya viste que me bajo los lentes? Pasa el mouse sobre mí.",
]);
capi.addEventListener("click", () => {
  capi.classList.remove("saluda");
  void capi.offsetWidth;
  capi.classList.add("saluda");
  clearTimeout(capi.tiempo);
  capi.tiempo = setTimeout(() => capi.classList.remove("saluda"), 1800); // se vuelve a poner los lentes
  capi.querySelector(".capi__globo").classList.remove("visible");
  avisar(DICHOS_CAPI());
});
// Una vez por visita, Capi ofrece ayuda con un globito
let capiYaSaludo = false;
try { capiYaSaludo = sessionStorage.getItem("capi-saludo") === "1"; } catch {}
if (!capiYaSaludo) {
  const globo = capi.querySelector(".capi__globo");
  setTimeout(() => {
    globo.classList.add("visible");
    try { sessionStorage.setItem("capi-saludo", "1"); } catch {}
    setTimeout(() => globo.classList.remove("visible"), 7000);
  }, 4000);
}

// ===== Chorro: cae del tubo de la cabecera hasta la superficie del agua =====
const tuboCabecera = document.querySelector(".cabecera-pagina .tubo--h");
const chorro = tuboCabecera && !reducirMovimiento ? document.createElement("div") : null;
if (chorro) {
  chorro.className = "chorro";
  chorro.setAttribute("aria-hidden", "true");
  document.body.append(chorro);
}
function acomodarChorro(nivel) {
  if (!chorro) return;
  const r = tuboCabecera.getBoundingClientRect();
  const inicio = r.top + 46;                                 // parte de abajo de la boquilla
  const superficie = window.innerHeight * (1 - nivel) + 6;   // donde está el agua ahora
  const largo = superficie - inicio;
  chorro.classList.toggle("activo", largo > 12 && inicio > -20);
  chorro.style.left = `${r.right - 19}px`;
  chorro.style.top = `${inicio}px`;
  chorro.style.height = `${Math.max(0, largo)}px`;
}

// ===== El agua corre al bajar por la página =====
let pendiente = false;
function alBajar() {
  const maximo = Math.max(1, raiz.scrollHeight - window.innerHeight);
  const avance = Math.min(1, window.scrollY / maximo);
  const nivel = reducirMovimiento ? 0.4 : 0.22 + avance * 0.78;
  raiz.style.setProperty("--flujo", (window.scrollY * 0.6).toFixed(1));
  raiz.style.setProperty("--nivel", nivel.toFixed(3));
  acomodarChorro(nivel);
  pendiente = false;
}
window.addEventListener("scroll", () => {
  if (!pendiente) { pendiente = true; requestAnimationFrame(alBajar); }
}, { passive: true });
window.addEventListener("resize", alBajar);
alBajar();

// ===== Pausar animaciones (para toda la página) =====
const botonesPausa = [];
function ponerQuieto(quieto) {
  raiz.classList.toggle("quieto", quieto);
  guardarPreferencia("quieto", quieto ? "1" : "0");
  botonesPausa.forEach((b) => b.actualizar(quieto));
  if (burbujas) burbujas.activar(!quieto);
}

const pie = document.querySelector(".pie__fila");
if (pie && !reducirMovimiento) {
  const boton = document.createElement("button");
  boton.type = "button";
  boton.className = "pausa-global";
  boton.actualizar = (quieto) => {
    boton.textContent = quieto ? "▶ Reanudar animaciones" : "❚❚ Pausar animaciones";
  };
  boton.addEventListener("click", () => ponerQuieto(!raiz.classList.contains("quieto")));
  pie.append(boton);
  botonesPausa.push(boton);
}

// ===== Burbujas de la portada =====
const burbujas = crearBurbujas(document.getElementById("burbujas"));

function crearBurbujas(lienzo) {
  if (!lienzo) return null;
  const ctx = lienzo.getContext("2d");
  const zona = lienzo.parentElement;
  const raton = { x: -9999, y: -9999 };
  let ancho = 0, alto = 0, base = [], extra = [];
  let activo = !reducirMovimiento, enPantalla = true, cuadro = null;

  const nueva = (x, y) => {
    const r = 2 + Math.random() * 7;
    return {
      x: x ?? Math.random() * ancho,
      y: y ?? Math.random() * alto,
      r, vx: 0, vy: -(0.25 + Math.random() * 0.55) * (r / 5 + 0.5),
      fase: Math.random() * Math.PI * 2,
    };
  };

  function medir() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    ancho = zona.clientWidth; alto = zona.clientHeight;
    lienzo.width = ancho * dpr; lienzo.height = alto * dpr;
    lienzo.style.width = `${ancho}px`; lienzo.style.height = `${alto}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const cantidad = Math.min(70, Math.round((ancho * alto) / 16000));
    while (base.length < cantidad) base.push(nueva());
    base.length = cantidad;
  }

  function dibujar(b, alfa) {
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(56, 189, 248, ${0.4 * alfa})`;
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(b.x - b.r * 0.35, b.y - b.r * 0.35, b.r * 0.25, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${0.4 * alfa})`;
    ctx.fill();
  }

  function mover(b) {
    b.fase += 0.02;
    b.x += Math.sin(b.fase) * 0.3 + b.vx;
    b.y += b.vy;
    b.vx *= 0.96;
    // Se apartan del mouse
    const dx = b.x - raton.x, dy = b.y - raton.y, d2 = dx * dx + dy * dy;
    if (d2 < 8100) {
      const d = Math.sqrt(d2) || 1, fuerza = ((90 - d) / 90) * 1.8;
      b.x += (dx / d) * fuerza; b.y += (dy / d) * fuerza;
    }
  }

  function paso() {
    ctx.clearRect(0, 0, ancho, alto);
    base.forEach((b) => {
      mover(b);
      if (b.y < -b.r) Object.assign(b, nueva(undefined, alto + b.r));
      dibujar(b, 1);
    });
    extra = extra.filter((b) => {
      mover(b);
      b.vy *= 0.99; b.vida -= 0.012;
      dibujar(b, Math.max(b.vida, 0) * 1.6);
      return b.vida > 0 && b.y > -b.r;
    });
  }

  function bucle() { paso(); cuadro = requestAnimationFrame(bucle); }
  function revisar() {
    const debeCorrer = (activo || extra.length) && enPantalla && !document.hidden;
    if (debeCorrer && !cuadro) bucle();
    if (!debeCorrer && cuadro) { cancelAnimationFrame(cuadro); cuadro = null; }
  }

  medir(); paso();
  window.addEventListener("resize", () => { medir(); paso(); });
  document.addEventListener("visibilitychange", revisar);
  new IntersectionObserver(([e]) => { enPantalla = e.isIntersecting; revisar(); }).observe(zona);

  zona.addEventListener("pointermove", (e) => {
    const r = zona.getBoundingClientRect();
    raton.x = e.clientX - r.left; raton.y = e.clientY - r.top;
  });
  zona.addEventListener("pointerleave", () => { raton.x = raton.y = -9999; });

  const api = {
    salpicar(x, y, cantidad = 18) {
      if (reducirMovimiento) return;
      for (let i = 0; i < cantidad; i++) {
        const b = nueva(x, y);
        b.vx = (Math.random() - 0.5) * 7;
        b.vy = -(1 + Math.random() * 3.5);
        b.vida = 1;
        extra.push(b);
      }
      revisar();
    },
    posicion(el) {
      const z = zona.getBoundingClientRect(), r = el.getBoundingClientRect();
      return [r.left + r.width / 2 - z.left, r.top + r.height / 2 - z.top];
    },
    activar(si) { activo = si && !reducirMovimiento; revisar(); },
  };

  // Clic en el fondo de la portada: chorrito de burbujas
  zona.addEventListener("click", (e) => {
    if (e.target.closest("a, button")) return;
    const r = zona.getBoundingClientRect();
    api.salpicar(e.clientX - r.left, e.clientY - r.top);
  });

  // Botón de pausa de la portada (controla todas las animaciones)
  const pausa = document.getElementById("pausa");
  if (pausa && !reducirMovimiento) {
    pausa.hidden = false;
    pausa.actualizar = (quieto) => {
      pausa.textContent = quieto ? "▶" : "❚❚";
      pausa.setAttribute("aria-label", quieto ? "Reanudar animaciones" : "Pausar animaciones");
    };
    pausa.addEventListener("click", () => ponerQuieto(!raiz.classList.contains("quieto")));
    botonesPausa.push(pausa);
  }

  revisar();
  return api;
}

ponerQuieto(leerPreferencia("quieto") === "1");

// ===== Llave de paso: gira sobre sí misma, abre y cierra el agua =====
const llave = document.getElementById("llave");
const hub = document.querySelector(".hub");
if (llave && hub) {
  const volante = llave.querySelector(".llave__volante");
  let angulo = 0, ultimoY = window.scrollY, clics = [];
  const pintar = () => { volante.style.transform = `rotate(${angulo}deg)`; };

  // Con el agua abierta, la llave gira al bajar por la página; cerrada, se queda quieta
  if (!reducirMovimiento) {
    window.addEventListener("scroll", () => {
      if (!hub.classList.contains("cerrada") && !llave.classList.contains("girando")) {
        angulo += (window.scrollY - ultimoY) * 0.5;
        pintar();
      }
      ultimoY = window.scrollY;
    }, { passive: true });
  }

  llave.addEventListener("click", () => {
    const cerrada = hub.classList.toggle("cerrada");
    llave.setAttribute("aria-label", cerrada ? "Abrir la llave del agua" : "Cerrar la llave del agua");

    // Cerrar: vuelta a la derecha. Abrir: vuelta a la izquierda.
    llave.classList.add("girando");
    angulo += cerrada ? 360 : -360;
    pintar();
    setTimeout(() => llave.classList.remove("girando"), 900);

    if (cerrada) {
      avisar(MENSAJES.llaveCerrada());
    } else {
      avisar(MENSAJES.llaveAbierta());
      if (burbujas) burbujas.salpicar(...burbujas.posicion(llave), 24);
    }

    // Easter egg: 5 clics rápidos y... se desborda
    const ahora = Date.now();
    clics = clics.filter((t) => ahora - t < 2500).concat(ahora);
    if (clics.length >= 5) {
      clics = [];
      hub.classList.remove("cerrada");
      llave.setAttribute("aria-label", "Cerrar la llave del agua");
      inundar();
    }
  });
}

// ===== Easter egg: el foco provoca un apagón (y una linterna sigue al mouse) =====
const foco = document.getElementById("foco");
let apagon = null, apagonTiempo;

function apagarLuz() {
  apagon = document.createElement("div");
  apagon.className = "apagon";
  apagon.setAttribute("aria-hidden", "true");
  const r = foco.getBoundingClientRect();
  apagon.style.setProperty("--lx", `${r.left + r.width / 2}px`);
  apagon.style.setProperty("--ly", `${r.top + r.height / 2}px`);
  document.body.append(apagon);
  raiz.classList.add("sin-luz");
  foco.setAttribute("aria-label", "Encender la luz");
  avisar(MENSAJES.apagon());
  apagonTiempo = setTimeout(encenderLuz, 15000);
}

function encenderLuz() {
  if (!apagon) return;
  apagon.remove();
  apagon = null;
  clearTimeout(apagonTiempo);
  raiz.classList.remove("sin-luz");
  foco.setAttribute("aria-label", "Apagar la luz");
  avisar(MENSAJES.luz());
}

if (foco) {
  foco.addEventListener("click", () => (apagon ? encenderLuz() : apagarLuz()));
  document.addEventListener("pointermove", (e) => {
    if (!apagon) return;
    apagon.style.setProperty("--lx", `${e.clientX}px`);
    apagon.style.setProperty("--ly", `${e.clientY}px`);
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") encenderLuz(); });
}

// ===== Easter egg: el rodillo cambia el color de la pintura =====
const rodillo = document.getElementById("rodillo");
if (rodillo) {
  const tarjetaColor = document.getElementById("especialidad-color");
  const COLORES = [
    ["#fb7185", "Coral"], ["#38bdf8", "Azul cielo"], ["#fbbf24", "Amarillo sol"],
    ["#34d399", "Verde menta"], ["#a78bfa", "Lavanda"], ["#f97316", "Naranja"],
  ];
  let colorActual = 0;
  rodillo.addEventListener("click", () => {
    colorActual = (colorActual + 1) % COLORES.length;
    const [color, nombre] = COLORES[colorActual];
    tarjetaColor.style.setProperty("--pintura", color);
    rodillo.classList.remove("pintando");
    void rodillo.offsetWidth;
    rodillo.classList.add("pintando");
    avisar(`🎨 ${nombre}. ${MENSAJES.pintura()}`);
  });
}

// ===== Easter egg: escribe "agua" en la página =====
let tecleado = "";
document.addEventListener("keydown", (e) => {
  if (e.target.closest("input, textarea") || e.key.length !== 1) return;
  tecleado = (tecleado + e.key.toLowerCase()).slice(-4);
  if (tecleado === "agua") inundar();
});

let inundando = false;
function inundar() {
  if (inundando) return;
  const mensaje = MENSAJES.inundacion();
  if (reducirMovimiento) { avisar(mensaje); return; }
  if (inundando) return;
  inundando = true;
  const agua = document.createElement("div");
  agua.className = "inundacion";
  agua.setAttribute("aria-hidden", "true");
  document.body.append(agua);
  setTimeout(() => avisar(mensaje), 1400);
  agua.addEventListener("animationend", (e) => {
    if (e.animationName !== "inundar") return;
    agua.remove();
    inundando = false;
  });
}

// ===== Tarjetas que se inclinan en 3D siguiendo el mouse =====
if (!reducirMovimiento && matchMedia("(hover: hover) and (pointer: fine)").matches) {
  document.querySelectorAll(".salida, .servicio, .paso, .especialidad, .extra, .tarjeta:not(.tarjeta--principal)").forEach((tarjeta) => {
    tarjeta.addEventListener("pointermove", (e) => {
      const r = tarjeta.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      tarjeta.style.setProperty("--mx", `${px * 100}%`);
      tarjeta.style.setProperty("--my", `${py * 100}%`);
      tarjeta.style.transform = `perspective(800px) rotateX(${(0.5 - py) * 8}deg) rotateY(${(px - 0.5) * 8}deg) translateY(-4px)`;
    });
    tarjeta.addEventListener("pointerleave", () => { tarjeta.style.transform = ""; });
  });
}

// ===== Para los curiosos que abren la consola =====
console.log(
  "%c🔧 ¿Curioseando el código?",
  "font: 700 16px sans-serif; color: #0ea5e9",
  "\nNos gusta la gente curiosa. Psst… escribe \"agua\" en la página, toca el foco, el rodillo… o al patito. 💧⚡🎨🦆"
);
