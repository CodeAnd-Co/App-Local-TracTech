/**
 * @file agregarTexto.js
 * @module agregarTexto
 * @description Proporciona la funcionalidad para añadir tarjetas de texto editables y sus previsualizaciones en el módulo de análisis.
 * @version 1.0
 * @date 2025-04-28
 */

/**
 * Crea y agrega una tarjeta de texto al contenedor de edición y su correspondiente previsualización.
 *
 * @param {string} idContenedor - ID del elemento donde se añadirán las tarjetas de texto.
 * @param {string} idContenedorVistaPrevia - ID del elemento donde se mostrará la previsualización del texto.
 */
function agregarTexto(idContenedor, idContenedorVistaPrevia) {
  const contenedor = document.getElementById(idContenedor);
  const contenedorVistaPrevia = document.getElementById(idContenedorVistaPrevia);

  const tarjetasTexto = contenedor.querySelectorAll('.tarjeta-texto');
  const nuevaId = tarjetasTexto.length
    ? (parseInt(tarjetasTexto[tarjetasTexto.length - 1].id, 10) || 0) + 1
    : 1;

  const tarjetaTexto = document.createElement('div');
  tarjetaTexto.classList.add('tarjeta-texto');
  tarjetaTexto.id = nuevaId;
  tarjetaTexto.innerHTML = `
    <div class="titulo-texto">
      <select class="tipo-texto">
        <option value="titulo">Título</option>
        <option value="subtitulo">Subtítulo</option>
        <option value="contenido">Contenido</option>
      </select>
      <img class="type" src="../utils/iconos/Texto.svg" alt="Icono Texto" />
    </div>
    <textarea class="area-escritura" placeholder="Escribe aquí tu contenido..."></textarea>
    <div class="botones-editar-eliminar">
      <div class="eliminar">
        <img class="eliminar-icono" src="../utils/iconos/Basura.svg" alt="Eliminar" />
        <div class="texto-eliminar">Eliminar</div>
      </div>
      <div class="divisor"></div>
      <div class="alinear">
        <div class="icono-align align-left"><span></span><span></span><span></span></div>
        <div class="texto-editar">Alinear</div>
      </div>
    </div>
  `;
  
  const vistaPrevia = document.createElement('div');
  vistaPrevia.classList.add('previsualizacion-texto', 'preview-titulo');
  vistaPrevia.id = `preview-texto-${nuevaId}`;
  vistaPrevia.alignIndex = 0;
  contenedorVistaPrevia.appendChild(vistaPrevia);

  const selectorTipoTexto = tarjetaTexto.querySelector('.tipo-texto');
  const areaTexto = tarjetaTexto.querySelector('.area-escritura');
  const botonEliminar = tarjetaTexto.querySelector('.eliminar');
  const botonAlinear = tarjetaTexto.querySelector('.alinear');
  const iconoAlineacion = botonAlinear.querySelector('.icono-align');

  /**
   * Actualiza el contenido y estilo de la vista previa según el texto y tipo seleccionado.
   * @private
   */
  function actualizarVistaPrevia() {
    vistaPrevia.textContent = areaTexto.value;
    vistaPrevia.classList.remove('preview-titulo', 'preview-subtitulo', 'preview-contenido');
    vistaPrevia.classList.add(`preview-${selectorTipoTexto.value}`);
  }

  botonAlinear.addEventListener('click', () => {
    const alineaciones = ['left', 'center', 'justify', 'right'];
    vistaPrevia.alignIndex = (vistaPrevia.alignIndex + 1) % alineaciones.length;
    const modo = alineaciones[vistaPrevia.alignIndex];
    vistaPrevia.style.textAlign = modo;
    iconoAlineacion.className = `icono-align align-${modo}`;
  });

  selectorTipoTexto.addEventListener('change', actualizarVistaPrevia);
  areaTexto.addEventListener('input', actualizarVistaPrevia);
  botonEliminar.addEventListener('click', () => {
    tarjetaTexto.remove();
    vistaPrevia.remove();
  });

  contenedor.appendChild(tarjetaTexto);
}

// Exponer la función en el ámbito global para listeners
window.agregarTexto = agregarTexto;
