const { moduloPlantillas } = require('./moduloPlantillas');
  
document.getElementById('guardarPlantilla')
  .addEventListener('click', () => {  
    const plantilla = moduloPlantillas.inicializarModuloPlantillas() 
    const children = document.querySelectorAll('.tarjeta-texto');

});
