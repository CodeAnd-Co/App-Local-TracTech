// RF67 Crear Fórmula - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF67 
// RF69 Guardar Fórmula - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF69
const { LONGITUD_MAXIMA_FORMULA,
    LONGITUD_MAXIMA_NOMBRE_FORMULA } = require(`${rutaBase}src/framework/utils/scripts/constantes.js`);

const { abrirAyudaExterna } = require(`${rutaBase}src/framework/utils/scripts/middleware/ayudaExterna.js`);
const { mostrarAlerta } = require(`${rutaBase}/src/framework/vistas/includes/componentes/moleculas/alertaSwal/alertaSwal`);

const { guardarFormula } = require(`${rutaBase}src/backend/casosUso/formulas/crearFormula.js`);

inicializarCrearFormula();

/**
 * @function eliminarElemento
 * @description Elimina un elemento del DOM.
* @param {HTMLElement} boton - El botón que se ha pulsado para eliminar el elemento.
 * @returns {void}
 * @throws {Error} Si el elemento no se puede eliminar.
 */
// eslint-disable-next-line no-unused-vars
function eliminarElemento(boton) {
    const elementoABorrar = boton.parentNode.parentNode;
    elementoABorrar.remove();
}

// eslint-disable-next-line no-unused-vars
function cancelarVista(){
    window.cargarModulo('formulas');
}

/**
 * @function inicializarCrearFormula
 * @description Inicializa el módulo de creación de fórmulas al cargar la página.
 * @returns {void}
 * @throws {Error} Si el botón de creación de fórmulas no se encuentra en el DOM.
 */
async function inicializarCrearFormula() {
    const nombreArchivo = localStorage.getItem('nombreArchivoExcel');
    document.getElementById('btnCancelar').addEventListener('click', () => {
        window.cargarModulo('formulas');
    });

    document.getElementById('btnGuardar').addEventListener('click', async () => {
        procesarFormula();
    });

    document.getElementById('btnAyuda').addEventListener('click', async () => {
        await abrirAyudaExterna('https://docs.google.com/document/d/14tKDIFsQO1i_32oEwaGaE7u8hHv3pcdb3frWU7vJ9M8/edit?tab=t.0#heading=h.ldire7zbv2f');
    });

    document.getElementById('btnGenerar').addEventListener('click', () => {
        const contenedor = document.getElementById('function-arguments');
        if (contenedor) {
            generarFormulaCompleja();
        } else {
            mostrarAlerta('Error', 'No se ha podido generar la fórmula.', 'error');
        }
    });

    if (nombreArchivo === null || nombreArchivo === undefined) {
        mostrarAlerta('Error', 'No hay un archivo cargado.', 'error');
        document.getElementById('btnGuardar').disabled = true;
        document.getElementById('btnGenerar').disabled = true;
        return;
    }
}       


/**
 * @function procesarFormula
 * @description Guarda la fórmula generada en el backend.
 * @returns {Promise<void>} - Una promesa que se resuelve cuando la fórmula se guarda correctamente.
 * @throws {Error} Si hay un error al guardar la fórmula.
 */
