/* eslint-disable no-unused-vars */

/**
 * Carga dinámicamente el contenido HTML de un módulo en el contenedor principal.
 *
 * @param {string} seccion - Identificador de la sección a cargar
 *   (p.ej., 'inicio', 'analisis', 'plantillas', 'formulas', 'envios', 'usuario', 'gestionUsuarios').
 * @returns {void}
 */
function cargarModulo(seccion) {
  const rutasModulo = {
    inicio:          '../vistas/moduloInicio.html',
    analisis:        '../vistas/moduloAnalisis.html',
    plantillas:      '../vistas/moduloPlantillas.html',
    formulas:        '../vistas/moduloFormulas.html',
    envios:          '../vistas/moduloEnvios.html',
    usuario:         '../vistas/moduloUsuario.html',
    gestionUsuarios: '../vistas/moduloGestionUsuarios.html',
    tractores:  '../vistas/moduloTractores.html'
  };

  const contenedorVentanaPrincipal = document.querySelector('.ventana-principal');

  if (contenedorVentanaPrincipal && rutasModulo[seccion]) {
    // Guardar la vista actual una la pila antes de cambiar
    const pila = JSON.parse(localStorage.getItem('vistaPila') || '[]');
    const vistaActual = localStorage.getItem('seccion-activa');
    if (vistaActual) {
      // Agregar la vista actual en la pila y guardarla en localStorage
      pila.push(vistaActual);
      localStorage.setItem('vistaPila', JSON.stringify(pila));
    }
    fetch(rutasModulo[seccion])
      .then(respuesta => respuesta.text())
      .then(html => {
        contenedorVentanaPrincipal.innerHTML = html;
        actualizarBarraSuperior(seccion);
        
        // Inicializar el módulo según la sección
        if (seccion === 'inicio') {
          if (window.botonCargar)    window.botonCargar();
          if (window.botonTractores)  window.botonTractores();
          if (window.botonBorrar)    window.botonBorrar();
        } else if (seccion === 'analisis') {
            if (window.cargarDatosExcel)           window.cargarDatosExcel();
            if (window.inicializarModuloAnalisis)  window.inicializarModuloAnalisis();
        } else if (seccion === 'plantillas') {
            if (window.inicializarModuloPlantillas) window.inicializarModuloPlantillas();
        } else if (seccion === 'usuario') {
            if (window.inicializarModuloUsuario)    window.inicializarModuloUsuario();
        } else if (seccion ==='formulas'){
          if (window.inicializarCrearFormula) window.inicializarCrearFormula();
        } else if (seccion === 'tractores') {
          if (window.inicializarModuloTractores) window.inicializarModuloTractores();
        // Añadir más inicializaciones para otros módulos según sea necesario
        }
      })
      .catch(error => {
        console.error('Error al cargar el módulo:', error);
      });
  }
}

/**
 * Mapa de configuración para la barra superior: títulos e íconos según sección.
 *
 * @constant {Object.<string, { titulo: string, icono: string }>}
 */
const infoBarraSuperior = {
  inicio:          { titulo: 'Inicio',     icono: '../utils/iconos/Casa.svg' },
  analisis:        { titulo: 'Análisis',   icono: '../utils/iconos/GraficaBarras.svg' },
  plantillas:      { titulo: 'Plantillas', icono: '../utils/iconos/Portapapeles.svg' },
  formulas:        { titulo: 'Fórmulas',   icono: '../utils/iconos/Funcion.svg' },
  envios:          { titulo: 'Envíos',     icono: '../utils/iconos/Correo.svg' },
  usuario:         { titulo: 'Usuario',    icono: '../utils/iconos/Usuario.svg' },
  gestionUsuarios: { titulo: 'Usuario',    icono: '../utils/iconos/Usuario.svg' },
  tractores:   { titulo: 'Tractores',    icono: '../utils/iconos/GraficaBarras.svg' }
};

/**
 * Inicializa la barra lateral: enlaza los botones de colapsar/expandir
 * y configura la navegación entre secciones.
 *
 * @returns {void}
 */
