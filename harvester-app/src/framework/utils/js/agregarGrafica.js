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

  tarjetaGrafica.id = nuevaId
  tarjetaGrafica.innerHTML = `<input class="titulo-grafica" placeholder="Nombre de la gráfica">
    <div class="boton-formulas">
      <div class="formulas">Fórmulas</div>
    </div>
    <div class="botones-editar-eliminar">
      <div class="editar">
        <img class="editar-icono" src="../utils/iconos/Editar2.svg" />
        <div class="texto-editar">Editar</div>
      </div>
      <div class="divisor"></div>
      <div class="eliminar">
        <img class="eliminar-icono" src="../utils/iconos/Basura.svg" />
        <div class="texto-eliminar">Eliminar</div>
      </div>
    </div>
    `;

  //Crea el cuadro que contiene la grafica en la previsualización
  const graficaDiv = document.createElement('div');
  graficaDiv.className = 'previsualizacion-grafica';
  graficaDiv.id = nuevaId;

  //Crea la gráfica que se va a agregar
  const contenedorGrafico = document.createElement('canvas');
  var contexto = contenedorGrafico.getContext('2d')
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

  graficaDiv.appendChild(contenedorGrafico)

  // Añadir eventos para cambiar gráfico dinámicamente desde la tarjeta
  const hijosTarjeta = tarjetaGrafica.children

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
    const graficasExistentes = Array.from(previsualización.querySelectorAll(".previsualizacion-grafica"))
    const graficaElim = graficasExistentes.filter(grafica => grafica.id = tarjetaGrafica.id)[0]
    graficaElim.remove()

  });


  //Añadir tarjeta y gráfico a página
  contenedor.appendChild(tarjetaGrafica);
  previsualización.appendChild(graficaDiv);
}

window.agregarGrafica = agregarGrafica;