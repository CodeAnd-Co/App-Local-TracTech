/**
 * Configura el cambio de nombre del archivo cuando se selecciona uno
 */
function cambiarNombreArchivo() {
    // Esperamos un breve momento para asegurarnos de que el DOM está completamente cargado
    setTimeout(() => {
        // Obtenemos el elemento input de tipo file
        const entradaArchivo = document.querySelector('.cargar-input');
        // Obtenemos el elemento donde mostraremos el nombre del archivo
        const elementoNombreArchivo = document.querySelector('.texto-archivo');

        const botonAnalisis = document.querySelector('.avanzar-analisis');
        
        // Verificamos que los elementos existan antes de agregar el event listener
        if (entradaArchivo && elementoNombreArchivo) {
            
            // Eliminamos cualquier event listener anterior para evitar duplicados
            entradaArchivo.removeEventListener('change', manejarCambioArchivo);
            
            // Definimos la función manejadora fuera para poder removerla si es necesario
            function manejarCambioArchivo(e) {
                
                // Comprobamos si se ha seleccionado algún archivo
                if (entradaArchivo.files && entradaArchivo.files.length > 0) {
                    // Obtenemos el nombre del archivo seleccionado
                    const nombreArchivo = entradaArchivo.files[0].name;
                    
                    // Actualizamos el texto con el nombre del archivo
                    elementoNombreArchivo.textContent = nombreArchivo;

                    // Habilitamos boton para ir al analisis
                    botonAnalisis.removeAttribute('disabled');
                } else {
                    // Si no hay archivo seleccionado, mostramos el texto predeterminado
                    elementoNombreArchivo.textContent = 'Sin Archivo Seleccionado';
                }
            }
            
            // Añadimos el event listener con la función definida
            entradaArchivo.addEventListener('change', manejarCambioArchivo);
            
            // También podemos probar con un enfoque alternativo para asegurarnos:
            entradaArchivo.onchange = manejarCambioArchivo;

        } else {
            console.error("No se encontraron los elementos necesarios:");
            console.error("- entradaArchivo:", entradaArchivo);
            console.error("- elementoNombreArchivo:", elementoNombreArchivo);
        }
    }, 100); // Un pequeño retraso para asegurar que el DOM está listo
}