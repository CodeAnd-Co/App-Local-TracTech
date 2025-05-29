/**
 * @function filtrarFormulas
 * @description Filtra las fórmulas mostradas basándose en el texto de búsqueda
 * @param {string} textoBusqueda - El texto a buscar
 * @returns {void}
 */
function filtrarFormulas(textoBusqueda) {
    const frameFormulas = document.getElementById('frame-formulas');
    // Buscar los elementos que realmente existen en el HTML generado
    const filasFormulas = frameFormulas.querySelectorAll('.frame-f-rmulas');
    
    filasFormulas.forEach(fila => {
        // Obtener los divs de texto-usuario que contienen nombre y parámetros
        const textosUsuario = fila.querySelectorAll('.texto-usuario');
        
        if (textosUsuario.length >= 2) {
            const textoNombre = textosUsuario[0].textContent.toLowerCase();
            
            // Buscar solo en el nombre
            if (textoBusqueda === '' || textoNombre.includes(textoBusqueda)) {
                fila.style.display = 'flex';
            } else {
                fila.style.display = 'none';
            }
        }
    });
}

module.exports = {
    filtrarFormulas
};