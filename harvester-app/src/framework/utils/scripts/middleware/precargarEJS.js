const {app} = require('electron');
const ejs = require('ejs');
const path = require('node:path');
const fs = require('fs');
const { verificarPermisos } = require('../../scripts/middleware/auth');
 
/**
 * Convierte la vista en EJS a un archivo HTML ya renderizado.
 * @param {string} ruta - Ruta del archivo EJS a renderizar.
 * @returns {Promise<string>} Promesa que resuelve a la ruta del archivo HTML temporal generado.
 * @throws {Error} Si hay un error durante el renderizado del archivo EJS.
 */
function precargarEJS(ruta, parametros = {}){
    return new Promise((resolver, rechazar) => {
      // Obtenemos la ruta absoluta -> harvester-app/
      const rutaBase = `${__dirname}`.replace(/\\/g, '/').split('src/')[0]

      // Guardar la vista renderizada en AppData
      const rutaTemporal = path.join(app.getPath('userData'), 'temp.html');

      const datos = {
        rutaBase,
        ...parametros,
        verificarPermisos, // Pasar la función de verificación de permisos
      };

      ejs.renderFile(ruta, datos, (error, archivo) => {
        if (error) {
          rechazar(error);
          return;
        }

      // Guarda el HTML generado en un archivo temporal
      fs.writeFileSync(rutaTemporal, archivo);
      resolver(rutaTemporal);
    });
  });
}


module.exports = {precargarEJS}