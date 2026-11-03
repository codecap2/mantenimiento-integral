// Mantenimientos Integrales · comportamiento de la página
document.documentElement.classList.add("js");

// El número no aparece escrito completo en el código para que los robots que
// recolectan teléfonos de páginas web no lo encuentren fácil.
const PARTES = ["0465", "570", "449", "52"];
const WHATSAPP = PARTES.slice().reverse().join("");
const TELEFONO_VISIBLE = `${PARTES[2]} ${PARTES[1]} ${PARTES[0]}`;

// Fotos de trabajos (versiones optimizadas en img/trabajos/web/).
// Para agregar una: optimízala con .claude/optimizar-fotos.ps1 y añade una línea aquí.
// tipo: fontaneria | electricidad | pintura | impermeabilizacion
const TRABAJOS = [
  { foto: "fontaneria-plano-tuberias", tipo: "fontaneria", texto: "Tuberías instaladas según plano" },
  { foto: "electricidad-plafon-led", tipo: "electricidad", texto: "Iluminación LED en plafón" },
  { foto: "fontaneria-bano", tipo: "fontaneria", texto: "Instalación de baño" },
  { foto: "electricidad-espejo-led", tipo: "electricidad", texto: "Espejo con luz LED en baño" },
  { foto: "fontaneria-drenaje", tipo: "fontaneria", texto: "Instalación de drenaje" },
  { foto: "electricidad-losa", tipo: "electricidad", texto: "Instalación eléctrica en losa" },
  { foto: "fontaneria-azotea-tinacos", tipo: "fontaneria", texto: "Tinacos y tuberías en azotea" },
  { foto: "electricidad-tablero", tipo: "electricidad", texto: "Instalación de tablero eléctrico" },
  { foto: "electricidad-iluminacion", tipo: "electricidad", texto: "Luminarias y luz indirecta" },
  { foto: "electricidad-nichos", tipo: "electricidad", texto: "Nichos con iluminación LED" },
  { foto: "impermeabilizacion-azotea", tipo: "impermeabilizacion", texto: "Azotea impermeabilizada" },
  { foto: "impermeabilizacion-resane", tipo: "impermeabilizacion", texto: "Resane antes de impermeabilizar" },
  { foto: "impermeabilizacion-techo", tipo: "impermeabilizacion", texto: "Techo impermeabilizado" },
  { foto: "pintura-recamara", tipo: "pintura", texto: "Recámara terminada" },
  { foto: "pintura-muro-detallado", tipo: "pintura", texto: "Muro con acabado decorativo" },
  { foto: "pintura-pasillo", tipo: "pintura", texto: "Pasillo con acabados" },
];
const NOMBRES_TIPO = { fontaneria: "Fontanería", electricidad: "Electricidad", pintura: "Pintura y detallado", impermeabilizacion: "Impermeabilización" };
const rutaFoto = (t, chica) => `img/trabajos/web/${t.foto}${chica ? "-640" : ""}.jpg`;