async function procesarFormula() {
    const contenedor = document.getElementById('function-arguments');
    if (!validarCamposFormula(contenedor)) {
        return;
    }

    generarFormulaCompleja();
    const nombreFormulaSinProcesar = document.getElementById('nombreFormula').value;
    const nombreFormula = nombreFormulaSinProcesar.trim();
    const formulasGuardadas = localStorage.getItem('nombresFormulas'); 
    if (nombreFormula === '' || nombreFormula.length >= LONGITUD_MAXIMA_NOMBRE_FORMULA) {
        mostrarAlerta(
            'Error',
            `Verifica que la fórmula tenga un nombre válido y menor de ${LONGITUD_MAXIMA_NOMBRE_FORMULA} caracteres.`,
            'error'
        );
        return;
    }
    if (formulasGuardadas) {
        const nombresFormulas = JSON.parse(formulasGuardadas);
        if (nombresFormulas.includes(nombreFormula)) {
            mostrarAlerta('Error', 'Ya existe una fórmula con ese nombre.', 'error');
            return;
        }
    }
// Obtener referencia al botón de guardar
    const btnGuardar = document.getElementById('btnGuardar');    
// Deshabilitar el botón para evitar múltiples clics
    btnGuardar.disabled = true;

    // Almacenar el contenido original del botón
    const contenidoOriginal = btnGuardar.innerHTML;

    // Cambiar el texto del botón para indicar que está procesando
    btnGuardar.innerHTML = '<div>Guardando fórmula...</div>';

    const cuadroTextoGenerado = document.getElementById('resultado').innerText;
    // Mucho ojo aquí, si vamos a utilizar rangos de celdas, tenemos que separarlo de otra forma
    if (cuadroTextoGenerado === '') {
        mostrarAlerta('Error', 'Verifica que la fórmula ha sido generada.', 'error');
        btnGuardar.innerHTML = contenidoOriginal;
        btnGuardar.disabled = false;
        return;
    } else if (cuadroTextoGenerado === 'Por favor, selecciona una función principal.') {
        mostrarAlerta('Error', 'Verifica que la fórmula esté completa.', 'error');
        btnGuardar.innerHTML = contenidoOriginal;
        btnGuardar.disabled = false;
        return;

    }
    if (cuadroTextoGenerado.length >= LONGITUD_MAXIMA_FORMULA) {
        mostrarAlerta('Error', `La fórmula excede los ${LONGITUD_MAXIMA_FORMULA} caracteres, no puede ser guardada.`, 'error');
        btnGuardar.innerHTML = contenidoOriginal;
        btnGuardar.disabled = false;
        return;
    }
    const formula = cuadroTextoGenerado.split(':')[1].trim();

    try {
        const respuesta = await guardarFormula(nombreFormula, formula);
        if (respuesta.ok) {

            try{
                await mostrarAlerta('Fórmula guardada', 'La fórmula ha sido guardada exitosamente.', 'success');
                window.cargarModulo('formulas'); 
            }catch (error) {
                mostrarAlerta('Error', `Se pudo guardar la fórmula. Pero sucedio un error inesperado: ${error}`, 'error');
                return;
            }

        } else {
            mostrarAlerta('Error', 'Hubo un error al guardar la fórmula.', 'error');
            btnGuardar.innerHTML = contenidoOriginal;
            btnGuardar.disabled = false;
        }
    } catch (error) {
        mostrarAlerta('Error', `Hubo un error en la conexión: ${error}`, 'error');
        btnGuardar.innerHTML = contenidoOriginal;
        btnGuardar.disabled = false;
    }
}

/**
 * @function definirEstructura
 * @description Guarda la fórmula generada en el backend.
 * @param {HTMLElement} elementoElegido - El elemento HTML que contiene la función seleccionada.
 * @param {HTMLElement} contenedor - El contenedor donde se generará la fórmula.
 * @returns {void} - No devuelve nada.
 * @throws {Error} Si hay un error al guardar la fórmula.
 */
function definirEstructura(elementoElegido, contenedor) {
    const funcionElegida = elementoElegido.value;
    contenedor.innerHTML = '';
    // Aquí se define la estructura de la función
    switch (funcionElegida) {
        case 'IF':
            agregarCriterio('Condición', 'if-condition', contenedor);
            agregarArgumento('Si Verdadero', 'if-true', contenedor, true);
            agregarArgumento('Si Falso', 'if-false', contenedor, true);
            break;
        case 'COUNTIF':
            agregarArgumento('Rango', 'countif-range', contenedor);
            agregarCriterio('Criterio', 'countif-criteria', contenedor);
            break;
        case 'COUNTIFS':
            agregarArgumentoCountIf(contenedor);
            break;
        case 'IFERROR':
            agregarArgumento('Valor', 'iferror-value', contenedor, true);
            agregarArgumento('Valor si error', 'iferror-iferror', contenedor, true);
            break;
        case 'VLOOKUP':
            agregarArgumento('Valor buscado', 'vlookup-lookupvalue', contenedor, true);
            agregarArgumento('Matriz tabla', 'vlookup-tablearray', contenedor);
            agregarArgumento('Indicador de columnas', 'vlookup-colindexnum', contenedor);
            agregarArgumento('Coincidencia (0=exacta, 1=aproximada)', 'vlookup-rangelookup', contenedor);
            break;
        case 'ARITHMETIC':
            agregarArgumento('Expresión', 'arithmetic-expression', contenedor);
            break;
        case '':
            break;
    }
}

