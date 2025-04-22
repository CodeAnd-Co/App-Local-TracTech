export function agregarTexto(contenedorId) {
  const contenedor = document.getElementById(contenedorId);

  const tarjetaTexto = document.createElement('div');
  tarjetaTexto.classList.add('tarjeta-texto');

  tarjetaTexto.innerHTML = `
    <div class="titulo-texto">
      <div class="nombre-del-texto">Nombre del texto</div>
      <img class="type" src="../utils/iconos/type0.svg" />
    </div>
    <textarea class="area-escritura" placeholder="Escribe aquí tu contenido..."></textarea>
    <div class="botones-editar-eliminar">
      <div class="eliminar">
        <img class="trash-icono" src="../utils/iconos/trash-icono0.svg" />
        <div class="texto-eliminar">Eliminar</div>
      </div>
    </div>
  `;

  // Acción de eliminar
  tarjetaTexto.querySelector('.eliminar').addEventListener('click', () => {
    tarjetaTexto.remove();
  });

  contenedor.appendChild(tarjetaTexto);
}
