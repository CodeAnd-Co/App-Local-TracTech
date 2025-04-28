const { guardarFormula }  = require('../../backend/casosUso/formulas/crearFormula');

/**
 * 
 * 
 * 
 */
function eliminarElemento(boton) {
            const elementoABorrar = boton.parentNode.parentNode;
            elementoABorrar.remove();
        }

function inicializarCrearFormula() {
    const botonCrearFormula = document.getElementById('crearFormula');
    if (botonCrearFormula) {
        botonCrearFormula.addEventListener('click', async () => {
            console.log("Cargando el módulo de creación de fórmulas...");
            localStorage.setItem('seccion-activa', 'crearFormula');
            const ventanaPrincipal = document.getElementById('ventana-principal');
            if (ventanaPrincipal) {
                fetch('../vistas/crearFormula.html')
                    .then(res => res.text())
                    .then(html => {
                        ventanaPrincipal.innerHTML = html;
                    })
                    .catch(err => console.error("Error cargando módulo de creación de fórmulas:", err));
            }
    });

    } else {
        console.error("El botón de creación de fórmulas no se encontró en el DOM.");
    }
}

async function guardarFormulaFront() {
    const cuadroTextoGenerado = document.getElementById('resultado').innerText;
    const nombreFormula = document.getElementById('nombreFormula').value;
    // Mucho ojo aquí, si vamos a utilizar rangos de celdas, tenemos que separarlo de otra forma
    const formula = cuadroTextoGenerado.split(':')[1].trim();
    try{
        const respuesta = await guardarFormula(nombreFormula, formula);
        if (respuesta.ok) {
            window.location.href = "./frameLayout.html";
        }
        else {
            alert(respuesta.message || "Error al guardar la fórmula.");
        }
    } catch (error) {
        console.error("Error al conectar con el backend:", error);
        alert("No se pudo conectar con el servidor.");
    }
}

