const { Chart } = require('chart.js/auto');

function agregarGrafica(contenedorId, previsualizaciónId) {
  const contenedor = document.getElementById(contenedorId);
  const previsualización = document.getElementById(previsualizaciónId);

  //Crea tarjeta para nuevo gráfico
  const tarjetaGrafica = document.createElement('div');
  tarjetaGrafica.classList.add('tarjeta-grafica');

  //Obtiene la lista de todas las trajetas de gráfico que ya existen
  const tarjetasGraficas = contenedor.querySelectorAll('.tarjeta-grafica');

  //Si ya hay tarjetas de gráficos asigna la id siguiente, si no la nueva id se manteiene en 1
  let nuevaId = 1;

  if (tarjetasGraficas && tarjetasGraficas.length > 0) {
    const idPrevia = parseInt(tarjetasGraficas[tarjetasGraficas.length - 1].id);
    nuevaId = idPrevia + 1;
  }

  tarjetaGrafica.id = nuevaId;
  tarjetaGrafica.innerHTML = `<input class="titulo-grafica" placeholder="Nombre de la gráfica">
    <div class="boton-formulas">
      <div class="formulas">Fórmulas</div>
    </div>
    <div class="botones-editar-eliminar">
      <div class="eliminar">
        <img class="eliminar-icono" src="../utils/iconos/Basura.svg" />
        <div class="texto-eliminar">Eliminar</div>
      </div>
    </div>
    `;

  const botonFormulas = tarjetaGrafica.querySelector('.boton-formulas');
  botonFormulas.addEventListener('click', () => crearCuadroGraficas(previsualización));

  //Crea el cuadro que contiene la grafica en la previsualización
  const graficaDiv = document.createElement('div');
  graficaDiv.className = 'previsualizacion-grafica';
  graficaDiv.id = nuevaId;

  //Crea la gráfica que se va a agregar
  const contenedorGrafico = document.createElement('canvas');
  var contexto = contenedorGrafico.getContext('2d');
  const grafico = new Chart(contexto, {
    type: 'line',

    data: {
      labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
      datasets: [{
        label: 'My First dataset',
        backgroundColor: 'rgb(255, 99, 132)',
        borderColor: 'rgb(255, 99, 132)',
        data: [0, 10, 5, 2, 20, 30, 45]
      }]
    },

    options: {
      plugins: {
        title: {
          display: true,
          text: '',
        }
      }
    }
  });

  graficaDiv.appendChild(contenedorGrafico);

  // Añadir eventos para cambiar gráfico dinámicamente desde la tarjeta
  const hijosTarjeta = tarjetaGrafica.children;

  // Cambiar título
  const titulo = hijosTarjeta[0]
  titulo.addEventListener('input', () => {
    console.log(titulo.value, titulo.textContent)
    grafico.options.plugins.title.text = titulo.value;
    grafico.update()
  });


  // Añadir acción de eliminar
  tarjetaGrafica.querySelector('.eliminar').addEventListener('click', () => {
    tarjetaGrafica.remove();
    const graficasExistentes = Array.from(previsualización.querySelectorAll(".previsualizacion-grafica"));
    const graficaElim = graficasExistentes.filter(grafica => grafica.id == tarjetaGrafica.id)[0];
    graficaElim.remove();
    if (cuadroFormulasExiste()) {
      document.querySelector('.contenedor-formulas').remove();
    }
  });


  //Añadir tarjeta y gráfico a página
  contenedor.appendChild(tarjetaGrafica);
  previsualización.appendChild(graficaDiv);
}

function crearCuadroGraficas(previsualizacion) {
  //Si el cuadro de fórmulas no existe lo crea
  if (!cuadroFormulasExiste()) {

    //ToDo: añadir lógica para cambiar la interfaz dependiendo de la gráfica en la que se presionó el botón
    const cuadroFormulas = document.createElement('div');
    cuadroFormulas.className = 'contenedor-formulas';

    //ToDo: Tomar las cariables de los datos disponibles y añadir lógica para cuando no hay datos
    cuadroFormulas.innerHTML = `<div class="titulo-formulas">
                <img class="flecha-atras" src="../utils/iconos/FlechaAtras.svg" />
                <p class="texto">Fórmulas</p>
            </div>
            <div class="seccion-formulas">
                <div class="opciones-seccion">
                    <p>Parámetros</p>
                    <div class="opciones-carta">
                        <div class="opcion">
                            <div class="opcion-letra">
                                A
                            </div>
                            <select class="opcion-texto">
                                <option selected>Gasolina</option>
                                <option>Velocidad</option>
                                <option>Aceleración</option>
                            </select>
                        </div>
                        <div class="opcion">
                            <div class="opcion-letra">
                                B
                            </div>
                            <select class="opcion-texto">
                                <option>Gasolina</option>
                                <option selected>Velocidad</option>
                                <option>Aceleración</option>
                            </select>
                        </div>
                        <div class="opcion">
                            <div class="opcion-letra">
                                C
                            </div>
                            <select class="opcion-texto">
                                <option>Gasolina</option>
                                <option>Velocidad</option>
                                <option selected>Aceleración</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div class="opciones-seccion">
                    <div class="titulo-aplicar-formulas">
                        <p>Aplicar Fórmula</p>
                        <img class="circulo-ayuda" src="../utils/iconos/circulo-ayuda.svg" />
                    </div>
                    <div class="opciones-carta">
                        <input class="search-section" placeholder="Encuentra una fórmula">
                        <div class="contenedor-busqueda">
                            <div class="formula">
                                f(y): y + k
                            </div>
                            <div class="formula">
                                f(y): 2x
                            </div>
                            <div class="formula">
                                f(y): y + k
                            </div>
                        </div>
                        <div class="boton-agregar">
                            <div >Aplicar Fórmula</div>
                        </div>
                    </div>
                </div>
            </div>`;
  
    const botonRegresar = cuadroFormulas.querySelector('.titulo-formulas');
    botonRegresar.addEventListener('click', () => {
      cuadroFormulas.remove();
    });
  
    previsualizacion.parentNode.insertBefore(cuadroFormulas, previsualizacion);
  }
}

// Busca entre los elementos del contenedor de análisis y regresa si ya existe el cuadro para aplicar fórmulas
function cuadroFormulasExiste() {
  const cuadrosExistentes = Array.from(document.querySelector('.frame-analisis').children);
  const cuadros = cuadrosExistentes.filter(cuadro => cuadro.className == 'contenedor-formulas');
  return cuadros.length == 1;
}

window.agregarGrafica = agregarGrafica;