// Cada botón de WhatsApp lleva su propio mensaje (atributo data-wa)
document.querySelectorAll("[data-wa]").forEach((enlace) => {
  enlace.href = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(enlace.dataset.wa)}`;
});

// "Ver número": el teléfono solo aparece cuando una persona lo pide
const verNumero = document.getElementById("ver-numero");
if (verNumero) {
  verNumero.addEventListener("click", () => {
    const enlace = document.createElement("a");
    enlace.className = "tarjeta__dato";
    enlace.href = `tel:+${WHATSAPP}`;
    enlace.textContent = TELEFONO_VISIBLE;
    verNumero.replaceWith(enlace);
    enlace.focus();
  });
}

// Menú en celular
const menuBoton = document.getElementById("menu-boton");
const menu = document.getElementById("menu");

function cerrarMenu() {
  menu.classList.remove("abierto");
  menuBoton.setAttribute("aria-expanded", "false");
  menuBoton.setAttribute("aria-label", "Abrir menú");
}

menuBoton.addEventListener("click", () => {
  const abierto = menu.classList.toggle("abierto");
  menuBoton.setAttribute("aria-expanded", String(abierto));
  menuBoton.setAttribute("aria-label", abierto ? "Cerrar menú" : "Abrir menú");
});
menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", cerrarMenu));
document.addEventListener("keydown", (e) => { if (e.key === "Escape") cerrarMenu(); });

// Sombra del encabezado al bajar
const encabezado = document.getElementById("encabezado");
const ponerSombra = () => encabezado.classList.toggle("con-sombra", window.scrollY > 8);
window.addEventListener("scroll", ponerSombra, { passive: true });
ponerSombra();

// Galería: tarjetas de foto (con "skeleton" mientras cargan)
function tarjetaFoto(t, i) {
  return `
    <figure class="aparecer" data-tipo="${t.tipo}">
      <button class="foto" type="button" data-indice="${i}" aria-label="Ver en grande: ${t.texto}">
        <img src="${rutaFoto(t, true)}" alt="${t.texto}" loading="lazy" width="640" height="480">
      </button>
      <figcaption><span class="galeria__tipo galeria__tipo--${t.tipo}">${NOMBRES_TIPO[t.tipo]}</span>${t.texto}</figcaption>
    </figure>`;
}
function marcarCargadas(zona) {
  zona.querySelectorAll("img").forEach((img) => {
    if (img.complete) img.classList.add("cargada");
    else img.addEventListener("load", () => img.classList.add("cargada"));
  });
}

// Página de trabajos: todas las fotos, con filtros
const galeria = document.getElementById("galeria");
if (galeria && TRABAJOS.length) {
  galeria.innerHTML = TRABAJOS.map(tarjetaFoto).join("");
  marcarCargadas(galeria);
  document.getElementById("galeria-vacia").hidden = true;

  const filtros = document.getElementById("filtros");
  if (filtros) {
    filtros.hidden = false;
    filtros.addEventListener("click", (e) => {
      const boton = e.target.closest("button[data-filtro]");
      if (!boton) return;
      filtros.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", String(b === boton)));
      const filtro = boton.dataset.filtro;
      galeria.querySelectorAll("figure").forEach((f) => {
        f.hidden = filtro !== "todos" && f.dataset.tipo !== filtro;
        if (!f.hidden) f.classList.add("visible");
      });
    });
  }
}

// Inicio: una muestra de 4 fotos que lleva a la galería
const muestra = document.getElementById("muestra");
if (muestra && TRABAJOS.length) {
  muestra.innerHTML = TRABAJOS.slice(0, 4).map(tarjetaFoto).join("");
  marcarCargadas(muestra);
  muestra.closest("section").hidden = false;
}

// Visor: ver una foto en grande, con flechas para pasar a la siguiente
const visor = document.getElementById("visor");
if (visor) {
  const visorImg = visor.querySelector("img");
  const visorTexto = visor.querySelector("figcaption");
  let actual = 0, visibles = [];

  const mostrar = (i) => {
    actual = (i + visibles.length) % visibles.length;
    const t = TRABAJOS[visibles[actual]];
    visorImg.classList.remove("cargada");
    visorImg.src = rutaFoto(t, false);
    visorImg.alt = t.texto;
    visorTexto.textContent = `${t.texto} · ${NOMBRES_TIPO[t.tipo]}`;
  };
  visorImg.addEventListener("load", () => visorImg.classList.add("cargada"));

  document.addEventListener("click", (e) => {
    const boton = e.target.closest(".foto[data-indice]");
    if (!boton) return;
    // Solo se recorren las fotos que se ven (respeta el filtro)
    visibles = [...document.querySelectorAll(".foto[data-indice]")]
      .filter((b) => !b.closest("figure").hidden)
      .map((b) => Number(b.dataset.indice));
    visibles = [...new Set(visibles)];
    mostrar(visibles.indexOf(Number(boton.dataset.indice)));
    visor.showModal();
  });
  visor.querySelector(".visor__cerrar").addEventListener("click", () => visor.close());
  visor.querySelector(".visor__anterior").addEventListener("click", () => mostrar(actual - 1));
  visor.querySelector(".visor__siguiente").addEventListener("click", () => mostrar(actual + 1));
  visor.addEventListener("click", (e) => { if (e.target === visor) visor.close(); });
  visor.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") mostrar(actual - 1);
    if (e.key === "ArrowRight") mostrar(actual + 1);
  });
}

// Animación suave al aparecer en pantalla
const observador = new IntersectionObserver((entradas) => {
  entradas.forEach((entrada) => {
    if (entrada.isIntersecting) {
      entrada.target.classList.add("visible");
      observador.unobserve(entrada.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll(".aparecer").forEach((el) => observador.observe(el));

// Año del pie de página
document.getElementById("anio").textContent = new Date().getFullYear();
