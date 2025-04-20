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
            } else {
                elementoNombreArchivo.textContent = 'Sin Archivo Seleccionado';
            }
        }
        
        // Solo usamos addEventListener, no también onchange
        entradaArchivo.addEventListener('change', manejarCambioArchivo);
        
        console.log("Listeners para cambio de archivo configurados");
    }, 100);
}