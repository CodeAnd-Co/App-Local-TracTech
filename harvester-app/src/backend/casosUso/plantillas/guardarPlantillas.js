const {guardarPlantillaAPI} = require('../../domain/plantillasAPI/guardarPlantilla')

function guardarPlantilla(contenedor){
    console.log("entraUCase");
  guardarPlantillaAPI.guardarPlantillas(contenedor)
}