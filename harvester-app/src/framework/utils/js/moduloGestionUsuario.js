// Función para inicializar el módulo de análisis
function inicializarModuloGestionUsuarios() {
    console.log("Módulo de Gestión de Usuarios inicializado");
  
    // Asegurar que el localStorage esté actualizado
    localStorage.setItem('seccion-activa', 'gestionUsuarios');
}

window.inicializarModuloGestionUsuarios = inicializarModuloGestionUsuarios;