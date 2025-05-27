const { shell } = require('electron');
const { mostrarAlertaConfirmacion,
    mostrarAlerta
 } = require(`${rutaBase}src/framework/vistas/includes/componentes/moleculas/alertaSwal/alertaSwal.js`);

/**
 * Debes utilizar la URL del encabezado del manual de usuario.
 * Se obtiene haciendo clic derecho en el encabezado del manual de usuario y seleccionando "Copiar vínculo del encabezado".
 */

/**
 * @function abrirAyudaExterna
 * @description Abre una URL de ayuda externa en el navegador predeterminado del usuario.
 * @param {string} url - La URL de la ayuda externa que se desea abrir.
 * @returns {void}
 */
async function abrirAyudaExterna(url) {
  if (!url) {
    mostrarAlerta('Error', 'No se ha proporcionado una URL válida para la ayuda externa.', 'error');
    return;
  }
  const data = await mostrarAlertaConfirmacion(
    'Abrir documentación externa',
    '¿Desea abrirla en su navegador predeterminado?',
    'question'
  )
  if (data === true) {
    shell.openExternal(url)
    return;
  }
  return;
}


module.exports = {
  abrirAyudaExterna
};