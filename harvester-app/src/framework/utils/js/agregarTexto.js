function agregarTexto(contenedorId, previewId) {
  const contenedor = document.getElementById(contenedorId);
  const previewContainer = document.getElementById(previewId);

  // Generar un ID incremental para sincronizar tarjeta ↔ preview
  const tarjetas = contenedor.querySelectorAll('.tarjeta-texto');
  let nuevaId = 1;
  if (tarjetas.length) {
    const last = parseInt(tarjetas[tarjetas.length - 1].id) || 0;
    nuevaId = last + 1;
  }

  // 1) Crear tarjeta de edición
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
      <div class="eliminar">
        <img class="trash-icono" src="../utils/iconos/Basura.svg" />
        <div class="texto-eliminar">Eliminar</div>
      </div>
    </div>
  `;

  // 2) Crear cuadro de preview
  const preview = document.createElement('div');
  preview.classList.add('previsualizacion-texto', 'preview-titulo');
  preview.id = `preview-texto-${nuevaId}`;
  preview.textContent = ''; 
  previewContainer.appendChild(preview);

  // Obtener elementos clave
  const selectTipo = tarjeta.querySelector('.tipo-texto');
  const textarea  = tarjeta.querySelector('.area-escritura');
  const btnEliminar = tarjeta.querySelector('.eliminar');

  // Función que actualiza estilo + contenido del preview
  function actualizarPreview() {
    // texto
    preview.textContent = textarea.value;
    // clases de estilo
    preview.classList.remove('preview-titulo','preview-subtitulo','preview-contenido');
    if      (selectTipo.value === 'titulo')    preview.classList.add('preview-titulo');
    else if (selectTipo.value === 'subtitulo') preview.classList.add('preview-subtitulo');
    else                                       preview.classList.add('preview-contenido');
  }

  // Listeners
  selectTipo.addEventListener('change',  actualizarPreview);
  textarea .addEventListener('input',   actualizarPreview);
  btnEliminar.addEventListener('click', () => {
    tarjeta.remove();
    preview.remove();
  });

  // Añadir la tarjeta al contenedor izquierdo
  contenedor.appendChild(tarjeta);
}

window.agregarTexto = agregarTexto;