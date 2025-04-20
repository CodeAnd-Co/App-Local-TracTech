function cargarModulo(seccion) {
  const rutaModulo = {
    inicio:      "../vistas/moduloInicio.html",
    analisis:    "../vistas/moduloAnalisis.html",
    plantillas:  "../vistas/moduloPlantillas.html",
    formulas:    "../vistas/moduloFormulas.html",
    envios:      "../vistas/moduloEnvios.html",
    usuario:     "../vistas/moduloUsuario.html"
    // tema no va aquí
  };

  const contenedor = document.querySelector(".ventana-principal");

  if (contenedor && rutaModulo[seccion]) {
    fetch(rutaModulo[seccion])
      .then(res => res.text())
      .then(html => {
        contenedor.innerHTML = html;
        
        // Inicializar el módulo según la sección
        if (seccion === 'inicio') {
          if (window.cambiarNombreArchivo) {
            window.cambiarNombreArchivo();
          }
          if (window.configurarBotonAnalisis) {
            window.configurarBotonAnalisis();
          }
        } else if (seccion === 'analisis') {
          if (window.inicializarModuloAnalisis) {
            // Recuperar datos del localStorage si existen
            const datosExcel = JSON.parse(localStorage.getItem('datosExcel') || 'null');
            window.inicializarModuloAnalisis(datosExcel);
          }
        }
        // Añadir más inicializaciones para otros módulos según sea necesario
      })
      .catch(err => {
        console.error("Error al cargar el módulo:", err);
      });
  }
}
const topbarInfo = {
  inicio:    { titulo: "Inicio",     icono: "../utils/iconos/Casa.svg" },
  analisis:  { titulo: "Análisis",   icono: "../utils/iconos/GraficaBarras.svg" },
  plantillas:{ titulo: "Plantillas", icono: "../utils/iconos/Portapapeles.svg" },
  formulas:  { titulo: "Fórmulas",   icono: "../utils/iconos/Funcion.svg" },
  envios:    { titulo: "Envíos",     icono: "../utils/iconos/Correo.svg" },
  usuario:   { titulo: "Usuario",    icono: "../utils/iconos/Usuario.svg" }
};

function inicializarSidebar() {
  const btnCollapse = document.getElementById('collapse-button');
  const btnExpand = document.getElementById('expand-button');
  const sidebarExpanded = document.getElementById('sidebar-expanded');
  const sidebarCollapsed = document.getElementById('sidebar-collapsed');

  if (btnCollapse && btnExpand && sidebarExpanded && sidebarCollapsed) {
    btnCollapse.addEventListener('click', () => {
      sidebarExpanded.style.display = 'none';
      sidebarCollapsed.style.display = 'flex';
      aplicarActivoDesdeStorage();
    });

    btnExpand.addEventListener('click', () => {
      sidebarCollapsed.style.display = 'none';
      sidebarExpanded.style.display = 'flex';
      aplicarActivoDesdeStorage();
    });
  }

  activarBotonesSidebar();
  aplicarActivoDesdeStorage();
}

function activarBotonesSidebar() {
  const botones = document.querySelectorAll('.boton-sidebar');

  botones.forEach(boton => {
    boton.addEventListener('click', () => {
      const seccion = boton.getAttribute('data-seccion');
      if (!seccion) return;

      if (seccion === "tema") {
        // Aquí más adelante activaremos modo oscuro/claro
        return;
      }

      // Quitar "activo" de todos
      const todosBotones = document.querySelectorAll('.boton-sidebar');
      todosBotones.forEach(b => b.classList.remove('activo'));

      // Marcar como activo el actual (en ambas versiones del sidebar)
      const coincidentes = document.querySelectorAll(`.boton-sidebar[data-seccion="${seccion}"]`);
      coincidentes.forEach(b => b.classList.add('activo'));

      // Guardar sección activa
      localStorage.setItem('seccion-activa', seccion);

      // Actualizar topbar y cargar contenido
      actualizarTopbar(seccion);
      cargarModulo(seccion);
    });
  });
}

function aplicarActivoDesdeStorage() {
  const seccion = localStorage.getItem('seccion-activa');
  const todosBotones = document.querySelectorAll('.boton-sidebar');
  todosBotones.forEach(b => b.classList.remove('activo'));

  if (!seccion || seccion === "tema") return;

  const botonesCoincidentes = document.querySelectorAll(`.boton-sidebar[data-seccion="${seccion}"]`);
  botonesCoincidentes.forEach(b => b.classList.add('activo'));

  actualizarTopbar(seccion);
  cargarModulo(seccion);
}

function actualizarTopbar(seccion) {
  const tituloElem = document.getElementById('topbar-titulo');
  const iconoElem = document.getElementById('topbar-icono');
  const botonRegresar = document.getElementById('btn-regresar');

  if (!tituloElem || !iconoElem || !topbarInfo[seccion]) return;

  // Cambiar título e ícono
  tituloElem.textContent = topbarInfo[seccion].titulo;
  iconoElem.src = topbarInfo[seccion].icono;

  // Ocultar botón de regresar para ciertas secciones
  const seccionesSinRegresar = ["inicio", "envios", "plantillas", "usuario"];
  if (seccionesSinRegresar.includes(seccion)) {
    botonRegresar.style.display = "none";
    tituloElem.style.marginLeft = "0px";
  } else {
    botonRegresar.style.display = "flex";
    tituloElem.style.marginLeft = "10px";
  }
}

window.actualizarTopbar = actualizarTopbar;