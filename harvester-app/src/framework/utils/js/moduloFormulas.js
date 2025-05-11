const { renderizarFormulas } = require('../utils/js/consultarFormulas');
//const { guardarFormula } = require('../utils/js/crearFormula');
//const { eliminarFormula } = require('../utils/js/eliminarFormula');

async function inicializarModuloFormulas(){

    localStorage.setItem('seccion-activa', 'formulas');
    const ventanaPrincipal = document.getElementById('ventana-principal');
    if (!ventanaPrincipal) return;

    try{
      await renderizarFormulas();
      console.log('Formulas renderizadas');

    } catch(error){
      
      console.error('Error al consultar las fórmulas:', error);
      document.getElementById('frameFormulas').innerHTML  
      = `<div class='error-carga'>Error al cargar las fórmulas</div>`;
    }

}

window.inicializarModuloFormulas = inicializarModuloFormulas;
