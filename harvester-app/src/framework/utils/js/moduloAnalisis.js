import { agregarTexto } from './agregarTexto.js';

document.addEventListener('DOMContentLoaded', () => {
  const contenedor = 'contenedor-elementos-preview';

  document.getElementById('agregarTexto').addEventListener('click', () => {
    agregarTexto(contenedor);
  });

});