function definirEstructura(elementoElegido, contenedor) {
    const funcionElegida = elementoElegido.value;
    contenedor.innerHTML = '';

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

function agregarArgumento(etiqueta, nombreClase, contenedor, permitirAnidado = false) {
    const argumentoDiv = document.createElement('div');
    argumentoDiv.classList.add('argumento');
    argumentoDiv.innerHTML = `
        <div class="argumentoEncabezado">
            <label>${etiqueta}:</label>
        </div>
        <div class="argumentoContenido">
            <input type="text" class="${nombreClase}" placeholder="${etiqueta}">
            ${permitirAnidado ? '<button onclick="agregarFuncionAnidada(this)">Anidar Función</button>' : ''}
            <div class="nested-function-container" style="margin-left: 10px;"></div>
        </div>
    `;
    contenedor.appendChild(argumentoDiv);
}

function agregarCriterio(etiqueta, nombreClase, contenedor) {
    const argumentoDiv = document.createElement('div');
    argumentoDiv.classList.add('argumento');
    argumentoDiv.innerHTML = `
        <div class="argumentoEncabezado">
            <label>${etiqueta}:</label>
        </div>
        <div class="argumentoContenido">
            <select class="variable-selector ${nombreClase}-variable">
                <option value="">Seleccionar variable</option>
            </select>
            <select class="operator-selector ${nombreClase}-operator">
                <option value="=">=</option>
                <option value=">">></option>
                <option value="<"><</option>
                <option value=">=">>=</option>
                <option value="<="><=</option>
            </select>
            <input type="text" class="${nombreClase}-value" placeholder="Valor">
        </div>
    `;
    contenedor.appendChild(argumentoDiv);
    popularDropdown(argumentoDiv.querySelector('.variable-selector'));
}

function agregarFuncionAnidada(boton) {
    const contenedorAnidado = boton.nextElementSibling;
    const seleccionarFuncion = document.createElement('select');
    seleccionarFuncion.classList.add('selectorFuncionAnidada');
    seleccionarFuncion.innerHTML = `
        <option value="">Seleccionar función anidada</option>
        <option value="IF">SI</option>
        <!--
        <option value="COUNTIF">CONTAR.SI</option>
        <option value="COUNTIFS">CONTAR.SI.CONJUNTO</option>
        -->
        <option value="IFERROR">SI.ERROR</option>
        <option value="VLOOKUP">BUSCARV</option>
        <option value="ARITHMETIC">Operación Aritmética</option>
    `;
    seleccionarFuncion.onchange = (evento) => {
        const valorSeleccionado = evento.target.value;
        if (valorSeleccionado) {
            const divAnidado = document.createElement('div');
            divAnidado.classList.add('nested-function');
            contenedorAnidado.appendChild(divAnidado);
            definirEstructura(evento.target, divAnidado);

            const eliminarBotonAnidado = document.createElement('button');
            eliminarBotonAnidado.textContent = 'Eliminar Anidado';
            eliminarBotonAnidado.classList.add('botonEliminar');
            eliminarBotonAnidado.onclick = () => {
                evento.target.remove();
                divAnidado.remove();
                eliminarBotonAnidado.remove(); // Remove the button itself
            };
            contenedorAnidado.appendChild(eliminarBotonAnidado);
        }
    };
    contenedorAnidado.appendChild(seleccionarFuncion);
}

function agregarArgumentoCountIf(contenedor, prefijo = '') {
    const argumentoDiv = document.createElement('div');
    argumentoDiv.classList.add('argumento');
    argumentoDiv.innerHTML = `
        <div class="argumentoEncabezado">
            <label>Criterio ${contenedor.querySelectorAll('.argumento').length + 1}:</label>
        </div>
        <div class="argumentoContenido">
            <select class="variable-selector ${prefijo}countifs-variable">
                <option value="">Seleccionar variable</option>
            </select>
            <select class="operator-selector ${prefijo}countifs-operator">
                <option value="=">=</option>
                <option value=">">></option>
                <option value="<"><</option>
                <option value=">=">>=</option>
                <option value="<="><=</option>
            </select>
            <input type="text" class="${prefijo}countifs-value" placeholder="Valor">
        </div>
        <button onclick="masArgumentosCountif(this.parentNode)">+ Añadir otro criterio</button>
    `;
    contenedor.appendChild(argumentoDiv);
    popularDropdown(argumentoDiv.querySelector('.variable-selector'));
}

function masArgumentosCountif(contenedor) {
    const contadorArgumentos = contenedor.querySelectorAll('.argumento').length + 1;
    const nuevoArgumento = document.createElement('div');
    nuevoArgumento.classList.add('argumento');
    nuevoArgumento.innerHTML = `
        <div class="argumentoEncabezado">
            <label>Criterio ${contadorArgumentos}:</label>
        </div>
        <div class="argumentoContenido">
            <select class="variable-selector countifs-variable">
                <option value="">Seleccionar variable</option>
            </select>
            <select class="operator-selector countifs-operator">
                <option value="=">=</option>
                <option value=">">></option>
                <option value="<"><</option>
                <option value=">=">>=</option>
                <option value="<="><=</option>
            </select>
            <input type="text" class="countifs-value" placeholder="Valor">
        </div>
    `;
    contenedor.appendChild(nuevoArgumento);
    popularDropdown(nuevoArgumento.querySelector('.variable-selector'));
}

function generarFormulaCompleja() {
    const seleccionFuncionPrincipal = document.getElementById('main-function');
    if (!seleccionFuncionPrincipal.value) {
        document.getElementById('resultado').innerText = 'Por favor, selecciona una función principal.';
        return;
    }

    const formula = construirFormulaDesdeContenedor(document.getElementById('function-arguments'), seleccionFuncionPrincipal.value);
    document.getElementById('resultado').innerText = `Fórmula generada (en inglés para HyperFormula):\n=${formula}`;
}

function construirFormulaDesdeContenedor(contenedor, nombreFuncion) {
    let argumentos = [];
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

function obtenerVariables(elemento) {
    return elemento ? elemento.value : '';
}

function obtenerValor(elementoIngresado) {
    return elementoIngresado ? elementoIngresado.value.trim().replace(/,/g, '.') : '';
}

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

function construirCondicion(argumentElement, valor = true) {
    const variableElegida = argumentElement.querySelector('.variable-selector');
    const operadorElegido = argumentElement.querySelector('.operator-selector');
    const valorIngresado = argumentElement.querySelector('input[type="text"]');
    let value = valorIngresado ? valorIngresado.value.trim().replace(/,/g, '.') : '';

    if (valor) {
        value = `"${value}"`;
    }

    if (variableElegida && operadorElegido && valorIngresado && variableElegida.value) {
        return `${variableElegida.value}${operadorElegido.value}${value}`;
    }
    return value;
}

function traducirFuncion(nombre) {
    const map = {
        "SI": "IF",
        "CONTAR.SI": "COUNTIF",
        "CONTAR.SI.CONJUNTO": "COUNTIFS",
        "SI.ERROR": "IFERROR",
        "BUSCARV": "VLOOKUP",
        "ARITHMETIC": "ARITHMETIC"
    };
    return map[nombre] || nombre;
}

function popularDropdown(elementoSeleccionado) {
    // Aquí puedes agregar las variables que quieras mostrar en el dropdown
    const columnas = ["Gasolina", "Kilometraje", "Fecha", "Estado", "Valor"];
    elementoSeleccionado.innerHTML = '<option value="">Seleccionar</option>';
    columnas.forEach(columna => {
        const opcion = document.createElement('option');
        opcion.value = `[@${columna}]`;
        opcion.textContent = columna;
        elementoSeleccionado.appendChild(opcion);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const mainFunctionSelect = document.getElementById('main-function');
});

window.inicializarCrearFormula = inicializarCrearFormula;