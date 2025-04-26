function inicializarModuloUsuario() {
    const botonGestion = document.querySelector("#botonGestion");

    if (botonGestion) {
        botonGestion.addEventListener("click", async () => {
            console.log("Cargando el módulo de gestión de usuarios...");

            // Actualizamos el localStorage SOLO cuando se hace clic
            localStorage.setItem('seccion-activa', 'gestionUsuarios');

            const ventanaPrincipal = document.getElementById('ventana-principal');
            if (ventanaPrincipal) {
                fetch('../vistas/moduloGestionUsuarios.html')
                    .then(res => res.text())
                    .then(html => {
                        ventanaPrincipal.innerHTML = html;
                    })
                    .catch(err => console.error("Error cargando módulo de gestión de usuarios:", err));
            }
        });
    } else {
        console.error("El botón de gestión de usuarios no se encontró en el DOM.");
    }
}

window.inicializarModuloUsuario = inicializarModuloUsuario;
