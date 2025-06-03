const { mostrarAlerta } = require(`${rutaBase}/src/framework/vistas/includes/componentes/moleculas/alertaSwal/alertaSwal`);

/**
 * Actualiza el contador de caracteres restantes para el buscador de fórmulas.
 * @param {HTMLInputElement} campoEntrada - Campo de entrada a validar.
 * @returns {void}
 */
function actualizarCaracteresBuscador(campoEntrada) {
  const caracteresUsados = campoEntrada.value.length;
  const limite = parseInt(campoEntrada.getAttribute('maxlength'), 10);

  // Verificación cuando se alcanza el maxlength
  if (caracteresUsados >= limite) {
    // Usar setTimeout para evitar conflictos con el evento input
    setTimeout(() => {
      mostrarAlerta('Límite alcanzado', `Has alcanzado el límite máximo de caracteres para la búsqueda de fórmulas (${limite} caracteres).`, 'warning');
    }, 100);
  }
}

/**
 * Filtra y renderiza las fórmulas según el término de búsqueda.
 * @param {HTMLDivElement} contenedor - Contenedor donde se mostrarán las fórmulas.
 * @param {string} terminoBusqueda - Término de búsqueda para filtrar fórmulas.
 * @returns {void}
 */
function filtrarYRenderizarFormulas(contenedor, terminoBusqueda = '', formulasDisponibles = []) {
  // Limpiar contenedor
  contenedor.innerHTML = '';

  // Verificar si son solo espacios
  const sonSoloEspacios = terminoBusqueda.length > 0 && terminoBusqueda.trim() === '';

  // Si no hay término de búsqueda, mostrar mensaje inicial
  if (!terminoBusqueda || terminoBusqueda.trim() === '') {
    if (sonSoloEspacios) {
      contenedor.innerHTML = '<div class="mensaje-sin-resultados">No se puede buscar solo con espacios en blanco</div>';
    } else {
      contenedor.innerHTML = '<div class="mensaje-inicial">Escribe para buscar fórmulas...</div>';
    }
    return;
  }

  // Si no hay fórmulas cargadas, mostrar mensaje específico
  if (formulasDisponibles.length === 0) {
    contenedor.innerHTML = '<div class="mensaje-sin-formulas">No hay fórmulas creadas. <br>Ve al módulo de fórmulas para crear una.</div>';
    return;
  }

  // Filtrar fórmulas por término de búsqueda SOLO en el nombre
  const terminoLowerCase = terminoBusqueda.toLowerCase().trim();
  const formulasFiltradas = formulasDisponibles.filter(formula => {
    return formula.Nombre.toLowerCase().includes(terminoLowerCase);
  });

  // Renderizar fórmulas filtradas
  if (formulasFiltradas.length === 0) {
    contenedor.innerHTML = `<div class="mensaje-sin-resultados">No hay fórmulas que coincidan con la busqueda</div>`;
    return;
  }

  // eslint-disable-next-line no-unused-vars
  formulasFiltradas.forEach((formula, indice) => {
    const elementoFormula = document.createElement('div');
    elementoFormula.className = 'formula-objeto';
    
    const radioId = `formula-${formula.idFormula}`;
    
    // Crear el elemento sin usar innerHTML para evitar problemas de escape
    const inputRadio = document.createElement('input');
    inputRadio.type = 'radio';
    inputRadio.id = radioId;
    inputRadio.name = 'formula-seleccionada';
    inputRadio.value = formula.idFormula;
    inputRadio.style.display = 'none';
    
    // Almacenar los datos directamente en propiedades del elemento
    inputRadio.formulaNombre = formula.Nombre;
    inputRadio.formulaDatos = formula.Datos;
    
    const divFormula = document.createElement('div');
    divFormula.className = 'formula';
    divFormula.setAttribute('data-radio-id', radioId);
    
    const label = document.createElement('label');
    label.setAttribute('for', radioId);
    label.className = 'formula-label';
    label.textContent = formula.Nombre;
    
    divFormula.appendChild(label);
    elementoFormula.appendChild(inputRadio);
    elementoFormula.appendChild(divFormula);
    
    // Agregar evento de clic al div .formula
    const radioButton = inputRadio;
    
    divFormula.addEventListener('click', () => {
      // Deseleccionar todas las fórmulas anteriores
      contenedor.querySelectorAll('.formula').forEach(div => {
        div.classList.remove('formula-seleccionada');
      });
      
      // Deseleccionar todos los radio buttons
      contenedor.querySelectorAll('input[type="radio"]').forEach(radio => {
        radio.checked = false;
      });
      
      // Seleccionar la fórmula actual
      radioButton.checked = true;
      divFormula.classList.add('formula-seleccionada');
      
      // Llamar a la función de selección
      seleccionarFormula(radioButton, contenedor);
    });
    
    contenedor.appendChild(elementoFormula);
  });
}

/**
 * Maneja la selección de una fórmula.
 * @param {HTMLInputElement} radioBotton - Radio button de fórmula seleccionado.
 * @param {HTMLDivElement} contenedor - Contenedor de fórmulas.
 * @returns {void}
 */
function seleccionarFormula(radioBotton, contenedor) {
  // Guardar la fórmula seleccionada para uso posterior
  const formulaSeleccionada = {
    id: radioBotton.value,
    nombre: radioBotton.formulaNombre,
    datos: radioBotton.formulaDatos
  };
  
  // Almacenar en el elemento padre para acceso posterior
  const cuadroFormulas = contenedor.closest('.contenedor-formulas');
  if (cuadroFormulas) {
    cuadroFormulas.dataset.formulaSeleccionada = JSON.stringify(formulaSeleccionada);
  }
}

module.exports = {
  filtrarYRenderizarFormulas,
  actualizarCaracteresBuscador
};