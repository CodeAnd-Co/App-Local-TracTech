function cargarModulo(seccion) {
  const rutaModulo = {
    inicio:      '../vistas/moduloInicio.html',
    analisis:    '../vistas/moduloAnalisis.html',
    plantillas:  '../vistas/moduloPlantillas.html',
    formulas:    '../vistas/moduloFormulas.html',
    envios:      '../vistas/moduloEnvios.html',
    usuario:     '../vistas/moduloUsuario.html',
    gestionUsuarios:     '../vistas/moduloGestionUsuarios.html',
    tractores:  '../vistas/moduloTractores.html'
    // tema no va aquí
  };

  const contenedor = document.querySelector('.ventana-principal');

  if (contenedor && rutaModulo[seccion]) {
    // Guardar la vista actual una la pila antes de cambiar
    const pila = JSON.parse(localStorage.getItem('vistaPila') || '[]');
    const vistaActual = localStorage.getItem('seccion-activa');
    if (vistaActual) {
      // Agregar la vista actual en la pila y gaurdarla en localStorage
      pila.push(vistaActual);
      localStorage.setItem('vistaPila', JSON.stringify(pila));
    }
    fetch(rutaModulo[seccion])
      .then(res => res.text())
      .then(html => {
        contenedor.innerHTML = html;

        actualizarTopbar(seccion);

        // Inicializar el módulo según la sección
        if (seccion === 'inicio') {
          if (window.botonCargar) {
            window.botonCargar();
          }
          if (window.botonTractores) {
            window.botonTractores();
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
        } else if (seccion == 'gestionUsuarios') {
          if (window.inicializarModuloGestionUsuarios) {
            window.inicializarModuloGestionUsuarios();
          }
        } else if (seccion == 'tractores') {
          if (window.inicializarModuloTractores) {
            window.inicializarModuloTractores();
          }
        }
        // Añadir más inicializaciones para otros módulos según sea necesario
      })
      .catch(err => {
        console.error('Error al cargar el módulo:', err);
      });
  }
}
const topbarInfo = {
  inicio:    { titulo: 'Inicio',     icono: '../utils/iconos/Casa.svg' },
  analisis:  { titulo: 'Análisis',   icono: '../utils/iconos/GraficaBarras.svg' },
  plantillas:{ titulo: 'Plantillas', icono: '../utils/iconos/Portapapeles.svg' },
  formulas:  { titulo: 'Fórmulas',   icono: '../utils/iconos/Funcion.svg' },
  envios:    { titulo: 'Envíos',     icono: '../utils/iconos/Correo.svg' },
  usuario:   { titulo: 'Usuario',    icono: '../utils/iconos/Usuario.svg' },
  gestionUsuarios:   { titulo: 'Usuario',    icono: '../utils/iconos/Usuario.svg' },
  tractores:   { titulo: 'Tractores',    icono: '../utils/iconos/GraficaBarras.svg' }
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

      if (seccion === 'tema') {
        // Aquí más adelante activaremos modo oscuro/claro
        return;
      }

      // Limpiar la pila de vistas al cambiar de sección desde la sidebar
      localStorage.removeItem('vistaPila');

      // Guardamos la sección real
      localStorage.setItem('seccion-activa', seccion);

      // Determinar cuál botón mostrar como activo visualmente
      const seccionVisual = seccion === 'gestionUsuarios' ? 'usuario' : seccion;

      // Quitar "activo" de todos los botones
      document.querySelectorAll('.boton-sidebar').forEach(boton => boton.classList.remove('activo'));

      // Activar el botón visualmente representativo
      document.querySelectorAll(`.boton-sidebar[data-seccion='${seccionVisual}']`)
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

  if (!seccion || seccion === 'tema') return;

  const seccionVisual = seccion === 'gestionUsuarios' ? 'usuario' : seccion;

  const botonesCoincidentes = document.querySelectorAll(`.boton-sidebar[data-seccion='${seccionVisual}']`);
  botonesCoincidentes.forEach(boton => boton.classList.add('activo'));

  actualizarTopbar(seccion);
  cargarModulo(seccion);
}

/** 
 * Actualiza el componente topbar con el nombre del modulo actual
 * 
 * @function actualizarTopbar
 * @param {string} seccion - Nombre de modulo que se actualiza en el topbar
 * @returns {void}
*/
function actualizarTopbar(seccion) {
  const tituloElem = document.getElementById('topbar-titulo');
  const iconoElem = document.getElementById('topbar-icono');
  const botonRegresar = document.getElementById('btn-regresar');
  console.log('Topbar actualizado para tractores')

  if (!tituloElem || !iconoElem || !topbarInfo[seccion]) return;

  // Cambiar título e ícono
  tituloElem.textContent = topbarInfo[seccion].titulo;
  iconoElem.src = topbarInfo[seccion].icono;

  // Ocultar botón de regresar para ciertas secciones
  const seccionesSinRegresar = ['inicio', 'envios', 'plantillas', 'usuario'];
  if (seccionesSinRegresar.includes(seccion)) {
    botonRegresar.style.display = 'none';
    tituloElem.style.marginLeft = '0px';
  } else {
    botonRegresar.style.display = 'flex';
    tituloElem.style.marginLeft = '10px';
    botonRegresar.onclick = () => {
      const pila = JSON.parse(localStorage.getItem('vistaPila') || '[]');
      if (pila.length > 0) {
        // Sacar la última vista, guardar la pila actualizada y estableces la vista anterior como activa
        const vistaAnterior = pila.pop();
        localStorage.setItem('vistaPila', JSON.stringify(pila));
        localStorage.setItem('seccion-activa', vistaAnterior);
        cargarModulo(vistaAnterior);

      }
    };    
  }
}

window.actualizarTopbar = actualizarTopbar;