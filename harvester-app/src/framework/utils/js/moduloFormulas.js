const { consultarFormulas } = require('../../backend/casosUso/formulas/consultaFormulas');
const { inicializarCrearFormula } = require('../utils/js/crearFormula');
//const { guardarFormula } = require('../../backend/casosUso/formulas/guardarFormula');
//const { eliminarFormula } = require('../../backend/casosUso/formulas/eliminarFormula');

function inicializarModuloFormulas(){
    console.log('inicializando modulo formulas');
    console.log('Ruta actual __dirname:', __dirname);
    console.log('Intentando importar:', require.resolve('../../backend/casosUso/formulas/consultaFormulas'));

    localStorage.setItem('seccion-activa', 'formulas');
    const ventanaPrincipal = document.getElementById('ventana-principal');
    if (!ventanaPrincipal) return;
    console.log(consultarFormulas);


    try{
      const formulas = consultarFormulas();
      console.log('Formulas:', formulas);

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

    const idContenedor = 'frameFormulas';
    
    // consultarFormulas();

    // ELementos que se deben editar: texto-usuario

    document.getElementById('crearFormula')
        .addEventListener('click', () => {
            console.log('Creando formula');
            inicializarCrearFormula()});

    document.getElementById('busqueda-formulas')
        .addEventListener('click', () => console.log('Buscando formula'));

    document.getElementById('btnEditarFormula')
        .addEventListener('click', () => {
            console.log('Editando formula');
            inicializarEditarFormula(idContenedor)});
    
    document.getElementById('btnEliminarFormula')
        .addEventListener('click', () => {
            console.log('Eliminando formula');
            eliminarFormula(idContenedor)});
}


window.inicializarModuloFormulas = inicializarModuloFormulas;
