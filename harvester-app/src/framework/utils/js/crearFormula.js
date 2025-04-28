const { guardarFormula }  = require('../../backend/casosUso/formulas/crearFormula');

/**
 * 
 * 
 * 
 */
function eliminarElemento(button) {
            const elementToRemove = button.parentNode.parentNode;
            elementToRemove.remove();
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

function definirEstructura(selectElement, container) {
    const selectedFunction = selectElement.value;
    container.innerHTML = '';

    switch (selectedFunction) {
        case 'IF':
            agregarCriterio('Condición', 'if-condition', container);
            agregarArgumento('Si Verdadero', 'if-true', container, true);
            agregarArgumento('Si Falso', 'if-false', container, true);
            break;
        case 'COUNTIF':
            agregarArgumento('Rango', 'countif-range', container);
            agregarCriterio('Criterio', 'countif-criteria', container);
            break;
        case 'COUNTIFS':
            agregarArgumentoCountIf(container);
            break;
        case 'IFERROR':
            agregarArgumento('Valor', 'iferror-value', container, true);
            agregarArgumento('Valor si error', 'iferror-iferror', container, true);
            break;
        case 'VLOOKUP':
            agregarArgumento('Valor buscado', 'vlookup-lookupvalue', container, true);
            agregarArgumento('Matriz tabla', 'vlookup-tablearray', container);
            agregarArgumento('Indicador de columnas', 'vlookup-colindexnum', container);
            agregarArgumento('Coincidencia (0=exacta, 1=aproximada)', 'vlookup-rangelookup', container);
            break;
        case 'ARITHMETIC':
            agregarArgumento('Expresión', 'arithmetic-expression', container);
            break;
        case '':
            break;
    }
}

function agregarArgumento(label, className, container, allowNesting = false) {
    const argumentDiv = document.createElement('div');
    argumentDiv.classList.add('argumento');
    argumentDiv.innerHTML = `
        <div class="argumentoEncabezado">
            <label>${label}:</label>
        </div>
        <div class="argumentoContenido">
            <input type="text" class="${className}" placeholder="${label}">
            ${allowNesting ? '<button onclick="agregarFuncionAnidada(this)">Anidar Función</button>' : ''}
            <div class="nested-function-container" style="margin-left: 10px;"></div>
        </div>
    `;
    container.appendChild(argumentDiv);
}

function agregarCriterio(label, className, container) {
    const argumentDiv = document.createElement('div');
    argumentDiv.classList.add('argumento');
    argumentDiv.innerHTML = `
        <div class="argumentoEncabezado">
            <label>${label}:</label>
        </div>
        <div class="argumentoContenido">
            <select class="variable-selector ${className}-variable">
                <option value="">Seleccionar variable</option>
            </select>
            <select class="operator-selector ${className}-operator">
                <option value="=">=</option>
                <option value=">">></option>
                <option value="<"><</option>
                <option value=">=">>=</option>
                <option value="<="><=</option>
            </select>
            <input type="text" class="${className}-value" placeholder="Valor">
        </div>
    `;
    container.appendChild(argumentDiv);
    popularDropdown(argumentDiv.querySelector('.variable-selector'));
}

function agregarFuncionAnidada(button) {
    const nestedContainer = button.nextElementSibling;
    const functionSelect = document.createElement('select');
    functionSelect.classList.add('selectorFuncionAnidada');
    functionSelect.innerHTML = `
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
    functionSelect.onchange = (event) => {
        const selectedValue = event.target.value;
        if (selectedValue) {
            const nestedDiv = document.createElement('div');
            nestedDiv.classList.add('nested-function');
            nestedContainer.appendChild(nestedDiv);
            definirEstructura(event.target, nestedDiv);

            const removeNestedButton = document.createElement('button');
            removeNestedButton.textContent = 'Eliminar Anidado';
            removeNestedButton.classList.add('botonEliminar');
            removeNestedButton.onclick = () => {
                event.target.remove();
                nestedDiv.remove();
                removeNestedButton.remove(); // Remove the button itself
            };
            nestedContainer.appendChild(removeNestedButton);
        }
    };
    nestedContainer.appendChild(functionSelect);
}

function agregarArgumentoCountIf(container, prefix = '') {
    const argumentDiv = document.createElement('div');
    argumentDiv.classList.add('argumento');
    argumentDiv.innerHTML = `
        <div class="argumentoEncabezado">
            <label>Criterio ${container.querySelectorAll('.argumento').length + 1}:</label>
        </div>
        <div class="argumentoContenido">
            <select class="variable-selector ${prefix}countifs-variable">
                <option value="">Seleccionar variable</option>
            </select>
            <select class="operator-selector ${prefix}countifs-operator">
                <option value="=">=</option>
                <option value=">">></option>
                <option value="<"><</option>
                <option value=">=">>=</option>
                <option value="<="><=</option>
            </select>
            <input type="text" class="${prefix}countifs-value" placeholder="Valor">
        </div>
        <button onclick="addMoreCountifsArgument(this.parentNode)">+ Añadir otro criterio</button>
    `;
    container.appendChild(argumentDiv);
    popularDropdown(argumentDiv.querySelector('.variable-selector'));
}

function masArgumentosCountif(container) {
    const argCount = container.querySelectorAll('.argumento').length + 1;
    const newArgument = document.createElement('div');
    newArgument.classList.add('argumento');
    newArgument.innerHTML = `
        <div class="argumentoEncabezado">
            <label>Criterio ${argCount}:</label>
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
    container.appendChild(newArgument);
    popularDropdown(newArgument.querySelector('.variable-selector'));
}

function generarFormulaCompleja() {
    const mainFunctionSelect = document.getElementById('main-function');
    if (!mainFunctionSelect.value) {
        document.getElementById('resultado').innerText = 'Por favor, selecciona una función principal.';
        return;
    }

    const formula = construirFormulaDesdeContenedor(document.getElementById('function-arguments'), mainFunctionSelect.value);
    document.getElementById('resultado').innerText = `Fórmula generada (en inglés para HyperFormula):\n=${formula}`;
}

function construirFormulaDesdeContenedor(container, functionName) {
    let args = [];
    const translate = traducirFuncion;
    const argumentElements = Array.from(container.children);

    switch (functionName) {
        case 'IF':
            args.push(construirCondicion(argumentElements[0], false));
            args.push(procesarArgumento(argumentElements[1]));
            args.push(procesarArgumento(argumentElements[2]));
            break;
        case 'COUNTIF':
            args.push(obtenerVariables(argumentElements[0].querySelector('.variable-selector')));
            args.push(construirCondicion(argumentElements[1], false));
            break;
        case 'COUNTIFS':
            argumentElements.forEach(argumentElement => {
                const condition = construirCondicion(argumentElement, false);
                if (condition) {
                    args.push(condition);
                }
            });
            break;
        case 'IFERROR':
            args.push(procesarArgumento(argumentElements[0]));
            args.push(procesarArgumento(argumentElements[1]));
            break;
        case 'VLOOKUP':
            args.push(procesarArgumento(argumentElements[0]));
            args.push(obtenerValor(argumentElements[1].querySelector('input')));
            args.push(obtenerValor(argumentElements[2].querySelector('input')));
            args.push(obtenerValor(argumentElements[3].querySelector('input')));
            break;
        case 'ARITHMETIC':
            return obtenerValor(argumentElements[0].querySelector('input'));
        default:
            return '';
    }
    return `${translate(functionName)}(${args.join(',')})`;
}

function obtenerVariables(selectElement) {
    return selectElement ? selectElement.value : '';
}

function obtenerValor(inputElement) {
    return inputElement ? inputElement.value.trim().replace(/,/g, '.') : '';
}

function procesarArgumento(argumentElement) {
    if (!argumentElement) return '';

    const nestedFunctionSelect = argumentElement.querySelector('.selectorFuncionAnidada');
    if (nestedFunctionSelect && nestedFunctionSelect.value) {
        const nestedFunctionContainer = argumentElement.querySelector('.nested-function');
        return construirFormulaDesdeContenedor(nestedFunctionContainer, nestedFunctionSelect.value);
    }

    const variableSelect = argumentElement.querySelector('.variable-selector');
    if (variableSelect && variableSelect.value) {
        return variableSelect.value;
    }

    const inputElement = argumentElement.querySelector('input');
    return inputElement ? inputElement.value.trim().replace(/,/g, '.') : '';
}

function construirCondicion(argumentElement, quoteValue = true) {
    const variableSelect = argumentElement.querySelector('.variable-selector');
    const operatorSelect = argumentElement.querySelector('.operator-selector');
    const valueInput = argumentElement.querySelector('input[type="text"]');
    let value = valueInput ? valueInput.value.trim().replace(/,/g, '.') : '';

    if (quoteValue) {
        value = `"${value}"`;
    }

    if (variableSelect && operatorSelect && valueInput && variableSelect.value) {
        return `${variableSelect.value}${operatorSelect.value}${value}`;
    }
    return value;
}

function traducirFuncion(name) {
    const map = {
        "SI": "IF",
        "CONTAR.SI": "COUNTIF",
        "CONTAR.SI.CONJUNTO": "COUNTIFS",
        "SI.ERROR": "IFERROR",
        "BUSCARV": "VLOOKUP",
        "ARITHMETIC": "ARITHMETIC"
    };
    return map[name] || name;
}

function popularDropdown(selectElement) {
    const sampleColumns = ["Gasolina", "Kilometraje", "Fecha", "Estado", "Valor"];
    selectElement.innerHTML = '<option value="">Seleccionar</option>';
    sampleColumns.forEach(column => {
        const option = document.createElement('option');
        option.value = `[@${column}]`;
        option.textContent = column;
        selectElement.appendChild(option);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const mainFunctionSelect = document.getElementById('main-function');
});