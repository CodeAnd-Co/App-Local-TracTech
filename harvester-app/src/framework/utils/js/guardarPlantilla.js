import { guardarPlantillas } from '../../../backend/casosUso/plantillas/guardarPlantillas.js';

document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('guardarPlantilla');
  if (!btn) return console.warn('No existe #guardarPlantilla');
  
  btn.addEventListener('click', () => {
    console.log('Botón presionado');
    const cont = document.getElementById('previsualizacion');
    if (!cont) return console.warn('No existe #previsualizacion');
    const html = cont.outerHTML;
    console.log(html);
    guardarPlantillas.guardarPlantilla(html);
  });
});
