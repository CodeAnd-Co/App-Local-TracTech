const { shell } = require('electron');
const { mostrarAlertaConfirmacion,
    mostrarAlerta} = require(`${rutaBase}src/framework/vistas/includes/componentes/moleculas/alertaSwal/alertaSwal.js`);

/**
 * Debes utilizar la URL del encabezado del manual de usuario.
 * Se obtiene haciendo clic derecho en el encabezado del manual de usuario y seleccionando "Copiar vínculo del encabezado".
 * ES MUY IMPORTANTE UTILIZAR UNA FUNCION ASÍNCRONA PARA QUE SÍ ESPERE LA RESPUESTA DEL USUARIO.
 * 
 * Un ejemplo de su uso es:
 * document.getElementById('btnAyuda').addEventListener('click', async () => {
     await abrirAyudaExterna('https://docs.google.com/document/d/14tKDIFsQO1i_32oEwaGaE7u8hHv3pcdb3frWU7vJ9M8/edit?tab=t.0#heading=h.ldire7zbv2f')
 * });
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