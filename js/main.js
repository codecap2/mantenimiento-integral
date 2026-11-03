// Mantenimientos Integrales · comportamiento de la página
document.documentElement.classList.add("js");

// El número no aparece escrito completo en el código para que los robots que
// recolectan teléfonos de páginas web no lo encuentren fácil.
const PARTES = ["0465", "570", "449", "52"];
const WHATSAPP = PARTES.slice().reverse().join("");
const TELEFONO_VISIBLE = `${PARTES[2]} ${PARTES[1]} ${PARTES[0]}`;

// Fotos de trabajos. Para agregar una: guarda la foto en img/trabajos/ y añade una línea aquí.
// Ejemplo: { foto: "img/trabajos/bano-1.jpg", texto: "Remodelación de baño" },
const TRABAJOS = [
];

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

// Galería (solo en la página de trabajos)
const galeria = document.getElementById("galeria");
if (galeria && TRABAJOS.length) {
  galeria.innerHTML = TRABAJOS.map((t) => `
    <figure class="aparecer">
      <div class="foto"><img src="${t.foto}" alt="${t.texto}" loading="lazy" width="800" height="600"></div>
      <figcaption>${t.texto}</figcaption>
    </figure>`).join("");
  galeria.querySelectorAll("img").forEach((img) => {
    if (img.complete) img.classList.add("cargada");
    else img.addEventListener("load", () => img.classList.add("cargada"));
  });
  document.getElementById("galeria-vacia").hidden = true;
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