function inicializarBarraLateral() {
  const botonColapsar         = document.getElementById('botonColapsar');
  const botonExpandir         = document.getElementById('botonExpandir');
  const barraLateralExpandida = document.getElementById('barraLateralExpandida');
  const barraLateralColapsada = document.getElementById('barraLateralColapsada');

  if (botonColapsar && botonExpandir && barraLateralExpandida && barraLateralColapsada) {
    botonColapsar.addEventListener('click', () => {
      barraLateralExpandida.style.display = 'none';
      barraLateralColapsada.style.display = 'flex';
    });
    botonExpandir.addEventListener('click', () => {
      barraLateralColapsada.style.display = 'none';
      barraLateralExpandida.style.display = 'flex';
    });
  }

  activarBotonesBarraLateral();
  
  // Siempre iniciar en el módulo 'inicio'
  localStorage.setItem('seccion-activa', 'inicio');
  aplicarActivoDesdeAlmacenamiento();
}

/**
 * Añade listeners de navegación a los botones de la barra lateral.
 *
 * @returns {void}
 */
function activarBotonesBarraLateral() {
  const botonesSidebar = document.querySelectorAll('.boton-sidebar');

  botonesSidebar.forEach(boton => {
    boton.addEventListener('click', () => {
      const seccion = boton.getAttribute('data-seccion');
      if (!seccion || seccion === 'tema') return;

      // Guardamos la sección real
      localStorage.setItem('seccion-activa', seccion);

      // Determinar cuál botón mostrar como activo visualmente
      const seccionVisual = seccion === 'gestionUsuarios' ? 'usuario' : seccion;

      // Desactivar todos los botones
      botonesSidebar.forEach(botonItem => botonItem.classList.remove('activo'));

      // Activar el botón correspondiente
      document
        .querySelectorAll(`.boton-sidebar[data-seccion='${seccionVisual}']`)
        .forEach(botonItem => botonItem.classList.add('activo'));

      // Actualizar barra superior y cargar contenido
      actualizarBarraSuperior(seccion);
      cargarModulo(seccion);
    });
  });
}

/**
 * Marca el botón correspondiente según la sección activa almacenada en localStorage,
 * y carga la sección.
 *
 * @returns {void}
 */
function aplicarActivoDesdeAlmacenamiento() {
  const seccion             = localStorage.getItem('seccion-activa');
  const botonesSidebarTodos = document.querySelectorAll('.boton-sidebar');

  botonesSidebarTodos.forEach(botonItem => botonItem.classList.remove('activo'));
  if (!seccion || seccion === 'tema') return;

  const seccionVisual = seccion === 'gestionUsuarios' ? 'usuario' : seccion;
  document
    .querySelectorAll(`.boton-sidebar[data-seccion='${seccionVisual}']`)
    .forEach(botonItem => botonItem.classList.add('activo'));

  actualizarBarraSuperior(seccion);
  cargarModulo(seccion);
}

/**
 * Actualiza el título, el ícono y el estado del botón de regresar
 * de la barra superior según la sección actual.
 *
 * @param {string} seccion - Identificador de la sección activa.
 * @returns {void}
 */
function actualizarBarraSuperior(seccion) {
  const elementoTituloBarraSuperior = document.getElementById('tituloBarraSuperior');
  const elementoIconoBarraSuperior  = document.getElementById('iconoBarraSuperior');
  const botonRegresar               = document.getElementById('botonRegresar');

  if (!elementoTituloBarraSuperior || !elementoIconoBarraSuperior || !infoBarraSuperior[seccion]) {
    return;
  }

  // Cambiar título e ícono
  elementoTituloBarraSuperior.textContent = infoBarraSuperior[seccion].titulo;
  elementoIconoBarraSuperior.src         = infoBarraSuperior[seccion].icono;

  // Ocultar o mostrar botón de regresar
  const seccionesSinRegresar = ['inicio', 'envios', 'plantillas', 'usuario','formulas'];
  if (seccionesSinRegresar.includes(seccion)) {
    botonRegresar.style.display                  = 'none';
    elementoTituloBarraSuperior.style.marginLeft = '0px';
  } else {
    botonRegresar.style.display                  = 'flex';
    elementoTituloBarraSuperior.style.marginLeft = '10px';
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

// Exponer la función de actualización de barra superior globalmente
window.actualizarBarraSuperior = actualizarBarraSuperior;
window.cargarModulo          = cargarModulo;
