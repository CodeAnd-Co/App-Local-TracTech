// RF67 Crear Fórmula - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF67 
// RF69 Guardar Fórmula - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF69

/**
 * @function eliminarElemento
 * @description Elimina un elemento del DOM.
 * @param {HTMLElement} boton - El botón que se ha pulsado para eliminar el elemento.
 * @returns {void}
 * @throws {Error} Si el elemento no se puede eliminar.
 */
function eliminarElemento(boton) {
            const elementoABorrar = boton.parentNode.parentNode;
            elementoABorrar.remove();
}

function cancelarVista(){
    window.cargarModulo('formulas');

}

btnGuardar.addEventListener('click', async () => {
    procesarFormula();
}); 

btnCancelar.addEventListener('click', () => {
    cancelarVista();
});

btnGenerar.addEventListener('click', () => {
    const contenedor = document.getElementById('function-arguments');
    console.log(contenedor);
    if (contenedor) {
        generarFormulaCompleja();
    } else {
        console.error('El contenedor de argumentos no se encontró en el DOM.');
    }
});


/**
 * @function inicializarCrearFormula
 * @description Inicializa el módulo de creación de fórmulas al cargar la página.
 * @returns {void}
 * @throws {Error} Si el botón de creación de fórmulas no se encuentra en el DOM.
 */
function inicializarCrearFormula() {
    const botonCrearFormula = document.getElementById('crearFormula');
    if (botonCrearFormula) {
        botonCrearFormula.addEventListener('click', async () => {
            localStorage.setItem('seccion-activa', 'crearFormula');
            const ventanaPrincipal = document.getElementById('ventana-principal');
            if (ventanaPrincipal) {
                fetch('../vistas/crearFormula.html')
                    .then(res => res.text())
                    .then(html => {
                        ventanaPrincipal.innerHTML = html;
                        const script = document.createElement('script');
                        script.src = '../utils/js/crearFormula.js';
                        document.body.appendChild(script);
                        

                    })
                    .catch(err => console.error('Error cargando módulo de creación de fórmulas:', err));
            }
    });

    } else {
        console.error('El botón de creación de fórmulas no se encontró en el DOM.');
    }
}

async function guardarFormulaTemporal(nombre, formula) {
    // REFACTORIZAR
    const respuesta = await fetch("http://localhost:3000/formulas/guardarFormula", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({nombre, formula}),
    });

    const datos = await respuesta.json();
    return { ok: respuesta.ok, ...datos };
}

/**
 * @function procesarFormula
 * @description Guarda la fórmula generada en el backend.
 * @returns {Promise<void>} - Una promesa que se resuelve cuando la fórmula se guarda correctamente.
 * @throws {Error} Si hay un error al guardar la fórmula.
 */
