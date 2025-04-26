// RF45 Usuario elimina el Excel cargado - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF45

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
    };
}

module.exports = {
    borrarExcel,
};