/**
 * @function agregarArgumento
 * @description Agrega un argumento a la función seleccionada en el contenedor especificado.
 * @param {string} etiqueta - La etiqueta que se mostrará para el argumento.
 * @param {string} nombreClase - La clase CSS que se asignará al argumento.
 * @param {HTMLElement} contenedor - El contenedor donde se agregará el argumento.
 * @param {boolean} permitirAnidado - Indica si se permite anidar funciones dentro de este argumento.
 * @returns {void} - No devuelve nada.
 * @throws {Error} Si el contenedor no se puede encontrar o no es un elemento HTML válido.
 */
function agregarArgumento(etiqueta, nombreClase, contenedor, permitirAnidado = false) {
    const argumentoDiv = document.createElement('div');
    // Agrega un argumento al contenedor
    argumentoDiv.classList.add('argumento');
    argumentoDiv.innerHTML = `
        <div class='argumentoEncabezado'>
            <label>${etiqueta}:</label>
        </div>
        <div class='argumentoContenido'>
            <div class='argumentosEntradas'>
                <input type='text' class='${nombreClase}' placeholder='${etiqueta}'>
                ${permitirAnidado ? '<button class="botonFuncionAnidada" onclick="agregarFuncionAnidada(this)">Anidar Función</button>' : ''}
            </div>
            <div class='contenedor-funciones-anidadas'></div>
        </div>
    `;
    contenedor.appendChild(argumentoDiv);
}

/**
 * @function agregarCriterio
 * @description Agrega un criterio a la función seleccionada en el contenedor especificado.
 * @param {string} etiqueta - La etiqueta que se mostrará para el criterio.
 * @param {string} nombreClase - La clase CSS que se asignará al criterio.
 * @param {HTMLElement} contenedor - El contenedor donde se agregará el criterio.
 * @returns {void} - No devuelve nada.
 * @throws {Error} Si el contenedor no se puede encontrar o no es un elemento HTML válido.
 */
function agregarCriterio(etiqueta, nombreClase, contenedor) {
    const argumentoDiv = document.createElement('div');
    // Agrega un criterio al contenedor
    argumentoDiv.classList.add('argumento');
    argumentoDiv.innerHTML = `
        <div class='argumentoEncabezado'>
            <label>${etiqueta}:</label>
        </div>
        <div class='argumentoContenido'>
            <div class='argumentosEntradas'>
                <select class='variable-selector ${nombreClase}-variable'>
                    <option value=''>Seleccionar variable</option>
                </select>
                <select class='operator-selector ${nombreClase}-operator'>
                    <option value='='>=</option>
                    <option value='>'>></option>
                    <option value='<'><</option>
                    <option value='>='>>=</option>
                    <option value='<='><=</option>
                </select>
                <input type='text' class='${nombreClase}-value' placeholder='Valor'>
            </div>
        </div>
    `;
    contenedor.appendChild(argumentoDiv);
    popularDropdown(argumentoDiv.querySelector('.variable-selector'));
}

/**
 * @function agregarFuncionAnidada
 * @description Agrega una función anidada al contenedor especificado.
 * @param {HTMLElement} boton - El botón que se ha pulsado para agregar la función anidada.
 * @returns {void} - No devuelve nada.
 * @throws {Error} Si el contenedor no se puede encontrar o no es un elemento HTML válido.
 */
