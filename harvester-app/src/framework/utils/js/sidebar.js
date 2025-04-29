function cargarModulo(seccion) {
  const rutaModulo = {
    inicio:      "../vistas/moduloInicio.html",
    analisis:    "../vistas/moduloAnalisis.html",
    plantillas:  "../vistas/moduloPlantillas.html",
    formulas:    "../vistas/moduloFormulas.html",
    envios:      "../vistas/moduloEnvios.html",
    usuario:     "../vistas/moduloUsuario.html",
    gestionUsuarios:     "../vistas/moduloGestionUsuarios.html"
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
          if (window.botonCargar) {
            window.botonCargar();
          }
          if (window.botonAnalisis) {
            window.botonAnalisis();
          }
          if (window.botonBorrar) {
            window.botonBorrar();
          }
        } else if (seccion === 'analisis') {
          if (window.cargarDatosExcel) {
            window.cargarDatosExcel();
          }
        } else if (seccion === 'plantillas'){
          if (window.inicializarModuloPlantillas) {
            window.inicializarModuloPlantillas();
          }
        } else if (seccion == 'usuario') {
          if (window.inicializarModuloUsuario) {
            window.inicializarModuloUsuario();
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
  usuario:   { titulo: "Usuario",    icono: "../utils/iconos/Usuario.svg" },
  gestionUsuarios:   { titulo: "Usuario",    icono: "../utils/iconos/Usuario.svg" }
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
  
  // Siempre iniciar en el módulo "inicio"
  localStorage.setItem('seccion-activa', 'inicio');
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

      // Guardamos la sección real
      localStorage.setItem('seccion-activa', seccion);
      console.log("Sección activa guardada:", seccion);

      // Determinar cuál botón mostrar como activo visualmente
      const seccionVisual = seccion === 'gestionUsuarios' ? 'usuario' : seccion;

      // Quitar "activo" de todos los botones
      document.querySelectorAll('.boton-sidebar').forEach(boton => boton.classList.remove('activo'));

      // Activar el botón visualmente representativo
      document.querySelectorAll(`.boton-sidebar[data-seccion="${seccionVisual}"]`)
        .forEach(boton => boton.classList.add('activo'));

      // Actualizar topbar y cargar el contenido real
      actualizarTopbar(seccion);
      cargarModulo(seccion);
    });
  });
}


function aplicarActivoDesdeStorage() {
  const seccion = localStorage.getItem('seccion-activa');
  const todosBotones = document.querySelectorAll('.boton-sidebar');
  todosBotones.forEach(boton => boton.classList.remove('activo'));

  if (!seccion || seccion === "tema") return;

  const seccionVisual = seccion === "gestionUsuarios" ? "usuario" : seccion;

  const botonesCoincidentes = document.querySelectorAll(`.boton-sidebar[data-seccion="${seccionVisual}"]`);
  botonesCoincidentes.forEach(boton => boton.classList.add('activo'));

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