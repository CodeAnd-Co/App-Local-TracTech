// RF44 Usuario carga Excel a la plataforma - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF44
// RF46 Usuario sustituye el Excel cargado - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF46

const XLSX = require('xlsx');

/**
 * Verifica si un archivo Excel es potencialmente malicioso
 * @param {File} archivo - Objeto File seleccionado por el usuario
 * @returns {Promise<{esSeguro: boolean, mensaje: string}>} Resultado de la verificación
 */
async function verificarArchivoSeguro(archivo) {
    // Verificar extensión del archivo
    const extensionesPermitidas = ['xlsx',];
    const extension = archivo.name.split('.').pop().toLowerCase();
    
    if (!extensionesPermitidas.includes(extension)) {
        return { 
            esSeguro: false, 
            mensaje: 'Formato de archivo no permitido. Solo se permiten archivos Excel (.xlsx).' 
        };
    }
    
    // Verificar tamaño del archivo (limitar a 10MB)
    const tamanioMaximoBytes = 10 * 1024 * 1024; // 10MB
    if (archivo.size > tamanioMaximoBytes) {
        return { 
            esSeguro: false, 
            mensaje: 'El archivo es demasiado grande. El tamaño máximo permitido es 10MB.' 
        };
    }
    
    // Verificar estructura básica del archivo y buscar macros VBA
    try {
        const buffer = await archivo.arrayBuffer();
        const datos = new Uint8Array(buffer);
        const libro = XLSX.read(datos, { type: 'array' });
        
        // Verificar si tiene macros VBA (característica potencialmente peligrosa)
        if (libro.vbaraw) {
            return { 
                esSeguro: false, 
                mensaje: 'El archivo contiene macros VBA que podrían ser inseguras.' 
            };
        }
        
        // Verificar que tenga al menos una hoja de trabajo
        if (!libro.SheetNames || libro.SheetNames.length === 0) {
            return { 
                esSeguro: false, 
                mensaje: 'El archivo no parece ser un documento Excel válido.' 
            };
        }
        
        // Si pasó todas las verificaciones
        return { esSeguro: true, mensaje: 'Archivo verificado correctamente' };
        
    } catch (error) {
        console.error('Error verificando archivo:', error);
        return { 
            esSeguro: false, 
            mensaje: 'Error al verificar el archivo. Es posible que esté dañado o no sea un Excel válido.' 
        };
    }
}


/**
 * Lee y procesa un archivo Excel para almacenar sus datos en el localStorage.
 * @param {File} archivo - Objeto File seleccionado por el usuario.
 * @returns {Promise<{exito: boolean, mensaje: string}>} Resultado de la operación
 */
async function leerExcel(archivo) {
    try {
        // Verificar seguridad del archivo
        const verificacion = await verificarArchivoSeguro(archivo);
        
        if (!verificacion.esSeguro) {
            // Retornar el resultado de la verificación sin mostrar alertas
            return { 
                exito: false, 
                mensaje: verificacion.mensaje
            };
        }

        // Si el archivo es seguro, proceder con la lectura
        return new Promise((resolve, reject) => {
            const lector = new FileReader();
            
            lector.onload = function(evento) {
                try {
                    const datos = new Uint8Array(evento.target.result);
                    const libro = XLSX.read(datos, { type: 'array' });
                    
                    // Procesamos todas las hojas del Excel
                    const todasLasHojas = {};
                    
                    // Recorremos cada nombre de hoja en el libro
                    libro.SheetNames.forEach(nombreHoja => {
                        // Obtenemos la hoja por su nombre
                        const hoja = libro.Sheets[nombreHoja];
                        // Convertimos la hoja a JSON
                        const datosHojaJSON = XLSX.utils.sheet_to_json(hoja, { header: 1 });
                        // Almacenamos los datos usando el nombre de la hoja como clave
                        todasLasHojas[nombreHoja] = datosHojaJSON;
                    });
                    
                    // Incluimos metadatos útiles
                    const datosCompletos = {
                        nombreArchivo: archivo.name,
                        hojas: todasLasHojas,
                    };
                    
                    // Guardar los datos en localStorage con la nueva estructura
                    localStorage.setItem('datosExcel', JSON.stringify(datosCompletos));
                    localStorage.setItem('nombreArchivoExcel', archivo.name);
                    
                    resolve({
                        exito: true,
                        mensaje: 'Archivo procesado correctamente'
                    });
                    
                } catch (error) {
                    console.error('Error al leer el archivo Excel:', error);
                    reject({
                        exito: false,
                        mensaje: 'Error al procesar el archivo Excel. Verifica que sea un archivo válido.'
                    });
                }
            };
            
            lector.onerror = function(error) {
                console.error('Error al leer el archivo:', error);
                reject({
                    exito: false,
                    mensaje: 'Error al leer el archivo. Inténtalo de nuevo.'
                });
            };
            
            // Iniciamos la lectura del archivo como ArrayBuffer
            lector.readAsArrayBuffer(archivo);
        });
        
    } catch (error) {
        console.error('Error en la verificación del archivo:', error);
        return { 
            exito: false, 
            mensaje: 'Error al verificar el archivo. Es posible que esté dañado.'
        };
    }
}

module.exports = {
    leerExcel,
}