// eslint-disable-next-line no-unused-vars
function agregarFuncionAnidada(boton) {
    // Deshabilitar el botón inmediatamente para evitar múltiples clics
    boton.disabled = true;
    boton.textContent = 'Función añadida';
    
    const argumentoContenido = boton.closest('.argumentoContenido');
    const contenedorAnidado = argumentoContenido.querySelector('.contenedor-funciones-anidadas');
    
    // Deshabilitar el input de texto del argumento padre y agregar carácter invisible
    const inputPadre = argumentoContenido.querySelector('input[type="text"]');
    if (inputPadre) {
        inputPadre.value = '\u200B'; // Zero-width space
        inputPadre.disabled = true;
        inputPadre.style.backgroundColor = '#f0f0f0';
    }
    
    const filaAnidada = document.createElement('div');
    filaAnidada.classList.add('fila-anidada');
    
    const seleccionarFuncion = document.createElement('select');
    seleccionarFuncion.classList.add('selectorFuncionAnidada');
    seleccionarFuncion.innerHTML = `
        <option value=''>Seleccionar función anidada</option>
        <option value='IF'>SI</option>
        <option value='IFERROR'>SI.ERROR</option>
        <option value='VLOOKUP'>BUSCARV</option>
        <option value='ARITHMETIC'>Operación Aritmética</option>
    `;
    
    filaAnidada.appendChild(seleccionarFuncion);
    contenedorAnidado.appendChild(filaAnidada);

    let eliminarBotonAnidado = filaAnidada.querySelector('.botonEliminarAnidado');

    if (!eliminarBotonAnidado) {
        eliminarBotonAnidado = document.createElement('button');
        eliminarBotonAnidado.textContent = 'Eliminar función';
        eliminarBotonAnidado.classList.add('botonEliminarAnidado');
        eliminarBotonAnidado.onclick = () => {
            // Rehabilitar el input padre cuando se elimina la función anidada
            if (inputPadre) {
                inputPadre.value = '';
                inputPadre.disabled = false;
                inputPadre.style.backgroundColor = '';
            }
            // Rehabilitar el botón "Anidar Función" cuando se elimina la función anidada
            boton.disabled = false;
            boton.textContent = 'Anidar Función';
            filaAnidada.remove();
        };
        filaAnidada.appendChild(eliminarBotonAnidado);
    }
    
    seleccionarFuncion.onchange = (evento) => {
        const valorSeleccionado = evento.target.value;
        if (valorSeleccionado) {
            const divAnidadoExistente = filaAnidada.querySelector('.funciones-anidadas');
            if (divAnidadoExistente) {
                divAnidadoExistente.remove();
            }
            
            const divAnidado = document.createElement('div');
            divAnidado.classList.add('funciones-anidadas');
            filaAnidada.appendChild(divAnidado);
            
            definirEstructura(evento.target, divAnidado);
        }
    };
}

/**
 * @function agregarArgumentoCountIf
 * @description Agrega un argumento para la función COUNTIF o COUNTIFS en el contenedor especificado.
 * @param {HTMLElement} contenedor - El contenedor donde se agregará el argumento.
 * @param {string} prefijo - Un prefijo opcional para las clases de los elementos.
 * @return {void} - No devuelve nada.
 * @throws {Error} Si el contenedor no se puede encontrar o no es un elemento HTML válido.
 */
function agregarArgumentoCountIf(contenedor, prefijo = '') {
    const argumentoDiv = document.createElement('div');
    // Agrega un argumento para la función COUNTIF o COUNTIFS
    argumentoDiv.classList.add('argumento');
    argumentoDiv.innerHTML = `
        <div class='argumentoEncabezado'>
            <label>Criterio ${contenedor.querySelectorAll('.argumento').length + 1}:</label>
        </div>
        <div class='argumentoContenido'>
            <select class='variable-selector ${prefijo}countifs-variable'>
                <option value=''>Seleccionar variable</option>
            </select>
            <select class='operator-selector ${prefijo}countifs-operator'>
                <option value='='>=</option>
                <option value='>'>></option>
                <option value='<'><</option>
                <option value='>='>>=</option>
                <option value='<='><=</option>
            </select>
            <input type='text' class='${prefijo}countifs-value' placeholder='Valor'>
        </div>
        <button class="botonMasArgumentosCountif" onclick="masArgumentosCountif(this.parentNode)">+ Añadir otro criterio</button>
    `;
    contenedor.appendChild(argumentoDiv);
    popularDropdown(argumentoDiv.querySelector('.variable-selector'));
}

/**
 * @function masArgumentosCountif
 * @description Agrega más argumentos para la función COUNTIF o COUNTIFS en el contenedor especificado.
 * @param {HTMLElement} contenedor - El contenedor donde se agregará el argumento.
 * @returns {void} - No devuelve nada.
 * @throws {Error} Si el contenedor no se puede encontrar o no es un elemento HTML válido.
 */
