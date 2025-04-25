function agregarTexto(contenedorId, previewId) {
  const contenedor = document.getElementById(contenedorId);
  const previewContainer = document.getElementById(previewId);

  // Generar ID incremental
  const tarjetas = contenedor.querySelectorAll('.tarjeta-texto');
  const nuevaId = tarjetas.length ? (parseInt(tarjetas[tarjetas.length - 1].id) || 0) + 1 : 1;

  // 1) Crear tarjeta
  const tarjeta = document.createElement('div');
  tarjeta.classList.add('tarjeta-texto');
  tarjeta.id = nuevaId;
  tarjeta.innerHTML = `
    <div class="titulo-texto">
      <select class="tipo-texto">
        <option value="titulo">Título</option>
        <option value="subtitulo">Subtítulo</option>
        <option value="contenido">Contenido</option>
      </select>
      <img class="type" src="../utils/iconos/Texto.svg" />
    </div>
    <textarea class="area-escritura" placeholder="Escribe aquí tu contenido..."></textarea>
    <div class="botones-editar-eliminar">
      <!-- Botón Alinear -->
      <div class="alinear">
        <div class="icono-align align-left">
          <span></span><span></span><span></span>
        </div>
        <div class="texto-editar">Alinear</div>
      </div>
      <div class="divisor"></div>
      <!-- Botón Eliminar -->
      <div class="eliminar">
        <img class="trash-icono" src="../utils/iconos/Basura.svg" />
        <div class="texto-eliminar">Eliminar</div>
      </div>
    </div>
  `;

  // 2) Crear preview asociado
  const preview = document.createElement('div');
  preview.classList.add('previsualizacion-texto', 'preview-titulo');
  preview.id = `preview-texto-${nuevaId}`;
  preview.alignIndex = 0;  // 0=left,1=center,2=justify,3=right
  previewContainer.appendChild(preview);

  // Referencias
  const selectTipo  = tarjeta.querySelector('.tipo-texto');
  const textarea    = tarjeta.querySelector('.area-escritura');
  const btnEliminar = tarjeta.querySelector('.eliminar');
  const btnAlinear  = tarjeta.querySelector('.alinear');
  const iconoAlign  = btnAlinear.querySelector('.icono-align');

  // Actualizar contenido y estilo
  function actualizarPreview() {
    preview.textContent = textarea.value;
    preview.classList.remove('preview-titulo','preview-subtitulo','preview-contenido');
    preview.classList.add(`preview-${selectTipo.value}`);
  }

  // Ciclo de alineaciones
  btnAlinear.addEventListener('click', () => {
    const alignments = ['left','center','justify','right'];
    preview.alignIndex = (preview.alignIndex + 1) % alignments.length;
    const modo = alignments[preview.alignIndex];
    preview.style.textAlign = modo;
    // actualizar icono
    iconoAlign.className = `icono-align align-${modo}`;
  });

  // Listeners edición/eliminación
  selectTipo.addEventListener('change', actualizarPreview);
  textarea.addEventListener('input', actualizarPreview);
  btnEliminar.addEventListener('click', () => {
    tarjeta.remove();
    preview.remove();
  });

  // Insertar tarjeta
  contenedor.appendChild(tarjeta);
}

window.agregarTexto = agregarTexto;