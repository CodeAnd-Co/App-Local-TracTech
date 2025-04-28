// RF45 - Usuario elimina el Excel cargado - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF45

/**
 * Elimina el archivo Excel actualmente cargado de la aplicación.
 * Limpia los datos relacionados del localStorage y actualiza la interfaz de usuario.
 * @returns {void}
 */
function borrarExcel() {
    const nombreArchivo = localStorage.getItem('nombreArchivoExcel');
    if (nombreArchivo) {
        console.log(`Eliminando archivo: ${nombreArchivo}`);
        
        // Limpiar el nombre del archivo de localStorage
        localStorage.removeItem('datosExcel');
        localStorage.removeItem('nombreArchivoExcel');
        
        // Actualizar la interfaz de usuario si es necesario
        const elementoNombreArchivo = document.querySelector('.texto-archivo');
        if (elementoNombreArchivo) {
            elementoNombreArchivo.textContent = 'Sin Archivo Seleccionado';
        }
    } else {
        console.log('No hay archivo para eliminar.');
    }
}

module.exports = {
    borrarExcel,
};