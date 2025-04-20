const modulos = {
  inicio: {
    url: "../vistas/moduloInicio.html",
    init: () => {
      cambiarNombreArchivo();
    }
  },
  analisis: {
    url: "../vistas/moduloAnalisis.html",
    init: () => {
      // Aquí puedes inicializar el módulo de análisis
      console.log("Módulo de análisis cargado");
    }
  },
  plantillas: {
    url: "../vistas/moduloPlantillas.html",
    init: () => {
      // Aquí puedes inicializar el módulo de plantillas
      console.log("Módulo de plantillas cargado");
    }
  },
  envios: {
    url: "../vistas/moduloEnvios.html",
    init: () => {
      // Aquí puedes inicializar el módulo de envíos
      console.log("Módulo de envíos cargado");
    }
  },
  formulas: {
    url: "../vistas/moduloFormulas.html",
    init: () => {
      // Aquí puedes inicializar el módulo de fórmulas
      console.log("Módulo de fórmulas cargado");
    }
  },
  usuario: {
    url: "../vistas/moduloUsuario.html",
    init: () => {
      // Aquí puedes inicializar el módulo de usuario
      console.log("Módulo de usuario cargado");
    }
  },
  // otros módulos aquí...
};

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

function cargarModulo(nombre) {
  const modulo = modulos[nombre];
  if (!modulo) return console.error(`Módulo '${nombre}' no encontrado`);
  
  incluirHTML("ventana-principal", modulo.url, () => {
    if (typeof modulo.init === 'function') {
      modulo.init();
    }
  });
}

function cargarModuloInicio() {
  cargarModulo('inicio');
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