const { ipcRenderer } = require('electron');
const {  mostrarAlertaConfirmacion } = require(`${rutaBase}/src/framework/vistas/includes/componentes/moleculas/alertaSwal/alertaSwal`);

// Diccionario que incluye la ruta de la vista de cada módulo, el nombre de la sección, y el nombre del ícono de la sección.
const informacionModulos = {
  inicio:          [`${rutaBase}src/framework/vistas/paginas/inicio/inicio.ejs`, 'Inicio', 'Casa'],
  tractores:       [`${rutaBase}src/framework/vistas/paginas/analisis/seleccionarTractor.ejs`, 'Tractores', 'Casa'],
  analisis:        [`${rutaBase}src/framework/vistas/paginas/analisis/generarReporte.ejs`, 'Análisis', 'GraficaBarras'],
  plantillas:      [`${rutaBase}src/framework/vistas/paginas/plantillas/listaPlantillas.ejs`, 'Plantillas', 'Portapapeles'],
  formulas:        [`${rutaBase}src/framework/vistas/paginas/formulas/listaFormulas.ejs`, 'Fórmulas', 'Funcion'],
  perfil:          [`${rutaBase}src/framework/vistas/paginas/usuarios/consultarPerfil.ejs`, 'Perfil', 'Usuario'],
  usuarios:        [`${rutaBase}src/framework/vistas/paginas/usuarios/listaUsuarios.ejs`, 'Usuarios', 'Usuario'],
  dispositivos:    [`${rutaBase}src/framework/vistas/paginas/dispositivos/listaDispositivos.ejs`, 'Gestión de Dispositivos', 'BaseDatos'],
};

async function cargarModulo(modulo){
  try {
        const vista = await ipcRenderer.invoke('precargar-ejs', informacionModulos[modulo][0], { Seccion: informacionModulos[modulo][1], Icono : informacionModulos[modulo][2], permisos});
        window.location.href = vista;
        localStorage.setItem('seccion-activa', modulo);
    } catch (err) {
        return ('Error al cargar vista:', err);
    }
}

desocultarBotonAnalisis();
configurarBotonesLaterales();

function configurarBotonesLaterales(){
  const estadoBarraLateral = localStorage.getItem('estado-barra-lateral');
  if(!estadoBarraLateral){
    localStorage.setItem('estado-barra-lateral', 'expandida');
  } else {
    if(estadoBarraLateral == 'contraida'){
      const barraLateralExpandida = document.getElementById('barraLateralExpandida');
      const barraLateralColapsada = document.getElementById('barraLateralColapsada');
      barraLateralExpandida.style.display = 'none';
      barraLateralColapsada.style.display = 'flex';
    }
  }

  const botonesBarraLateral = document.querySelectorAll('.boton-sidebar');
  botonesBarraLateral.forEach(boton => {
    boton.addEventListener('click', async() => {
      const seccion = localStorage.getItem('seccion-activa');

 if(seccion == 'analisis' && boton.classList.contains('sidebar-logo') == false){
        const resultadoConfirmado = await mostrarAlertaConfirmacion('¿Estás seguro de salir?', 'Se perderá el reporte si sales de este', 'warning', 'Sí, salir', 'Cancelar');
        if(resultadoConfirmado) {

          const modulo = boton.getAttribute('data-seccion');
          if (!modulo) return;

          // Determinar cuál botón mostrar como activo visualmente
          const seccionVisual = modulo === 'gestionUsuarios' ? 'usuarios' : modulo;
          
          // Desactivar todos los botones
          botonesBarraLateral.forEach(boton => boton.classList.remove('activo'));
          cargarModulo(modulo);

          // Activar el botón correspondiente
          document
            .querySelectorAll(`.boton-sidebar[data-seccion='${seccionVisual}']`)
            .forEach(botonItem => botonItem.classList.add('activo'));

          return
        } else{
          return
        }
      }

          const modulo = boton.getAttribute('data-seccion');
          if (!modulo) return;

          // Determinar cuál botón mostrar como activo visualmente
          const seccionVisual = modulo === 'gestionUsuarios' ? 'usuarios' : modulo;
          
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
      localStorage.setItem('estado-barra-lateral', 'contraida');
    });
    botonExpandir.addEventListener('click', () => {
      barraLateralColapsada.style.display = 'none';
      barraLateralExpandida.style.display = 'flex';
      localStorage.setItem('estado-barra-lateral', 'expandida');
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
  let seccion             = localStorage.getItem('seccion-activa');
  const botonesSidebarTodos = document.querySelectorAll('.boton-sidebar');

  botonesSidebarTodos.forEach(botonItem => botonItem.classList.remove('activo'));
  if (!seccion || seccion === 'tema') {
    seccion = 'inicio';
  }

  const seccionVisual = seccion === 'gestionUsuarios' ? 'usuarios' : seccion;
  document
    .querySelectorAll(`.boton-sidebar[data-seccion='${seccionVisual}']`)
    .forEach(botonItem => botonItem.classList.add('activo'));

}

/**
 * Oculta el botón de análisis en ambas vistas (expandida y colapsada)
 * si la variable localStorage 'modulo-analisis-habilitado' no es true.
 */
function desocultarBotonAnalisis() {
  const puedeMostrarAnalisis = localStorage.getItem('modulo-analisis-habilitado') === 'true';

  const botonExpandido = document.getElementById('botonAnalisisExpandido');
  const botonColapsado = document.getElementById('botonAnalisisColapsado');

  if (botonExpandido) {
    const estaOculto = botonExpandido.classList.contains('oculto');
    if (puedeMostrarAnalisis && estaOculto) {
      botonExpandido.classList.remove('oculto');
    } else if (!puedeMostrarAnalisis && !estaOculto) {
      botonExpandido.classList.add('oculto');
    }
  }

  if (botonColapsado) {
    const estaOculto = botonColapsado.classList.contains('oculto');
    if (puedeMostrarAnalisis && estaOculto) {
      botonColapsado.classList.remove('oculto');
    } else if (!puedeMostrarAnalisis && !estaOculto) {
      botonColapsado.classList.add('oculto');
    }
  }
}

window.desocultarBotonAnalisis = desocultarBotonAnalisis;

aplicarActivoDesdeAlmacenamiento()