const { eliminarCuadroFormulas} = require(`${rutaBase}/src/framework/utils/scripts/paginas/analisis/graficas/eliminarCuadroFormulas.js`);

/**
 * Crea un cuadro de fórmulas asociado a una gráfica.
 * @param {string[]} columnas - Lista de columnas disponibles en los datos.
 * @returns {void}
 */
function crearCuadroFormulas(columnas) {
  eliminarCuadroFormulas()

  const cuadroFormulas = document.createElement('div');
  cuadroFormulas.className = 'contenedor-formulas';

  cuadroFormulas.innerHTML = `<div class='titulo-formulas'>
              <img class='flecha-atras' src='../utils/iconos/FlechaAtras.svg' />
              <p class='texto'>Fórmulas</p>
          </div>
          <div class='seccion-formulas'>
              <div class='opciones-seccion'>
                  <p>Parámetros</p>
                  <div class='opciones-carta'>
                  </div>
              </div>
              <div class='opciones-seccion'>
                  <div class='titulo-aplicar-formulas'>
                      <p>Aplicar Fórmula</p>
                      <img class='circulo-ayuda' src='../utils/iconos/circulo-ayuda.svg' />
                  </div>
                  <div class='opciones-carta'>
                      <input class='search-section' placeholder='Encuentra una fórmula'>
                      <div class='contenedor-busqueda'>
                          <div class='formula'>
                              f(y): y + k
                          </div>
                          <div class='formula'>
                              f(y): 2x
                          </div>
                          <div class='formula'>
                              f(y): y + k
                          </div>
                      </div>
                      <div class='boton-agregar'>
                          <div >Aplicar Fórmula</div>
                      </div>
                  </div>
              </div>
          </div>`;

  const contenedoesSeleccion = cuadroFormulas.querySelectorAll('.opciones-carta');

  //ToDo: Escalar en número de variables dependiendo de las variables en las fórmulas
  crearMenuDesplegable(contenedoesSeleccion[0], 'A', columnas);
  // Fórmulas en contenedoesSeleccion[1]

  const botonCerrarCuadroFormulas = cuadroFormulas.querySelector('.titulo-formulas');
  botonCerrarCuadroFormulas.addEventListener('click', () => {
    cuadroFormulas.remove();
  });

  const seccionReporte = document.querySelector('.seccion-elemento-reporte');
  if (seccionReporte) {
    seccionReporte.insertAdjacentElement('afterend', cuadroFormulas);
  } else {
    document.querySelector('.frame-analisis').appendChild(cuadroFormulas);
  }
}


/**
 * Crea un menú desplegable para seleccionar columnas.
 * @param {HTMLDivElement} contenedor - Contenedor donde se agregará el menú desplegable.
 * @param {string} letra - Letra identificadora del menú.
 * @param {string[]} columnas - Lista de columnas disponibles.
 * @returns {void}
*/
function crearMenuDesplegable(contenedor, letra, columnas) {
    const nuevoMenu = document.createElement('div');
    nuevoMenu.className = 'opcion';
    const divLetra = document.createElement('div');
    divLetra.className = 'opcion-letra';
    divLetra.innerHTML = letra;
    const seleccionValores = document.createElement('select');
    seleccionValores.className = 'opcion-texto';
    seleccionValores.innerHTML = '<option>-- Selecciona Columna --</option>'
    columnas.forEach((texto) => {
        seleccionValores.innerHTML = `${seleccionValores.innerHTML}
        <option> ${texto} </option>`
    });
    
    nuevoMenu.appendChild(divLetra);
    nuevoMenu.appendChild(seleccionValores);
    contenedor.appendChild(nuevoMenu);
}


module.exports = { 
    crearCuadroFormulas
};