// eslint-disable-next-line no-unused-vars
function masArgumentosCountif(contenedor) {
    const contadorArgumentos = contenedor.querySelectorAll('.argumento').length + 1;
    const nuevoArgumento = document.createElement('div');
    nuevoArgumento.classList.add('argumento');
    nuevoArgumento.innerHTML = `
        <div class='argumentoEncabezado'>
            <label>Criterio ${contadorArgumentos}:</label>
        </div>
        <div class='argumentoContenido'>
            <select class='variable-selector countifs-variable'>
                <option value=''>Seleccionar variable</option>
            </select>
            <select class='operator-selector countifs-operator'>
                <option value='='>=</option>
                <option value='>'>></option>
                <option value='<'><</option>
                <option value='>='>>=</option>
                <option value='<='><=</option>
            </select>
            <input type='text' class='countifs-value' placeholder='Valor'>
        </div>
    `;
    contenedor.appendChild(nuevoArgumento);
    popularDropdown(nuevoArgumento.querySelector('.variable-selector'));
}

/**
 * @function validarCamposFormula
 * @description Verifica que todos los campos requeridos de la fórmula tengan datos.
 * @param {HTMLElement} contenedor - El contenedor que contiene los argumentos de la función.
 * @return {boolean} - True si todos los campos requeridos tienen datos, false en caso contrario.
 */
function validarCamposFormula(contenedor) {
    const elementosArgumentos = Array.from(contenedor.children);
    let camposValidos = true;
    let mensajeError = '';

    elementosArgumentos.forEach(argumento => {
        if (!camposValidos) return; // Si ya encontramos un error, no seguimos validando
        
        // Validar selectores de variables
        const variableSelector = argumento.querySelector('.variable-selector');
        if (variableSelector && !variableSelector.value) {
            camposValidos = false;
            mensajeError = 'Hay campos de variable sin seleccionar';
            return;
        }
        
        // Validar inputs de texto
        const inputTexto = argumento.querySelector('input[type="text"]');
        if (inputTexto && !inputTexto.value.trim()) {
            camposValidos = false;
            mensajeError = 'Hay campos de texto vacíos';
            return;
        }
        
        // Validar funciones anidadas
        const selectorAnidado = argumento.querySelector('.selectorFuncionAnidada');
        if (selectorAnidado && selectorAnidado.value) {
            const contenedorAnidado = argumento.querySelector('.funciones-anidadas');
            if (contenedorAnidado && !validarCamposFormula(contenedorAnidado)) {
                camposValidos = false;
                mensajeError = 'Hay campos vacíos en las funciones anidadas';
                return;
            }
        }
    });
    
    if (!camposValidos) {
        mostrarAlerta('Error', mensajeError, 'error');
    }

    return camposValidos;
}


/**
 * @function generarFormulaCompleja
 * @description Genera una fórmula compleja basada en la función seleccionada y los argumentos proporcionados.
 * @returns {void} - No devuelve nada.
 * @throws {Error} Si no se selecciona una función principal o si hay un error al construir la fórmula.
 */
function generarFormulaCompleja() {
    const previsualizador = document.getElementsByClassName('formula-seccion-resultado');
    previsualizador[0].style.display = 'block';
    const seleccionFuncionPrincipal = document.getElementById('main-function');
    if (!seleccionFuncionPrincipal.value) {
        mostrarAlerta('Error', 'Por favor, selecciona una función principal.', 'error');
        return;
    }

    const contenedor = document.getElementById('function-arguments');
    if (!validarCamposFormula(contenedor)) {
        return;
    }

    const formula = construirFormulaDesdeContenedor(contenedor, seleccionFuncionPrincipal.value);
    document.getElementById('resultado').innerText = `Fórmula generada (en inglés para HyperFormula):\n=${formula}`;
}

