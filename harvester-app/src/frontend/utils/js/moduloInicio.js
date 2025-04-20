/**
 * Configura el cambio de nombre del archivo cuando se selecciona uno
 */
function cambiarNombreArchivo() {
    // Esperamos a que el DOM esté completamente cargado
    setTimeout(() => {
        const entradaArchivo = document.querySelector('.cargar-input');
        const elementoNombreArchivo = document.querySelector('.texto-archivo');
        const botonAnalisis = document.querySelector('.avanzar-analisis');
        
        if (!entradaArchivo || !elementoNombreArchivo) {
            return console.error("No se encontraron los elementos necesarios");
        }
        
        // Usamos un solo método para manejar el cambio
        function manejarCambioArchivo() {
            if (entradaArchivo.files && entradaArchivo.files.length > 0) {
                elementoNombreArchivo.textContent = entradaArchivo.files[0].name;
                botonAnalisis.removeAttribute('disabled');
                localStorage.setItem('nombreArchivoExcel', entradaArchivo.files[0].name);
            } else {
                elementoNombreArchivo.textContent = 'Sin Archivo Seleccionado';
            }
        }
        
        // Solo usamos addEventListener, no también onchange
        entradaArchivo.addEventListener('change', manejarCambioArchivo);
        
        console.log("Listeners para cambio de archivo configurados");
    }, 100);
}

function configurarBotonAnalisis() {
    setTimeout(() => {
        const botonAnalisis = document.querySelector('.avanzar-analisis');
        const entradaArchivo = document.querySelector('.cargar-input');
        
        if (botonAnalisis && entradaArchivo) {
            botonAnalisis.addEventListener('click', () => {
                if (entradaArchivo.files && entradaArchivo.files.length > 0) {
                    const archivo = entradaArchivo.files[0];
                    
                    // Guardar el nombre del archivo para usarlo en el módulo de análisis
                    localStorage.setItem('nombreArchivoExcel', archivo.name);
                    
                    // Leer el archivo Excel
                    leerArchivoExcel(archivo);
                    
                    // Actualizar la sidebar y el estado activo
                    actualizarSidebarActivo('analisis');
                }
            });
        }
    }, 100);
}

function actualizarSidebarActivo(seccion) {
    // Guardar sección activa en localStorage
    localStorage.setItem('seccion-activa', seccion);
    
    // Quitar "activo" de todos los botones
    const todosBotones = document.querySelectorAll('.boton-sidebar');
    if (todosBotones) {
        todosBotones.forEach(b => b.classList.remove('activo'));
    }
    
    // Marcar como activo los botones que coincidan con la sección
    const botonesCoincidentes = document.querySelectorAll(`.boton-sidebar[data-seccion="${seccion}"]`);
    if (botonesCoincidentes) {
        botonesCoincidentes.forEach(b => b.classList.add('activo'));
    }
    
    // También actualizar el topbar
    if (window.actualizarTopbar) {
        window.actualizarTopbar(seccion);
    }
}

function leerArchivoExcel(archivo) {
    // Mostramos indicador de carga si quieres
    const elementoNombreArchivo = document.querySelector('.texto-archivo');
    if (elementoNombreArchivo) {
        elementoNombreArchivo.textContent = 'Leyendo archivo...';
    }
    
    const lector = new FileReader();
    lector.onload = function(e) {
        try {
            const datos = new Uint8Array(e.target.result);
            const libro = XLSX.read(datos, { type: 'array' });
            
            // Procesamos los datos del Excel
            const primeraHoja = libro.SheetNames[0];
            const hoja = libro.Sheets[primeraHoja];
            const datosJSON = XLSX.utils.sheet_to_json(hoja, { header: 1 });

            // Guardar los datos en localStorage para que persistan entre cambios de módulo
            localStorage.setItem('datosExcel', JSON.stringify(datosJSON));
            
            // Navegamos al módulo de análisis con los datos
            cargarModulo('analisis', datosJSON);
            
        } catch (error) {
            console.error("Error al leer el archivo Excel:", error);
            alert("Error al procesar el archivo Excel. Verifica que sea un archivo válido.");
        }
    };
    
    lector.onerror = function() {
        console.error("Error al leer el archivo");
        alert("Error al leer el archivo. Inténtalo de nuevo.");
    };
    
    // Iniciamos la lectura del archivo
    lector.readAsArrayBuffer(archivo);
}

window.cambiarNombreArchivo = cambiarNombreArchivo;
window.configurarBotonAnalisis = configurarBotonAnalisis;