// Función para cargar un módulo en la vista principal
function cargarModulo(seccion) {
  const rutasModulo = {
    inicio:          '../vistas/moduloInicio.html',
    analisis:        '../vistas/moduloAnalisis.html',
    plantillas:      '../vistas/moduloPlantillas.html',
    formulas:        '../vistas/moduloFormulas.html',
    envios:          '../vistas/moduloEnvios.html',
    usuario:         '../vistas/moduloUsuario.html',
    gestionUsuarios: '../vistas/moduloGestionUsuarios.html'
    // tema no va aquí
  };

  const contenedorVentanaPrincipal = document.querySelector('.ventana-principal');

  if (contenedorVentanaPrincipal && rutasModulo[seccion]) {
    fetch(rutasModulo[seccion])
      .then(respuesta => respuesta.text())
      .then(html => {
        contenedorVentanaPrincipal.innerHTML = html;
        
        // Inicializar el módulo según la sección
        if (seccion === 'inicio') {
          if (window.botonCargar)    window.botonCargar();
          if (window.botonAnalisis)  window.botonAnalisis();
          if (window.botonBorrar)    window.botonBorrar();
        } else if (seccion === 'analisis') {
          if (window.cargarDatosExcel)           window.cargarDatosExcel();
          if (window.inicializarModuloAnalisis)  window.inicializarModuloAnalisis();
        } else if (seccion === 'plantillas') {
          if (window.inicializarModuloPlantillas) window.inicializarModuloPlantillas();
        } else if (seccion === 'usuario') {
          if (window.inicializarModuloUsuario)    window.inicializarModuloUsuario();
        }
        // Añadir más inicializaciones para otros módulos según sea necesario
      })
      .catch(error => {
        console.error('Error al cargar el módulo:', error);
      });
  }
}


// Información para la barra superior (títulos e íconos)
const infoBarraSuperior = {
  inicio:          { titulo: 'Inicio',     icono: '../utils/iconos/Casa.svg' },
  analisis:        { titulo: 'Análisis',   icono: '../utils/iconos/GraficaBarras.svg' },
  plantillas:      { titulo: 'Plantillas', icono: '../utils/iconos/Portapapeles.svg' },
  formulas:        { titulo: 'Fórmulas',   icono: '../utils/iconos/Funcion.svg' },
  envios:          { titulo: 'Envíos',     icono: '../utils/iconos/Correo.svg' },
  usuario:         { titulo: 'Usuario',    icono: '../utils/iconos/Usuario.svg' },
  gestionUsuarios: { titulo: 'Usuario',    icono: '../utils/iconos/Usuario.svg' }
};


// Función para inicializar la barra lateral
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


// Añade listeners a los botones de la barra lateral
function activarBotonesBarraLateral() {
  const botonesSidebar = document.querySelectorAll('.boton-sidebar');

  botonesSidebar.forEach(boton => {
    boton.addEventListener('click', () => {
      const seccion = boton.getAttribute('data-seccion');
      if (!seccion || seccion === 'tema') return;

      // Guardamos la sección real
      localStorage.setItem('seccion-activa', seccion);
      console.log('Sección activa guardada:', seccion);

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


// Aplica la sección activa según lo guardado en localStorage
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


// Actualiza el título e ícono de la barra superior, y controla el botón de regresar
function actualizarBarraSuperior(seccion) {
  const elementoTituloBarraSuperior = document.getElementById('topbar-titulo');
  const elementoIconoBarraSuperior  = document.getElementById('topbar-icono');
  const botonRegresar               = document.getElementById('btn-regresar');

  if (!elementoTituloBarraSuperior || !elementoIconoBarraSuperior || !infoBarraSuperior[seccion]) {
    return;
  }

  // Cambiar título e ícono
  elementoTituloBarraSuperior.textContent = infoBarraSuperior[seccion].titulo;
  elementoIconoBarraSuperior.src         = infoBarraSuperior[seccion].icono;

  // Ocultar o mostrar botón de regresar
  const seccionesSinRegresar = ['inicio', 'envios', 'plantillas', 'usuario'];
  if (seccionesSinRegresar.includes(seccion)) {
    botonRegresar.style.display                  = 'none';
    elementoTituloBarraSuperior.style.marginLeft = '0px';
  } else {
    botonRegresar.style.display                  = 'flex';
    elementoTituloBarraSuperior.style.marginLeft = '10px';
  }
}

// Exponer la función de actualización de barra superior globalmente
window.actualizarBarraSuperior = actualizarBarraSuperior;
