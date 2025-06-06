// RF17 - Usuario añade cuadro de texto al reporte - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/rf17/
// RF18 - Usuario modifica cuadro de texto del reporte - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/rf18/
// RF19 - Usuario elimina cuadro de texto del reporte - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/rf19/

 
 
// Importamos el componente de Swal para mostrar alertas
const { mostrarAlerta } = require(`${rutaBase}/src/framework/vistas/includes/componentes/moleculas/alertaSwal/alertaSwal`);
const { ElementoNuevo, Contenedores } = require(`${rutaBase}/src/backend/data/analisisModelos/elementoReporte.js`);

/**
 * Crea y agrega una tarjeta de texto al contenedor de edición y su correspondiente
 * previsualización. Puede insertarse antes o después de otra tarjeta.
 *
 * @param {string} idContenedor                - ID del elemento donde se añadirán las tarjetas de edición.
 * @param {string} idContenedorPrevisualizacion - ID del elemento donde se mostrará la previsualización.
 * @param {HTMLDivElement|null} tarjetaRef      - Nodo de tarjeta existente junto al cual insertar (null = al final).
 * @param {'antes'|'despues'} posicion          - 'antes' para arriba, 'despues' para abajo.
 * @returns {HTMLDivElement|null} tarjetaTexto  - La tarjeta de texto creada, o null si no se agregó.
 */
function agregarTexto(
  idContenedor,
  idContenedorPrevisualizacion,
  tarjetaRef = null,
  posicion = null
) {
  const contenedor = document.getElementById(idContenedor);
  const contenedorPrevia = document.getElementById(idContenedorPrevisualizacion);
  const contenedores = new Contenedores(contenedor, contenedorPrevia);

  if (!contenedor || !contenedorPrevia) {
    mostrarAlerta('Advertencia', 'Ocurrió un error al agregar cuadro de texto.', 'error');
    return null;
  }

  const tarjetasTextoExistentes = contenedor.querySelectorAll('.tarjeta-texto').length;
  const tarjetasGraficaExistentes = contenedor.querySelectorAll('.tarjeta-grafica').length;
  const totalTarjetas = tarjetasTextoExistentes + tarjetasGraficaExistentes;
  if (totalTarjetas >= 30) {
    mostrarAlerta('Advertencia', 'Llegaste al límite de tarjetas, el reporte no puede tener más de 30 tarjetas en total.', 'info');
    return null;
  }

  configurarObservadorLimite(contenedor);

  const idsTarjetasTexto = Array.from(
    contenedor.querySelectorAll('.tarjeta-texto'),
    (tarjeta) => parseInt(tarjeta.id, 10)
  );
    
  let nuevoId;

  if (idsTarjetasTexto.length > 0) {
    const idAnterior = Math.max(...idsTarjetasTexto);
    nuevoId = idAnterior + 1;
  } else {
    nuevoId = 1;
  }

  const limite = 1000;
  const tarjetaTexto = document.createElement('div');
  tarjetaTexto.classList.add('tarjeta-texto');
  tarjetaTexto.id = `${nuevoId}`;
  tarjetaTexto.innerHTML = `
    <div class='titulo-texto'>
      <select class='tipo-texto'>
        <option value='titulo'>Título</option>
        <option value='subtitulo'>Subtítulo</option>
        <option value='contenido'>Contenido</option>
      </select>
      <img class='type' src='${rutaBase}/src/framework/utils/iconos/Texto.svg' alt='Icono Texto' />
    </div>
    <textarea class='area-escritura' placeholder='Escribe aquí tu contenido...' maxlength='${limite}'></textarea>
    <div class='contador-caracteres'>0/${limite} caracteres</div>
    <div class='botones-editar-eliminar'>
      <div class='eliminar'>
        <img class='eliminar-icono' src='${rutaBase}/src/framework/utils/iconos/Basura.svg' alt='Eliminar' />
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
  vistaPrevia.id = `previsualizacion-texto-${nuevoId}`;
  vistaPrevia.alignIndex = 0;

  const elementoReporte = new ElementoNuevo(tarjetaTexto, vistaPrevia);
  agregarEnPosicion(tarjetaRef, elementoReporte, contenedores, posicion);

  const selectorTipo = tarjetaTexto.querySelector('.tipo-texto');
  const areaEscritura = tarjetaTexto.querySelector('.area-escritura');
  const botonEliminar = tarjetaTexto.querySelector('.eliminar');
  const botonAlinear = tarjetaTexto.querySelector('.alinear');
  const iconoAlineacion = botonAlinear.querySelector('.icono-align');

  // Inicializar el botón alinear deshabilitado
  validarBotonAlinear(areaEscritura, botonAlinear);

  selectorTipo.addEventListener('change', () => {
    vistaPrevia.classList.remove('preview-titulo', 'preview-subtitulo', 'preview-contenido');
    vistaPrevia.classList.add(`preview-${selectorTipo.value}`);
  });

  areaEscritura.addEventListener('input', (evento) => {
    if (evento.target.value.startsWith(' ')) {
      const posicionCursor = evento.target.selectionStart;
      evento.target.value = evento.target.value.replace(/^ +/, '');
      const nuevaPosicion = Math.max(0, posicionCursor - 1);
      evento.target.setSelectionRange(nuevaPosicion, nuevaPosicion);
    }
    
    actualizarTexto(vistaPrevia, areaEscritura);
    actualizarCaracteres(tarjetaTexto, areaEscritura);
    // Validar el botón alinear cada vez que se modifica el texto
    validarBotonAlinear(areaEscritura, botonAlinear);
  });

  botonAlinear.addEventListener('click', () => {
    const textoActual = areaEscritura.value.trim();
    if (textoActual === '' || textoActual.length === 0) {
      mostrarAlerta('Información', 'Agrega texto antes de usar la alineación.', 'info');
      return;
    }
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
 * Valida y actualiza el estado visual del botón alinear según si hay texto válido o no.
 * 
 * @param {HTMLTextAreaElement} areaEscritura - Área de texto a validar
 * @param {HTMLDivElement} botonAlinear - Botón alinear a validar
 * @returns {void}
 */
function validarBotonAlinear(areaEscritura, botonAlinear) {
  const textoSinEspacios = areaEscritura.value.trim();
  const hayTextoValido = textoSinEspacios.length > 0;
  
  if (hayTextoValido) {
    // Habilitar el botón
    botonAlinear.style.opacity = '1';
    botonAlinear.style.pointerEvents = 'auto';
    botonAlinear.style.cursor = 'pointer';
  } else {
    // Deshabilitar el botón visualmente
    botonAlinear.style.opacity = '0.5';
    botonAlinear.style.pointerEvents = 'none';
    botonAlinear.style.cursor = 'not-allowed';
  }
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

  const contadorCaracteres = tarjetaTexto.querySelector('.contador-caracteres');

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