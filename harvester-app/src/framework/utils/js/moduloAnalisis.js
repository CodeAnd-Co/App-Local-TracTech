import { agregarTexto } from './agregarTexto.js';
import { agregarGrafica } from './agregarGrafica.js';

document.addEventListener('DOMContentLoaded', () => {
  console.log("Cargar algo")
  const contenedor = 'contenedorElementos';

  document.getElementById('agregarTexto').addEventListener('click', () => {
    console.log("Texto")
    agregarTexto(contenedor);
  });

  document.getElementById('agregarGrafica').addEventListener('click', () => {
    console.log("Gráfica")
    agregarGrafica(contenedor)
  })

});
