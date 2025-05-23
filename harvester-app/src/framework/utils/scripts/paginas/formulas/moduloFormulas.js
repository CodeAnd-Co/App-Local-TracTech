const { renderizarFormulas } = require(`${rutaBase}src/framework/utils/scripts/paginas/formulas/consultarFormulas.js`);


/**
 * Inicializa el módulo de fórmulas.
 * @async
 * @function inicializarModuloFormulas
 * @returns {Promise<void>}
 */
async function inicializarModuloFormulas(){

    localStorage.setItem('seccion-activa', 'formulas');
    const ventanaPrincipal = document.getElementById('ventana-principal');
    if (!ventanaPrincipal) return;

    try{
      await renderizarFormulas();

    } catch(error){
      
      console.error('Error al consultar las fórmulas:', error);
      document.getElementById('frameFormulas').innerHTML  
      = `<div class='error-carga'>Error al cargar las fórmulas</div>`;
    }

}

inicializarModuloFormulas()