/**
 * @function construirFormulaDesdeContenedor
 * @description Construye una fórmula a partir de un contenedor y el nombre de la función seleccionada.
 * @param {HTMLElement} contenedor - El contenedor que contiene los argumentos de la función.
 * @param {string} nombreFuncion - El nombre de la función seleccionada.
 * @return {string} - La fórmula generada en formato de cadena.
 * @throws {Error} Si hay un error al construir la fórmula.
 */
function construirFormulaDesdeContenedor(contenedor, nombreFuncion) {
    const argumentos = [];
    const traduccion = traducirFuncion;
    const elementosArgumentos = Array.from(contenedor.children);

    switch (nombreFuncion) {
        case 'IF':
            argumentos.push(construirCondicion(elementosArgumentos[0], false));
            argumentos.push(procesarArgumento(elementosArgumentos[1]));
            argumentos.push(procesarArgumento(elementosArgumentos[2]));
            break;
        case 'COUNTIF':
            argumentos.push(obtenerVariables(elementosArgumentos[0].querySelector('.variable-selector')));
            argumentos.push(construirCondicion(elementosArgumentos[1], false));
            break;
        case 'COUNTIFS':
            elementosArgumentos.forEach(elementoArgumento => {
                const condicion = construirCondicion(elementoArgumento, false);
                if (condicion) {
                    argumentos.push(condicion);
                }
            });
            break;
        case 'IFERROR':
            argumentos.push(procesarArgumento(elementosArgumentos[0]));
            argumentos.push(procesarArgumento(elementosArgumentos[1]));
            break;
        case 'VLOOKUP':
            argumentos.push(procesarArgumento(elementosArgumentos[0]));
            argumentos.push(obtenerValor(elementosArgumentos[1].querySelector('input')));
            argumentos.push(obtenerValor(elementosArgumentos[2].querySelector('input')));
            argumentos.push(obtenerValor(elementosArgumentos[3].querySelector('input')));
            break;
        case 'ARITHMETIC':
            return obtenerValor(elementosArgumentos[0].querySelector('input'));
        default:
            return '';
    }
    return `${traduccion(nombreFuncion)}(${argumentos.join(',')})`;
}
/**
 * @function obtenerVariables
 * @description Obtiene el valor de una variable seleccionada en un elemento HTML.
 * @param {HTMLElement} elemento - El elemento HTML que contiene la variable.
 * @return {string} - El valor de la variable seleccionada.
 * @throws {Error} Si el elemento no es un elemento HTML válido.
 */
function obtenerVariables(elemento) {
    return elemento ? elemento.value : '';
}

/** 
 * @function obtenerValor
 * @description Obtiene el valor de un elemento HTML.
 * @param {HTMLElement} elementoIngresado - El elemento HTML del que se obtendrá el valor.
 * @return {string} - El valor del elemento HTML.
 * @throws {Error} Si el elemento no es un elemento HTML válido.
*/
function obtenerValor(elementoIngresado) {
    return elementoIngresado ? elementoIngresado.value.trim().replace(/,/g, '.') : '';
}

/** 
 * @function procesarArgumento
 * @description Procesa un argumento de función y devuelve su valor.
 * @param {HTMLElement} argumento - El elemento HTML que contiene el argumento.
 * @return {string} - El valor del argumento procesado.
 * @throws {Error} Si el argumento no es un elemento HTML válido.
*/
function procesarArgumento(argumento) {
    if (!argumento) return '';

    const seleccionAnidado = argumento.querySelector('.selectorFuncionAnidada');
    if (seleccionAnidado && seleccionAnidado.value) {
        const contenedorAnidado = argumento.querySelector('.funciones-anidadas');
        return construirFormulaDesdeContenedor(contenedorAnidado, seleccionAnidado.value);
    }

    const seleccionVariable = argumento.querySelector('.variable-selector');
    if (seleccionVariable && seleccionVariable.value) {
        return seleccionVariable.value;
    }

    const elementoIngresado = argumento.querySelector('input');
    return elementoIngresado ? elementoIngresado.value.trim().replace(/,/g, '.') : '';
}

