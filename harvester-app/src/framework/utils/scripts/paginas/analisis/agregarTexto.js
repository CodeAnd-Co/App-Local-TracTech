// RF17 - Usuario añade cuadro de texto al reporte - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/rf17/
// RF18 - Usuario modifica cuadro de texto del reporte - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/rf18/
// RF19 - Usuario elimina cuadro de texto del reporte - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/rf19/

/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
if (typeof Swal === 'undefined') {
  const Swal = require(`${rutaBase}/node_modules/sweetalert2/dist/sweetalert2.all.min.js`);
}
const { ElementoNuevo, Contenedores } = require(`${rutaBase}/src/backend/data/analisisModelos/elementoReporte.js`);

/**
 * Valores permitidos para tipos de texto
 * @readonly
 * @enum {string}
 */
const TIPOS_TEXTO_PERMITIDOS = {
  TITULO: 'titulo',
  SUBTITULO: 'subtitulo', 
  CONTENIDO: 'contenido'
};

/**
 * Valores permitidos para alineación
 * @readonly
 * @enum {string}
 */
const ALINEACIONES_PERMITIDAS = ['left', 'center', 'right'];

/**
 * Límite máximo de caracteres permitidos
 * @constant {number}
 */
const MAX_CARACTERES = 1000;

/**
 * Sanitiza y valida un valor contra una lista de valores permitidos
 * @param {string} valor - Valor a validar
 * @param {string[]} valoresPermitidos - Array de valores permitidos
 * @param {string} valorPorDefecto - Valor por defecto si la validación falla
 * @returns {string} Valor sanitizado o valor por defecto
 */
function sanitizarValor(valor, valoresPermitidos, valorPorDefecto) {
  if (typeof valor !== 'string') return valorPorDefecto;
  const valorLimpio = valor.trim().toLowerCase();
  return valoresPermitidos.includes(valorLimpio) ? valorLimpio : valorPorDefecto;
}

/**
 * Crea y agrega una tarjeta de texto al contenedor de edición y su correspondiente
 * previsualización. Puede insertarse antes o después de otra tarjeta existente.
 *
 * @param {string} idContenedor - ID del elemento donde se añadirán las tarjetas de edición
 * @param {string} idContenedorPrevisualizacion - ID del elemento donde se mostrará la previsualización
 * @param {HTMLDivElement|null} [tarjetaRef=null] - Nodo de tarjeta existente junto al cual insertar
 * @param {'antes'|'despues'|null} [posicion=null] - Posición de inserción: 'antes' para arriba, 'despues' para abajo
 * @returns {HTMLDivElement|undefined} La tarjeta de texto creada, o undefined si hay error
 */
