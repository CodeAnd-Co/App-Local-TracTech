const { ipcRenderer } = require('electron');

// Diccionario que incluye la ruta de la vista de cada módulo, el nombre de la sección, y el nombre del ícono de la sección.
const informacionModulos = {
  inicio:          [`${rutaBase}src/framework/vistas/paginas/inicio/inicio.ejs`, 'Inicio', 'Casa'],
  tractores:       [`${rutaBase}src/framework/vistas/paginas/analisis/seleccionarTractor.ejs`, 'Tractores', 'Casa'],
  analisis:        [`${rutaBase}src/framework/vistas/paginas/analisis/generarReporte.ejs`, 'Análisis', 'GraficaBarras'],
  plantillas:      [`${rutaBase}src/framework/vistas/paginas/plantillas/listaPlantillas.ejs`, 'Plantillas', 'Portapapeles'],
  formulas:        [`${rutaBase}src/framework/vistas/paginas/formulas/listaFormulas.ejs`, 'Formulas', 'Funcion'],
  perfil:          [`${rutaBase}src/framework/vistas/paginas/usuarios/consultarPerfil.ejs`, 'Perfil', 'Usuario'],
  usuarios:        [`${rutaBase}src/framework/vistas/paginas/usuarios/listaUsuarios.ejs`, 'Usuarios', 'Usuario'],
};

async function cargarModulo(modulo){
  try {
        const vista = await ipcRenderer.invoke('precargar-ejs', informacionModulos[modulo][0], { Seccion: informacionModulos[modulo][1], Icono : informacionModulos[modulo][2]});
        window.location.href = vista;
        localStorage.setItem('seccion-activa', modulo);
    } catch (err) {
        console.error('Error al cargar vista:', err);
    }
}

configurarBotonesLaterales()
function configurarBotonesLaterales(){

  const botonesBarraLateral = document.querySelectorAll('.boton-sidebar');
  botonesBarraLateral.forEach(boton => {
    boton.addEventListener('click', () => {
      const modulo = boton.getAttribute('data-seccion');
      if (!modulo) return;

      // Determinar cuál botón mostrar como activo visualmente
      const seccionVisual = modulo === 'gestionUsuarios' ? 'usuario' : modulo;

      // Desactivar todos los botones
      botonesBarraLateral.forEach(boton => boton.classList.remove('activo'));
      cargarModulo(modulo);

      // Activar el botón correspondiente
      document
        .querySelectorAll(`.boton-sidebar[data-seccion='${seccionVisual}']`)
        .forEach(botonItem => botonItem.classList.add('activo'));
    })
  });
}

cerrarBarraLateral()
function cerrarBarraLateral() {
  // const barraLateralExpandida = document.getElementById('barraLateralExpandida');
  const botonColapsar         = document.getElementById('botonColapsar');
  const botonExpandir         = document.getElementById('botonExpandir');
  const barraLateralExpandida = document.getElementById('barraLateralExpandida');
  const barraLateralColapsada = document.getElementById('barraLateralColapsada');

  // Actualizar el nombre del usuario en la barra lateral
  const nombreUsuario = localStorage.getItem('nombreUsuario') || 'Nombre Usuario';
  const elementosNombreUsuario = document.querySelectorAll('.sidebar-inferior .boton-sidebar[data-seccion="perfil"] span');
  elementosNombreUsuario.forEach(elemento => {
    elemento.textContent = nombreUsuario;
  });

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

}

aplicarActivoDesdeAlmacenamiento()