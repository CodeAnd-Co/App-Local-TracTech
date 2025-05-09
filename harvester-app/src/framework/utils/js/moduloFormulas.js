const { renderizarFormulas } = require('../utils/js/consultarFormulas');
const { inicializarCrearFormula} = require('../utils/js/crearFormula');
//const { guardarFormula } = require('../utils/js/crearFormula');
//const { eliminarFormula } = require('../utils/js/eliminarFormula');

async function inicializarModuloFormulas(){
    localStorage.setItem('seccion-activa', 'formulas');
    const ventanaPrincipal = document.getElementById('ventana-principal');
    if (!ventanaPrincipal) return;

    try{
      const formulas = await renderizarFormulas();

    } catch(error){
      
      console.error('Error al consultar las fórmulas:', error);
      document.getElementById('frameFormulas').innerHTML  
      = `<div class='error-carga'>Error al cargar las fórmulas</div>`;
    }

    const botonCrear = document.getElementById('crearFormula');
    botonCrear.addEventListener('click', () => {
        console.log('Creando formula');
        inicializarCrearFormula();
    });

    // ELementos que se deben editar: texto-usuario

    document.getElementById('crearFormula')
        .addEventListener('click', () => {
            console.log('Creando formula');
            inicializarCrearFormula()});

    document.getElementById('busqueda-formulas')
        .addEventListener('click', () => console.log('Buscando formula'));


}


window.inicializarModuloFormulas = inicializarModuloFormulas;
