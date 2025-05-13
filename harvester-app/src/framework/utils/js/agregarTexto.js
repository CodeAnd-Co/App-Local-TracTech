/**
 * @file agregarTexto.js
 * @module agregarTexto
 * @description Proporciona la funcionalidad para añadir tarjetas de texto editables
 *              y sus previsualizaciones en el módulo de análisis, con opción de
 *              insertar antes o después de una tarjeta existente.
 * @version 1.1
 * @date 2025-05-06
 */

/**
 * Crea y agrega una tarjeta de texto al contenedor de edición y su correspondiente
 * previsualización. Puede insertarse antes o después de otra tarjeta.
 *
 * @param {string} idContenedor           - ID del elemento donde se añadirán las tarjetas de edición.
 * @param {string} idContenedorVistaPrevia - ID del elemento donde se mostrará la previsualización.
 * @param {Element|null} tarjetaRef       - Nodo de tarjeta existente junto al cual insertar.
 * @param {'antes'|'despues'} posicion    - 'antes' para arriba, 'despues' para abajo.
 */
function agregarTexto(
  idContenedor,
  idContenedorVistaPrevia,
  tarjetaRef       = null,
  posicion         = null
) {
  const contenedor        = document.getElementById(idContenedor);
  const contenedorPrevia  = document.getElementById(idContenedorVistaPrevia);

  // 1) Calcular nuevo ID de tarjeta
  const tarjetasTexto = contenedor.querySelectorAll('.tarjeta-texto');
  const nuevoId       = tarjetasTexto.length
    ? (parseInt(tarjetasTexto[tarjetasTexto.length - 1].id, 10) || 0) + 1
    : 1;

  // 2) Crear la tarjeta de edición
  const tarjetaTexto = document.createElement('div');
  tarjetaTexto.classList.add('tarjeta-texto');
  tarjetaTexto.id = `${nuevoId}`;
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

  // 3) Crear la vista previa
  const vistaPrevia = document.createElement('div');
  vistaPrevia.classList.add('previsualizacion-texto', 'preview-titulo');
  vistaPrevia.id = `preview-texto-${nuevoId}`;
  vistaPrevia.alignIndex = 0;

  // 4) Insertar en el DOM de edición y de previsualización
  if (tarjetaRef && (posicion === 'antes' || posicion === 'despues')) {
    // Inserción en el contenedor de edición
    if (posicion === 'antes') {
      contenedor.insertBefore(tarjetaTexto, tarjetaRef);
    } else {
      contenedor.insertBefore(tarjetaTexto, tarjetaRef.nextSibling);
    }

    // Determinar la vista de referencia y hacer la misma inserción
    const idRef       = tarjetaRef.id;
    const vistaRef    = contenedorPrevia.querySelector(`#preview-texto-${idRef}`);
    if (vistaRef) {
      if (posicion === 'antes') {
        contenedorPrevia.insertBefore(vistaPrevia, vistaRef);
      } else {
        contenedorPrevia.insertBefore(vistaPrevia, vistaRef.nextSibling);
      }
    } else {
      contenedorPrevia.appendChild(vistaPrevia);
    }
  } else {
    // Si no hay referencia válida, añadir al final
    contenedor.appendChild(tarjetaTexto);
    contenedorPrevia.appendChild(vistaPrevia);
  }

  // 5) Obtener referencias a controles internos
  const selectorTipo    = tarjetaTexto.querySelector('.tipo-texto');
  const areaEscritura   = tarjetaTexto.querySelector('.area-escritura');
  const botonEliminar   = tarjetaTexto.querySelector('.eliminar');
  const botonAlinear    = tarjetaTexto.querySelector('.alinear');
  const iconoAlineacion = botonAlinear.querySelector('.icono-align');

  /**
   * Actualiza el contenido y estilo de la vista previa según el texto y tipo.
   * @private
   */
  function actualizarVistaPrevia() {
    vistaPrevia.innerHTML = '';
    const texto = areaEscritura.value.split('\n');
    texto.forEach((linea) => { 
      vistaPrevia.innerHTML += `<p>${linea}</p>`;
    })
    
    vistaPrevia.classList.remove('preview-titulo', 'preview-subtitulo', 'preview-contenido');
    vistaPrevia.classList.add(`preview-${selectorTipo.value}`);
  }

  // 6) Listeners de interacción
  selectorTipo.addEventListener('change', actualizarVistaPrevia);
  areaEscritura.addEventListener('input',  actualizarVistaPrevia);

  botonAlinear.addEventListener('click', () => {
    const alineaciones = ['left', 'center', 'justify', 'right'];
    vistaPrevia.alignIndex = (vistaPrevia.alignIndex + 1) % alineaciones.length;
    const modo = alineaciones[vistaPrevia.alignIndex];
    vistaPrevia.style.textAlign       = modo;
    iconoAlineacion.className = `icono-align align-${modo}`;
  });

  botonEliminar.addEventListener('click', () => {
    tarjetaTexto.remove();
    vistaPrevia.remove();
  });
}

// Exponer la función en el ámbito global para los listeners del módulo
window.agregarTexto = agregarTexto;
