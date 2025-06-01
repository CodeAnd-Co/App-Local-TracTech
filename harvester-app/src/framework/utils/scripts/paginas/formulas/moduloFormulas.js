const { renderizarFormulas } = require(`${rutaBase}src/framework/utils/scripts/paginas/formulas/consultarFormulas.js`);
const { mostrarAlerta } = require(`${rutaBase}/src/framework/vistas/includes/componentes/moleculas/alertaSwal/alertaSwal`);
const { filtrarFormulas } = require(`${rutaBase}src/framework/utils/scripts/paginas/formulas/buscadorFormulas.js`);

/**
 * Inicializa el módulo de fórmulas.
 * @async
 * @function inicializarModuloFormulas
 * @returns {Promise<void>}
 */
async function inicializarModuloFormulas(){
  const barraBusqueda = document.getElementById('busqueda-formulas');

  

    localStorage.setItem('seccion-activa', 'formulas');
    const ventanaPrincipal = document.getElementById('ventana-principal');
    if (!ventanaPrincipal) return;

    try{
      await renderizarFormulas();

    } catch{
      mostrarAlerta('Error al cargar fórmulas', 'Verifica tu conexión e inténtalo de nuevo.', 'error', 'Aceptar');
      document.getElementById('frame-formulas').innerHTML  
      = `<div class='error-carga'>Error al cargar las fórmulas</div>`;
    }

    if (barraBusqueda){
      barraBusqueda.addEventListener('input', function(){
        filtrarFormulas(this.value.toLowerCase());
      })
    }

}

inicializarModuloFormulas()