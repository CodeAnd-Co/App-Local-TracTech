const { renderizarFormulas } = require(`${rutaBase}src/framework/utils/scripts/paginas/formulas/consultarFormulas.js`);
const { Swal } = require(`${rutaBase}/node_modules/sweetalert2/dist/sweetalert2.all.js`);
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
        Swal.fire({
          title: 'Error al cargar fórmulas',
          text: 'Verifica tu conexión e inténtalo de nuevo.',
          icon: 'error',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#a61930',
        });
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