  function incluirHTML(id, url, callback) {
    fetch(url)
      .then(res => res.text())
      .then(html => {
        document.getElementById(id).innerHTML = html;
        if (callback) callback(); // 👈 Ejecuta la función si la mandas
      })
      .catch(err => {
        console.warn("Error al cargar " + url + ": ", err);
      });
  }

  function cargarModuloInicio() {
    incluirHTML("ventana-principal", "../vistas/ModuloInicio.html", () => {
      // Inicializar el módulo después de cargarlo
      cambiarNombreArchivo();
    });
  }


  // Llamadas para insertar los componentes
  window.addEventListener("DOMContentLoaded", () => {
    incluirHTML("sidebar-wrapper-container", "../vistas/sidebar.html", () => {
      inicializarSidebar();
    });

    incluirHTML("topbar-container", "../vistas/topBar.html");
    
    // Carga el módulo de inicio
    cargarModuloInicio();
  });