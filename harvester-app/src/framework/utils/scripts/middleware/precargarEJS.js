  /**
 * Convierte la vista en ejs a un archivo de html ya renderizado.
 * @returns {rutaTemporal<string>} Ruta del html procesado.
 */
  
const {app, ipcRenderer} = require('electron');
const ejs = require('ejs');
const path = require('node:path');
const fs = require('fs');
 



function precargarEJS(ruta){
    return new Promise((resolve, reject) => {
        const rutaBase = `${__dirname}`.replace(/\\/g, '/').split('src/')[0]

        ejs.renderFile(ruta, {  rutaBase: rutaBase }, (err, archivo) => {
            if (err) {
                reject(err);
                return;
            }

        
            // Guarda el HTML generado en un archivo temporal
            const rutaTemporal = path.join(app.getPath('userData'), 'temp.html');
            fs.writeFileSync(rutaTemporal, archivo);
            resolve(rutaTemporal);

      });
    });

  }

  module.exports = {precargarEJS}