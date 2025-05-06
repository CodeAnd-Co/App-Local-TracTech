/**
 * Inserta un fragmento HTML en un contenedor dado por ID.
 *
 * @param {string} idContenedor - ID del elemento donde se insertará el HTML.
 * @param {string} url - Ruta del archivo HTML a cargar.
 * @param {Function} [llamada] - Función a ejecutar tras la inserción del HTML.
 */
function incluirHTML(idContenedor, url, llamada) {
  fetch(url)
    .then(res => res.text())
    .then(html => {
      document.getElementById(idContenedor).innerHTML = html;
      if (llamada) llamada();
    })
    .catch(error => {
      console.warn(`Error al cargar ${url}: `, error);
    });
}

// Inserción de componentes una vez cargado el DOM
window.addEventListener('DOMContentLoaded', () => {
  incluirHTML(
    'contenedorBarraLateral',
    '../vistas/sideBar.html',
    () => {
      inicializarBarraLateral();
    }
  );
  incluirHTML('contenedorBarraSuperior', '../vistas/topBar.html');
});
