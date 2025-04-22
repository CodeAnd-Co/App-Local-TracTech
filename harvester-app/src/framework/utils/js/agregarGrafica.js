export function agregarGrafica(contenedorId) {
    const contenedor = document.getElementById(contenedorId);
  
    const tarjetaGrafica = document.createElement('div');
    tarjetaGrafica.classList.add('tarjeta-grafica');
  
    tarjetaGrafica.innerHTML = `
    <div class="titulo-grafica">
      <div class="nombre-de-la-gr-fica">Nombre de la gráfica</div>
      <img class="bar-icono" src="../iconos/bar-icono0.svg" />
    </div>
    <div class="boton-formulas">
      <div class="formulas">Fórmulas</div>
    </div>
    <div class="botones-editar-eliminar">
      <div class="editar">
        <img class="editar-icono" src="../iconos/editar-icono0.svg" />
        <div class="texto-editar">Editar</div>
      </div>
      <div class="divisor"></div>
      <div class="eliminar">
        <img class="eliminar-icono" src="../iconos/eliminar-icono0.svg" />
        <div class="texto-eliminar">Eliminar</div>
      </div>
    </div>
    `;
  
    // Acción de eliminar
    tarjetaGrafica.querySelector('.eliminar').addEventListener('click', () => {
        tarjetaGrafica.remove();
    });
  
    contenedor.appendChild(tarjetaGrafica);
  }