/** 
 * @function construirCondicion
 * @description Construye una condición a partir de un elemento HTML.
 * @param {HTMLElement} argumentElement - El elemento HTML que contiene la condición.
 * @param {boolean} valor - Indica si se debe envolver el valor en comillas.
 * @return {string} - La condición construida.
 * @throws {Error} Si el elemento no es un elemento HTML válido.
*/
function construirCondicion(argumentElement, valor = true) {
    const variableElegida = argumentElement.querySelector('.variable-selector');
    const operadorElegido = argumentElement.querySelector('.operator-selector');
    const valorIngresado = argumentElement.querySelector('input[type="text"]');
    let value = valorIngresado ? valorIngresado.value.trim().replace(/,/g, '.') : '';

    if (valor) {
        value = `'${value}'`;
    }

    if (variableElegida && operadorElegido && valorIngresado && variableElegida.value) {
        return `${variableElegida.value}${operadorElegido.value}${value}`;
    }
    return value;
}

/** 
 * @function traducirFuncion
 * @description Traduce el nombre de una función de español a inglés.
 * @param {string} nombre - El nombre de la función en español.
 * @return {string} - El nombre de la función traducido al inglés.
 * @throws {Error} Si el nombre de la función no es una cadena válida.
*/
function traducirFuncion(nombre) {
    const map = {
        'SI': 'IF',
        'CONTAR.SI': 'COUNTIF',
        'CONTAR.SI.CONJUNTO': 'COUNTIFS',
        'SI.ERROR': 'IFERROR',
        'BUSCARV': 'VLOOKUP',
        'ARITHMETIC': 'ARITHMETIC'
    };
    return map[nombre] || nombre;
}

/** 
 * @function popularDropdown
 * @description Llena un dropdown con las variables disponibles en el archivo.
 * @param {HTMLElement} elementoSeleccionado - El elemento HTML del dropdown que se va a llenar.
 * @return {void} - No devuelve nada.
 * @throws {Error} Si el elemento no es un elemento HTML válido.
*/
function popularDropdown(elementoSeleccionado) {
    const nombreArchivo = localStorage.getItem('nombreArchivoExcel');
    if (nombreArchivo === null || nombreArchivo === undefined) {
        elementoSeleccionado.innerHTML = '<option value="">No hay un archivo cargado</option>';
        document.getElementById('btnGuardar').disabled = true;
        document.getElementById('btnGenerar').disabled = true;
        return;
    }

    let columnas = [];
    
    // Intentar obtener columnas del nuevo formato con hojas
    const hojaSeleccionada = localStorage.getItem('hojaSeleccionada');
    const datos = localStorage.getItem('datosExcel');
    
    if (datos && hojaSeleccionada) {
        try {
            const datosParseados = JSON.parse(datos);
            if (datosParseados.hojas && datosParseados.hojas[hojaSeleccionada]) {
                const datosHoja = datosParseados.hojas[hojaSeleccionada];
                if (datosHoja.length > 0) {
                    // Obtener encabezados de la primera fila
                    columnas = datosHoja[0];
                }
            }
        } catch (error) {
            mostrarAlerta('Error', `No se pudieron cargar las columnas del archivo. Verifica el formato del archivo: ${error}`, 'error');
            columnas = [];
        }
    }
    
    // Fallback: intentar usar el formato anterior
    if (columnas.length === 0) {
        const columnasGuardadas = localStorage.getItem('columnas');
        if (columnasGuardadas) {
            try {
                columnas = JSON.parse(columnasGuardadas);
            } catch (error) {

                mostrarAlerta('Error', `No se pudieron cargar las columnas guardadas. Verifica el formato del archivo: ${error}`, 'error');
                columnas = [];
            }
        }
    }
    
    // Verificar si tenemos columnas válidas
    if (!Array.isArray(columnas) || columnas.length === 0) {
        elementoSeleccionado.innerHTML = '<option value="">No hay columnas disponibles</option>';
        mostrarAlerta('Error', 'El archivo seleccionado no tiene parámetros.', 'error');
        return;
    }
    
    // Poblar el dropdown
    elementoSeleccionado.innerHTML = '<option value="">Seleccionar</option>';
    columnas.forEach(columna => {
        if (columna && columna.trim() !== '') {
            const opcion = document.createElement('option');
            opcion.value = `[@${columna}]`;
            opcion.textContent = columna;
            elementoSeleccionado.appendChild(opcion);
        }
    });
}
