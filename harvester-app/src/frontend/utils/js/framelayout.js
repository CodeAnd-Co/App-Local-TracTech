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

  // Llamadas para insertar los componentes
  window.addEventListener("DOMContentLoaded", () => {
    incluirHTML("sidebar-wrapper-container", "../vistas/sidebar.html", () => {
      inicializarSidebar(); // Ejecuta el script una vez insertado el sidebar
      inicializarTema();
    });

    incluirHTML("topbar-container", "../vistas/topBar.html");
  });