async function procesarFormula() {
    const cuadroTextoGenerado = document.getElementById('resultado').innerText;
    const nombreFormula = document.getElementById('nombreFormula').value;
    // Mucho ojo aquí, si vamos a utilizar rangos de celdas, tenemos que separarlo de otra forma
    const formula = cuadroTextoGenerado.split(':')[1].trim();
    try{
        // console.log('Nombre de la fórmula:', nombreFormula, 'Fórmula:', formula); Quitar el console.log
        const respuesta = await guardarFormulaTemporal(nombreFormula, formula);
        if (respuesta.ok) {
            window.cargarModulo('formulas');
        } else {
            alert(respuesta.message || 'Error al guardar la fórmula.');
        }
    } catch (error) {
        console.error('Error al conectar con el backend:', error);
        alert('No se pudo conectar con el servidor.');
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
            <input type='text' class='${nombreClase}' placeholder='${etiqueta}'>
            ${permitirAnidado ? '<button class="botonFuncionAnidada" onclick="agregarFuncionAnidada(this)">Anidar Función</button>' : ''}
            <div class='nested-function-container' style='margin-left: 10px;'></div>
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
function agregarFuncionAnidada(boton) {
    const contenedorAnidado = boton.nextElementSibling;
    const seleccionarFuncion = document.createElement('select');
    seleccionarFuncion.classList.add('selectorFuncionAnidada');
    // Agrega un selector de función anidada al contenedor
    seleccionarFuncion.innerHTML = `
        <option value=''>Seleccionar función anidada</option>
        <option value='IF'>SI</option>
        <!--
        <option value='COUNTIF'>CONTAR.SI</option>
        <option value='COUNTIFS'>CONTAR.SI.CONJUNTO</option>
        -->
        <option value='IFERROR'>SI.ERROR</option>
        <option value='VLOOKUP'>BUSCARV</option>
        <option value='ARITHMETIC'>Operación Aritmética</option>
    `;
    seleccionarFuncion.onchange = (evento) => {
        const valorSeleccionado = evento.target.value;
        if (valorSeleccionado) {
            // Si se selecciona una función, se crea un nuevo contenedor para los argumentos de la función anidada
            const divAnidado = document.createElement('div');
            divAnidado.classList.add('nested-function');
            contenedorAnidado.appendChild(divAnidado);
            // Se define la estructura de la función anidada
            definirEstructura(evento.target, divAnidado);
            // Se agrega un botón para eliminar la función anidada
            const eliminarBotonAnidado = document.createElement('button');
            eliminarBotonAnidado.textContent = 'Eliminar Anidado';
            eliminarBotonAnidado.classList.add('botonEliminar');
            eliminarBotonAnidado.onclick = () => {
                evento.target.remove();
                divAnidado.remove();
                eliminarBotonAnidado.remove(); // borra el botón de eliminar
            };
            contenedorAnidado.appendChild(eliminarBotonAnidado);
        }
    };
    contenedorAnidado.appendChild(seleccionarFuncion);
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
 * @function generarFormulaCompleja
 * @description Genera una fórmula compleja basada en la función seleccionada y los argumentos proporcionados.
 * @returns {void} - No devuelve nada.
 * @throws {Error} Si no se selecciona una función principal o si hay un error al construir la fórmula.
 */
function generarFormulaCompleja() {
    const seleccionFuncionPrincipal = document.getElementById('main-function');
    if (!seleccionFuncionPrincipal.value) {
        document.getElementById('resultado').innerText = 'Por favor, selecciona una función principal.';
        return;
    }

    const formula = construirFormulaDesdeContenedor(document.getElementById('function-arguments'), seleccionFuncionPrincipal.value);
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
        const contenedorAnidado = argumento.querySelector('.nested-function');
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
    // Aquí se pondrá la lógica para llenar el dropdown con las variables en el archivo TODO()
    const columnas = ['Gasolina', 'Kilometraje', 'Fecha', 'Estado', 'Valor'];
    elementoSeleccionado.innerHTML = "<option value=''>Seleccionar</option>";
    columnas.forEach(columna => {
        const opcion = document.createElement('option');
        opcion.value = `[@${columna}]`;
        opcion.textContent = columna;
        elementoSeleccionado.appendChild(opcion);
    });
}

document.addEventListener('DOMContentLoaded', () => {    
    const { guardarFormula} = require('../../backend/casosUso/formulas/crearFormula');
    const { cargarModulo } = require('./sidebar.js');

    
    const btnGuardar = document.getElementById('btnGuardar');
    const formulaContainer = document.getElementById('formula-container');
    
    // Crear la estructura principal de selección de funciones
    if (formulaContainer) {
        formulaContainer.innerHTML = `
            <div class='bloqueFormula'>
                <label for='main-function'>Seleccione una función:</label>
                <select id='main-function'>
                    <option value=''>Seleccionar función</option>
                    <option value='IF'>SI</option>
                    <option value='COUNTIF'>CONTAR.SI</option>
                    <option value='COUNTIFS'>CONTAR.SI.CONJUNTO</option>
                    <option value='IFERROR'>SI.ERROR</option>
                    <option value='VLOOKUP'>BUSCARV</option>
                    <option value='ARITHMETIC'>Operación Aritmética</option>
                </select>
                <div id='function-arguments'></div>
            </div>
        `;
    }
    
    // Configurar eventos para los botones
    if (btnGuardar) {
        btnGuardar.addEventListener('click', async () => {
            procesarFormula();
    });
    }
    // Agregar el evento al selector de función principal
    const mainFunctionSelect = document.getElementById('main-function');
    if (mainFunctionSelect) {
        mainFunctionSelect.addEventListener('change', () => {
            const contenedor = document.getElementById('function-arguments');
            definirEstructura(mainFunctionSelect, contenedor);
        });
    }
});



window.inicializarCrearFormula = inicializarCrearFormula;