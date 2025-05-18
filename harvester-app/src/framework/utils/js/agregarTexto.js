// RF17 - Usuario añade cuadro de texto al reporte - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/rf17/
// RF18 - Usuario modifica cuadro de texto del reporte - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/rf18/
// RF19 - Usuario elimina cuadro de texto del reporte - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/rf19/

/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
if (typeof Swal === 'undefined') {
  const Swal = require('sweetalert2');
}

/**
 * Crea y agrega una tarjeta de texto al contenedor de edición y su correspondiente
 * previsualización. Puede insertarse antes o después de otra tarjeta.
 *
 * @param {string} idContenedor           - ID del elemento donde se añadirán las tarjetas de edición.
 * @param {string} idContenedorPrevisualizacion - ID del elemento donde se mostrará la previsualización.
 * @param {Element|null} tarjetaRef       - Nodo de tarjeta existente junto al cual insertar.
 * @param {'antes'|'despues'} posicion    - 'antes' para arriba, 'despues' para abajo.
 * @returns {Element} tarjetaTexto - La tarjeta de texto creada.
 */
function agregarTexto(
  idContenedor,
  idContenedorPrevisualizacion,
  tarjetaRef = null,
  posicion = null
) {
  const contenedor = document.getElementById(idContenedor);
  const contenedorPrevia = document.getElementById(idContenedorPrevisualizacion);

  if (!contenedor || !contenedorPrevia) {
    Swal.fire({
      title: 'Error',
      text: 'Ocurrió un error al agregar cuadro de texto.',
      icon: 'error',
      confirmButtonColor: '#1F4281',
    });
    return
  }

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

  const tarjetasTexto = contenedor.querySelectorAll('.tarjeta-texto');
  let nuevoId;

  if (tarjetasTexto.length > 0) {
    const idAnterior = parseInt(tarjetasTexto[tarjetasTexto.length - 1].id, 10)
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
  vistaPrevia.alignIndex = 0;

  if (tarjetaRef && (posicion === 'antes' || posicion === 'despues')) {
    if (posicion === 'antes') {
      contenedor.insertBefore(tarjetaTexto, tarjetaRef);
    } else {
      contenedor.insertBefore(tarjetaTexto, tarjetaRef.nextSibling);
    }

    const idRef = tarjetaRef.id;
    let vistaRef;

    if (tarjetaRef.classList.contains('tarjeta-texto')) {
      vistaRef = contenedorPrevia.querySelector(`#preview-texto-${idRef}`);
    } else if (tarjetaRef.classList.contains('tarjeta-grafica')) {
      vistaRef = contenedorPrevia.querySelector(`.previsualizacion-grafica[id='${idRef}']`);
    }

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
    contenedor.appendChild(tarjetaTexto);
    contenedorPrevia.appendChild(vistaPrevia);
  }

  const selectorTipo = tarjetaTexto.querySelector('.tipo-texto');
  const areaEscritura = tarjetaTexto.querySelector('.area-escritura');
  const botonEliminar = tarjetaTexto.querySelector('.eliminar');
  const botonAlinear = tarjetaTexto.querySelector('.alinear');
  const iconoAlineacion = botonAlinear.querySelector('.icono-align');

  /**
   * Actualiza el contenido y estilo de la vista previa según el texto y tipo.
   * 
   * @returns {void}
   */
  function actualizarVistaPrevia() {
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

    vistaPrevia.style.maxWidth = '100%';
    vistaPrevia.style.wordWrap = 'break-word';
    vistaPrevia.style.overflowWrap = 'break-word';
    vistaPrevia.style.whiteSpace = 'normal';

    vistaPrevia.classList.remove('preview-titulo', 'preview-subtitulo', 'preview-contenido');
    vistaPrevia.classList.add(`preview-${selectorTipo.value}`);
  }

  selectorTipo.addEventListener('change', actualizarVistaPrevia);
  areaEscritura.addEventListener('input', () => {
    actualizarVistaPrevia();

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

module.exports = {
  agregarTexto
};