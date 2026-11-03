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

// ===== Agua de fondo: sube y llena la página mientras bajas =====
const aguaFondo = document.createElement("div");
aguaFondo.className = "agua-fondo";
aguaFondo.setAttribute("aria-hidden", "true");
aguaFondo.innerHTML = "<span></span>".repeat(8);
document.body.prepend(aguaFondo);

// ===== Patito de hule: flota en la superficie y dice cuac =====
// Vive dentro del agua de fondo: queda detrás del contenido y solo se asoma donde se ve el agua
const patito = document.createElement("div");
patito.className = "patito";
patito.innerHTML = `
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
aguaFondo.append(patito);
const cuacs = [
  "¡Cuac! 🦆",
  "¡Cuac! Aquí el agua va por donde debe. 💧",
  "¡Cuac cuac! Ni una fuga a la vista. 🔧",
  "🦆 Psst… prueba tocar el foco. ⚡",
  "¡Cuac! ¿Ya cotizaste por WhatsApp? 😉",
];
let cuacActual = 0;
// Como está detrás del contenido, revisamos a mano si el clic cayó en la parte visible del patito
const INTERACTIVOS = "a, button, input, textarea, select, dialog, figure, .servicio, .paso, .extra, .tarjeta, .salida, .especialidad, .portada, .cabecera-pagina, .llamado, .pie, .encabezado";
function tocaPatito(e) {
  const r = patito.getBoundingClientRect();
  const dentro = e.clientX >= r.left + 6 && e.clientX <= r.right - 6 && e.clientY >= r.top + 4 && e.clientY <= r.bottom - 10;
  return dentro && !e.target.closest(INTERACTIVOS);
}
document.addEventListener("click", (e) => {
  if (!tocaPatito(e)) return;
  patito.classList.remove("cuac");
  void patito.offsetWidth; // reinicia la animación del salto
  patito.classList.add("cuac");
  avisar(cuacs[cuacActual++ % cuacs.length]);
});
document.addEventListener("pointermove", (e) => {
  raiz.classList.toggle("sobre-patito", tocaPatito(e));
}, { passive: true });

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
      avisar("Llave cerrada. Así de rápido controlamos una fuga. 😉");
    } else {
      avisar("¡Agua de vuelta! 💧");
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
  avisar("¡Se fue la luz! Tranquilo, también somos electricistas. ⚡ Toca el foco para regresarla.");
  apagonTiempo = setTimeout(encenderLuz, 15000);
}

function encenderLuz() {
  if (!apagon) return;
  apagon.remove();
  apagon = null;
  clearTimeout(apagonTiempo);
  raiz.classList.remove("sin-luz");
  foco.setAttribute("aria-label", "Apagar la luz");
  avisar("¡Luz de vuelta! 💡");
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

// ===== Easter egg: escribe "agua" en la página =====
let tecleado = "";
document.addEventListener("keydown", (e) => {
  if (e.target.closest("input, textarea") || e.key.length !== 1) return;
  tecleado = (tecleado + e.key.toLowerCase()).slice(-4);
  if (tecleado === "agua") inundar();
});

let inundando = false;
function inundar() {
  const mensaje = "¡Tranquilo! Para inundaciones (y fugas) estamos nosotros. 🔧";
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
  "\nNos gusta la gente curiosa. Psst… escribe \"agua\" en la página, o toca el foco. 💧⚡"
);
