// RF44 Usuario carga Excel a la plataforma - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF44
// RF46 Usuario sustituye el Excel cargado - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF46

const XLSX = require('xlsx');

function leerExcel(archivo) {
    // Mostramos indicador de carga si quieres
    const elementoNombreArchivo = document.querySelector('.texto-archivo');
    if (elementoNombreArchivo) {
        elementoNombreArchivo.textContent = 'Leyendo archivo...';
    }

    // Guardar el nombre del archivo para usarlo en el módulo de análisis
    localStorage.setItem('nombreArchivoExcel', archivo.name);

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
            
            if (elementoNombreArchivo) {
                elementoNombreArchivo.textContent = archivo.name;
            }

        } catch (error) {
            console.error("Error al leer el archivo Excel:", error);
            alert("Error al procesar el archivo Excel. Verifica que sea un archivo válido.");
            
            if (elementoNombreArchivo) {
                elementoNombreArchivo.textContent = 'Error al leer el archivo';
            }
        }
    };
    
    lector.onerror = function() {
        console.error("Error al leer el archivo");
        alert("Error al leer el archivo. Inténtalo de nuevo.");
        
        if (elementoNombreArchivo) {
            elementoNombreArchivo.textContent = 'Error al leer el archivo';
        }
    };
    
    // Iniciamos la lectura del archivo
    lector.readAsArrayBuffer(archivo);
}

module.exports = {
    leerExcel,
}