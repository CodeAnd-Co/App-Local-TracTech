/**
 * @file agregarTexto.js
 * @module agregarTexto
 * @description Proporciona la funcionalidad para añadir tarjetas de texto editables
 *              y sus previsualizaciones en el módulo de análisis, con opción de
 *              insertar antes o después de una tarjeta existente.
 * @version 1.3
 * @date 2025-05-14
 */

/**
 * Crea y agrega una tarjeta de texto al contenedor de edición y su correspondiente
 * previsualización. Puede insertarse antes o después de otra tarjeta.
 *
 * @param {string} idContenedor           - ID del elemento donde se añadirán las tarjetas de edición.
 * @param {string} idContenedorPrevisualizacion - ID del elemento donde se mostrará la previsualización.
 * @param {HTMLDivElement|null} tarjetaRef       - Nodo de tarjeta existente junto al cual insertar.
 * @param {'antes'|'despues'} posicion    - 'antes' para arriba, 'despues' para abajo.
 * @returns {HTMLDivElement} tarjetaTexto - La tarjeta de texto creada.
 */
function agregarTexto(
  idContenedor,
  idContenedorPrevisualizacion,
  tarjetaRef = null,
  posicion = null
) {
  const contenedor        = document.getElementById(idContenedor);
  const contenedorPrevia  = document.getElementById(idContenedorVistaPrevia);
  const observer = new MutationObserver(() => {
  const tarjetasTexto    = contenedor.querySelectorAll('.tarjeta-texto');
  const tarjetasGrafica  = contenedor.querySelectorAll('.tarjeta-grafica'); 
  const tarjetasTotales  = [...tarjetasTexto, ...tarjetasGrafica];

  tarjetasTotales.forEach(tarjeta => {
    const botonEliminar = tarjeta.querySelector('.eliminar');
    const divisor       = tarjeta.querySelector('.divisor');
    const contenedorBotones = tarjeta.querySelector('.botones-editar-eliminar');

    const soloUnaGrafica = tarjetasGrafica.length <= 1;
    const soloUnaTexto   = tarjetasTexto.length <= 1;

    if (soloUnaTexto && soloUnaGrafica) {
      if (botonEliminar) botonEliminar.style.display = 'none';
      if (divisor) divisor.style.display = 'none';
      if (contenedorBotones) contenedorBotones.style.justifyContent = 'center';
    } else {
      if (botonEliminar) botonEliminar.style.display = 'flex';
      if (divisor) divisor.style.display = 'block';
      if (contenedorBotones) contenedorBotones.style.justifyContent = 'space-between';
    }
  });
});

  observer.observe(contenedor, { childList: true, subtree: true });

  // 1) Calcular nuevo ID de tarjeta con timestamp para garantizar unicidad
  const timestamp = new Date().getTime();
  const nuevoId = `texto_${timestamp}`;

  // 2) Crear la tarjeta de edición
  const tarjetaTexto = document.createElement('div');
  tarjetaTexto.classList.add('tarjeta-texto');
  tarjetaTexto.id = nuevoId;
  tarjetaTexto.innerHTML = `
    <div class='titulo-texto'>
      <select class='tipo-texto'>
        <option value='titulo'>Título</option>
        <option value='subtitulo'>Subtítulo</option>
        <option value='contenido'>Contenido</option>
      </select>
      <img class='type' src='../utils/iconos/Texto.svg' alt='Icono Texto' />
    </div>
    <textarea class='area-escritura' placeholder='Escribe aquí tu contenido...' maxlength='1000'></textarea>
    <style>
      .contador-caracteres {
        font-size: 12px;
        text-align: right;
        color: #7f8c8d;
        margin: 4px 0;
        padding-right: 4px;
      }
    </style>
    <div class='botones-editar-eliminar'>
      <div class='eliminar'>
        <img class='eliminar-icono' src='../utils/iconos/Basura.svg' alt='Eliminar' />
        <div class='texto-eliminar'>Eliminar</div>
      </div>
      <div class='divisor'></div>
      <div class='alinear'>
        <div class='icono-align align-left'><span></span><span></span><span></span></div>
        <div class='texto-editar'>Alinear</div>
      </div>
    </div>
  `;

  const vistaPrevia = document.createElement('div');
  vistaPrevia.classList.add('previsualizacion-texto', 'preview-titulo');
  vistaPrevia.id = `preview-texto-${nuevoId}`;
  // Atributo data-tarjeta-id para consistencia con el sistema de gráficas
  vistaPrevia.setAttribute('data-tarjeta-id', nuevoId);
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
    const idRef = tarjetaRef.id;
    let vistaRef;
    
    // Lógica mejorada para encontrar el elemento de vista previa correspondiente
    if (tarjetaRef.classList.contains('tarjeta-texto')) {
      // Para tarjetas de texto, buscar por ID del preview
      vistaRef = contenedorPrevia.querySelector(`#preview-texto-${idRef}`);
      
      // Si no encuentra, intentar buscar por data-tarjeta-id (compatibilidad con nuevos IDs)
      if (!vistaRef) {
        vistaRef = contenedorPrevia.querySelector(`.previsualizacion-texto[data-tarjeta-id='${idRef}']`);
      }
    } else if (tarjetaRef.classList.contains('tarjeta-grafica')) {
      // Para tarjetas de gráfica, buscar por data-tarjeta-id
      vistaRef = contenedorPrevia.querySelector(`.previsualizacion-grafica[data-tarjeta-id='${idRef}']`);
    }
    
    if (vistaRef) {
      if (posicion === 'antes') {
        contenedorPrevia.insertBefore(vistaPrevia, vistaRef);
      } else {
        contenedorPrevia.insertBefore(vistaPrevia, vistaRef.nextSibling);
      }
    } else {
      // Fallback: Si no se encuentra la referencia, añadir al final
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

  selectorTipo.addEventListener('change', () => {
    vistaPrevia.classList.remove('preview-titulo', 'preview-subtitulo', 'preview-contenido');
    vistaPrevia.classList.add(`preview-${selectorTipo.value}`);
  });

  areaEscritura.addEventListener('input', () => {
    actualizarTexto(vistaPrevia, areaEscritura);
    actualizarCaracteres(areaEscritura, tarjetaTexto);
  });

  botonAlinear.addEventListener('click', () => {
    const alineaciones = ['left', 'center', 'right'];
    vistaPrevia.alignIndex = (vistaPrevia.alignIndex + 1) % alineaciones.length;
    const alineado = alineaciones[vistaPrevia.alignIndex];
    vistaPrevia.style.textAlign = alineado;
    iconoAlineacion.className = `icono-align align-${alineado}`;
  });

  botonEliminar.addEventListener('click', () => {
    tarjetaTexto.remove();
    vistaPrevia.remove();
  });

  return tarjetaTexto;
}

/**
   * Actualiza el contenido de la vista previa según el texto del {@link areaEscritura}.
   * 
   * @param {HTMLDivElement} vistaPrevia - Vista previa del texto
   * @param {HTMLTextAreaElement} areaEscritura - Area de tecto con el contenido a mostrar
   * @returns {void}
   */
function actualizarTexto(vistaPrevia, areaEscritura) {
  vistaPrevia.innerHTML = '';
  const texto = areaEscritura.value.split('\n');
  texto.forEach((linea) => {
    const parrafo = document.createElement('p');
    parrafo.textContent = linea;

    parrafo.style.maxWidth = '100%';
    parrafo.style.wordWrap = 'break-word';
    parrafo.style.overflowWrap = 'break-word';
    parrafo.style.whiteSpace = 'normal';

    vistaPrevia.appendChild(parrafo);
  })
}

/**
 * Actualiza el contador de caracteres restantes en la tarjeta del {@link areaEscritura}.
 * 
 * @param {HTMLDivElement} tarjetaTexto - Tarjeta de edición del cuadro de texto
 * @param {HTMLTextAreaElement} areaEscritura - Area de tecto con el contenido a mostrar
 * @returns {void}
 */
function actualizarCaracteres(tarjetaTexto, areaEscritura) {
  const caracteresUsados = areaEscritura.value.length;
  const limite = parseInt(areaEscritura.getAttribute('maxlength'), 10);
  const caracteresRestantes = limite - caracteresUsados;

  let contadorCaracteres = tarjetaTexto.querySelector('.contador-caracteres');
  if (!contadorCaracteres) {
    contadorCaracteres = document.createElement('div');
    contadorCaracteres.className = 'contador-caracteres';
    tarjetaTexto.insertBefore(contadorCaracteres, tarjetaTexto.querySelector('.botones-editar-eliminar'));
  }

  contadorCaracteres.textContent = `${caracteresUsados}/${limite} caracteres`;

  if (caracteresRestantes < 50) {
    contadorCaracteres.style.color = '#e74c3c';
  } else {
    contadorCaracteres.style.color = '#7f8c8d';
  }
}

/**
 * Inserta una tarjeta de texto y su previsualización en la posición deseada
 * 
 * @param {HTMLDivElement} tarjetaRef - Tarjeta de referencia para la inserción
 * @param {ElementoReporte} elementoReporte - Elemento de reporte a insertar
 * @param {Contenedores} contenedores - Contenedores de tarjetas y previsualizaciones
 * @param {'antes'|'despues'} posicion - Posición de inserción ('antes' o 'despues')
 * @returns {void}
 */
function agregarEnPosicion(tarjetaRef, elementoReporte, contenedores, posicion) {
  if (tarjetaRef && (posicion === 'antes' || posicion === 'despues')) {
    if (posicion === 'antes') {
      contenedores.contenedorTarjeta.insertBefore(elementoReporte.tarjeta, tarjetaRef);
    } else {
      contenedores.contenedorTarjeta.insertBefore(elementoReporte.tarjeta, tarjetaRef.nextSibling);
    }

    const idRef = tarjetaRef.id;
    let vistaRef;

    if (tarjetaRef.classList.contains('tarjeta-texto')) {
      vistaRef = contenedores.contenedorPrevisualizacion.querySelector(`#previsualizacion-texto-${idRef}`);
    } else if (tarjetaRef.classList.contains('tarjeta-grafica')) {
      vistaRef = contenedores.contenedorPrevisualizacion.querySelector(`#previsualizacion-grafica-${idRef}`);
    }

    if (vistaRef) {
      if (posicion === 'antes') {
        contenedores.contenedorPrevisualizacion.insertBefore(elementoReporte.previsualizacion, vistaRef);
      } else {
        contenedores.contenedorPrevisualizacion.insertBefore(elementoReporte.previsualizacion, vistaRef.nextSibling);
      }
    } else {
      contenedores.contenedorPrevisualizacion.appendChild(elementoReporte.previsualizacion);
    }
  } else {
    contenedores.contenedorTarjeta.appendChild(elementoReporte.tarjeta);
    contenedores.contenedorPrevisualizacion.appendChild(elementoReporte.previsualizacion);
  }
}

/**
 * Crea un observador que revisa que haya al menos un cuadro de texto y una gráfica
 * 
 * @param {HTMLDivElement} contenedor - Contenedor de tarjetas
 * @returns {void}
 */
function configurarObservadorLimite(contenedor) { 
  const observer = new MutationObserver(() => {
    const tarjetasTexto = contenedor.querySelectorAll('.tarjeta-texto');
    const tarjetasGrafica = contenedor.querySelectorAll('.tarjeta-grafica');
    const tarjetasTotales = [...tarjetasTexto, ...tarjetasGrafica];

    tarjetasTotales.forEach(tarjeta => {
      const botonEliminar = tarjeta.querySelector('.eliminar');
      const divisor = tarjeta.querySelector('.divisor');
      const contenedorBotones = tarjeta.querySelector('.botones-editar-eliminar');

      const soloUnaGrafica = tarjetasGrafica.length <= 1;
      const soloUnaTexto = tarjetasTexto.length <= 1;

      if (soloUnaTexto && soloUnaGrafica) {
        if (botonEliminar) botonEliminar.style.display = 'none';
        if (divisor) divisor.style.display = 'none';
        if (contenedorBotones) contenedorBotones.style.justifyContent = 'center';
      } else {
        if (botonEliminar) botonEliminar.style.display = 'flex';
        if (divisor) divisor.style.display = 'block';
        if (contenedorBotones) contenedorBotones.style.justifyContent = 'space-between';
      }
    });
  });

  observer.observe(contenedor, { childList: true, subtree: true });
}

module.exports = {
  agregarTexto
};