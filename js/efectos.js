// Mantenimientos Integrales · efectos visuales y sorpresas
// Todo respeta "reducir movimiento" del sistema: si la persona lo pidió, no hay animaciones.
const reducirMovimiento = matchMedia("(prefers-reduced-motion: reduce)").matches;
const raiz = document.documentElement;

// ===== Avisos pequeños (abajo a la izquierda) =====
const aviso = document.createElement("div");
aviso.className = "aviso";
aviso.setAttribute("role", "status");
document.body.append(aviso);
let avisoTiempo;
function avisar(texto) {
  aviso.textContent = texto;
  aviso.classList.add("visible");
  clearTimeout(avisoTiempo);
  avisoTiempo = setTimeout(() => aviso.classList.remove("visible"), 3800);
}

// ===== El agua de las tuberías corre al bajar por la página =====
if (!reducirMovimiento) {
  let pendiente = false;
  const actualizarFlujo = () => {
    raiz.style.setProperty("--flujo", (window.scrollY * 0.6).toFixed(1));
    pendiente = false;
  };
  window.addEventListener("scroll", () => {
    if (!pendiente) { pendiente = true; requestAnimationFrame(actualizarFlujo); }
  }, { passive: true });
  actualizarFlujo();
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
    const debeCorrer = activo && enPantalla && !document.hidden;
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
      if (!activo) { activo = true; actualizarPausa(); }
      revisar();
    },
    posicion(el) {
      const z = zona.getBoundingClientRect(), r = el.getBoundingClientRect();
      return [r.left + r.width / 2 - z.left, r.top + r.height / 2 - z.top];
    },
  };

  // Clic en el fondo de la portada: chorrito de burbujas
  zona.addEventListener("click", (e) => {
    if (e.target.closest("a, button")) return;
    const r = zona.getBoundingClientRect();
    api.salpicar(e.clientX - r.left, e.clientY - r.top);
  });

  // Botón para pausar (las animaciones largas deben poder detenerse)
  const pausa = document.getElementById("pausa");
  function actualizarPausa() {
    if (!pausa) return;
    pausa.textContent = activo ? "❚❚" : "▶";
    pausa.setAttribute("aria-label", activo ? "Pausar las burbujas" : "Reanudar las burbujas");
  }
  if (pausa && !reducirMovimiento) {
    pausa.hidden = false;
    pausa.addEventListener("click", () => { activo = !activo; actualizarPausa(); revisar(); });
  }

  revisar();
  return api;
}

// ===== Llave de paso: abre y cierra el agua =====
const llave = document.getElementById("llave");
const hub = document.querySelector(".hub");
if (llave && hub) {
  let clics = [];
  llave.addEventListener("click", () => {
    const cerrada = hub.classList.toggle("cerrada");
    llave.setAttribute("aria-label", cerrada ? "Abrir la llave del agua" : "Cerrar la llave del agua");
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
  apagonTiempo = setTimeout(encenderLuz, 12000);
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
  document.querySelectorAll(".salida, .servicio, .paso, .especialidad, .tarjeta:not(.tarjeta--principal)").forEach((tarjeta) => {
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