function agregarTexto(
  idContenedor,
  idContenedorPrevisualizacion,
  tarjetaRef = null,
  posicion = null
) {
  // Validación de entrada
  if (typeof idContenedor !== 'string' || typeof idContenedorPrevisualizacion !== 'string') {
    console.error('IDs de contenedor deben ser strings');
    return;
  }

  const contenedor = document.getElementById(idContenedor);
  const contenedorPrevia = document.getElementById(idContenedorPrevisualizacion);
  const contenedores = new Contenedores(contenedor, contenedorPrevia);

  if (!contenedor || !contenedorPrevia) {
    Swal.fire({
      title: 'Error',
      text: 'Ocurrió un error al agregar cuadro de texto.',
      icon: 'error',
      confirmButtonColor: '#a61930',
    });
    return;
  }

  configurarObservadorLimite(contenedor);

  const idsTarjetasTexto = Array.from(contenedor.querySelectorAll('.tarjeta-texto'), (tarjeta) => {
    const id = parseInt(tarjeta.id, 10);
    return isNaN(id) ? 0 : id;
  });
    
  let nuevoId;
  if (idsTarjetasTexto.length > 0) {
    const idAnterior = Math.max(...idsTarjetasTexto);
    nuevoId = idAnterior + 1;
  } else {
    nuevoId = 1;
  }

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
    <textarea class='area-escritura' placeholder='Escribe aquí tu contenido...' maxlength='${MAX_CARACTERES}'></textarea>
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

  // Event listeners con validación
  selectorTipo.addEventListener('change', (event) => {
    const tipoSeleccionado = sanitizarValor(
      event.target.value, 
      Object.values(TIPOS_TEXTO_PERMITIDOS), 
      TIPOS_TEXTO_PERMITIDOS.TITULO
    );
    
    vistaPrevia.classList.remove('preview-titulo', 'preview-subtitulo', 'preview-contenido');
    vistaPrevia.classList.add(`preview-${tipoSeleccionado}`);
  });

  areaEscritura.addEventListener('input', () => {
    actualizarTexto(vistaPrevia, areaEscritura);
    actualizarCaracteres(tarjetaTexto, areaEscritura);
  });

  botonAlinear.addEventListener('click', () => {
    const indiceActual = vistaPrevia.alignIndex || 0;
    const nuevoIndice = (indiceActual + 1) % ALINEACIONES_PERMITIDAS.length;
    const alineado = ALINEACIONES_PERMITIDAS[nuevoIndice];
    
    vistaPrevia.alignIndex = nuevoIndice;
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
 * Actualiza el contenido de la vista previa según el texto del área de escritura.
 * Divide el texto por líneas y crea párrafos individuales con estilos de word-wrap.
 * 
 * @param {HTMLDivElement} vistaPrevia - Elemento div que contiene la vista previa del texto
 * @param {HTMLTextAreaElement} areaEscritura - Textarea con el contenido a mostrar en la vista previa
 */
function actualizarTexto(vistaPrevia, areaEscritura) {
  if (!vistaPrevia || !areaEscritura) return;
  
  vistaPrevia.innerHTML = '';
  const texto = String(areaEscritura.value || '').split('\n');
  
  texto.forEach((linea) => {
    const parrafo = document.createElement('p');
    // Usar textContent para prevenir XSS en el contenido del usuario
    parrafo.textContent = linea;

    parrafo.style.maxWidth = '100%';
    parrafo.style.wordWrap = 'break-word';
    parrafo.style.overflowWrap = 'break-word';
    parrafo.style.whiteSpace = 'normal';

    vistaPrevia.appendChild(parrafo);
  });
}

/**
 * Actualiza el contador de caracteres restantes en la tarjeta del área de escritura.
 * Cambia el color del contador a rojo cuando quedan menos de 50 caracteres disponibles.
 * 
 * @param {HTMLDivElement} tarjetaTexto - Tarjeta de edición que contiene el cuadro de texto
 * @param {HTMLTextAreaElement} areaEscritura - Textarea con el contenido a contar
 */
function actualizarCaracteres(tarjetaTexto, areaEscritura) {
  if (!tarjetaTexto || !areaEscritura) return;
  
  const caracteresUsados = String(areaEscritura.value || '').length;
  const limite = parseInt(areaEscritura.getAttribute('maxlength'), 10) || MAX_CARACTERES;
  const caracteresRestantes = limite - caracteresUsados;

  let contadorCaracteres = tarjetaTexto.querySelector('.contador-caracteres');
  if (!contadorCaracteres) {
    contadorCaracteres = document.createElement('div');
    contadorCaracteres.className = 'contador-caracteres';
    const botonesContainer = tarjetaTexto.querySelector('.botones-editar-eliminar');
    if (botonesContainer) {
      tarjetaTexto.insertBefore(contadorCaracteres, botonesContainer);
    }
  }

  contadorCaracteres.textContent = `${caracteresUsados}/${limite} caracteres`;

  if (caracteresRestantes < 50) {
    contadorCaracteres.style.color = '#e74c3c';
  } else {
    contadorCaracteres.style.color = '#7f8c8d';
  }
}

/**
 * Inserta una tarjeta de texto y su previsualización en la posición deseada dentro de los contenedores.
 * Si no se especifica posición, agrega los elementos al final de sus respectivos contenedores.
 * 
 * @param {HTMLDivElement|null} tarjetaRef - Tarjeta de referencia para la inserción
 * @param {ElementoNuevo} elementoReporte - Objeto que contiene la tarjeta y su previsualización
 * @param {Contenedores} contenedores - Objeto que contiene los contenedores de tarjetas y previsualizaciones
 * @param {'antes'|'despues'|null} posicion - Posición de inserción relativa a tarjetaRef
 */
function agregarEnPosicion(tarjetaRef, elementoReporte, contenedores, posicion) {
  if (!elementoReporte || !contenedores) return;
  
  // Validar posición si se proporciona
  const posicionValida = posicion ? sanitizarValor(posicion, ['antes', 'despues'], null) : null;
  
  if (tarjetaRef && posicionValida) {
    if (posicionValida === 'antes') {
      contenedores.contenedorTarjeta.insertBefore(elementoReporte.tarjeta, tarjetaRef);
    } else {
      contenedores.contenedorTarjeta.insertBefore(elementoReporte.tarjeta, tarjetaRef.nextSibling);
    }

    const idRef = tarjetaRef.id;
    let vistaRef;

    if (tarjetaRef.classList.contains('tarjeta-texto')) {
      vistaRef = contenedores.contenedorPrevisualizacion.querySelector(`#previsualizacion-texto-${CSS.escape(idRef)}`);
    } else if (tarjetaRef.classList.contains('tarjeta-grafica')) {
      vistaRef = contenedores.contenedorPrevisualizacion.querySelector(`#previsualizacion-grafica-${CSS.escape(idRef)}`);
    }

    if (vistaRef) {
      if (posicionValida === 'antes') {
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
 * Configura un observador de mutaciones para controlar la visibilidad de botones de eliminación.
 * Oculta los botones de eliminar cuando solo queda una tarjeta de texto y una gráfica,
 * garantizando que siempre haya al menos un elemento de cada tipo en el reporte.
 * 
 * @param {HTMLDivElement} contenedor - Contenedor de tarjetas que será observado
 */
function configurarObservadorLimite(contenedor) {
  if (!contenedor) return;
  
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