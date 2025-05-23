// RF68 Modificar fórmula - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF68 
// RF69 Guardar Fórmula - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF69
// RF76 Consultar Fórmulas - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF76
// RF71 Eliminar Fórmula - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF71

const { URL_BASE } = require(`${rutaBase}src/framework/utils/scripts/constantes.js`);
/**
 * 
 * @module formulaApi
 * @description Módulo para interactuar con la API de fórmulas.
 * @param {string} nombre 
 * @param {string} formula 
 * @param {string} token
 * @returns {Promise<Object>} Respuesta de la API. 
 * @throws {Error} Si no se pudo guardar la fórmula.
 */
async function guardarFormula(nombre, formula, token) {
    const respuesta = await fetch(`${URL_BASE}/formulas/guardarFormula`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({nombre, formula}),
    });

    const datos = await respuesta.json();
    return { ok: respuesta.ok, ...datos };
}

/**
 * @async
 * @function consultarFormulas
 * @param {string} token - Token de autenticación.
 * @returns {Promise<Object>} Respuesta de la API con las fórmulas.
 * @throws {Error} Si no se pudo consultar las fórmulas.
 */
async function consultarFormulas(token){
    const respuesta = await fetch(`${URL_BASE}/formulas/consultarFormulas`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
    });

    const datos = await respuesta.json();
    return { ok: respuesta.ok, ...datos };
}

/**
 * @async
 * @function eliminarFormula
 * @param {string} id - ID de la fórmula a eliminar.
 * @param {string} token - Token de autenticación.
 * @returns {Promise<Object>} Respuesta de la API con el resultado de la eliminación.
 * @throws {Error} Si no se pudo eliminar la fórmula.
 */
async function eliminarFormula(id, token){
    const respuesta = await fetch(`${URL_BASE}/formulas/eliminarFormula/`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id }),
    });

    const datos = await respuesta.json();
    return { ok: respuesta.ok, ...datos };
}

/**
 * @async
 * @function modificarFormula
 * @param {string} id - ID de la fórmula a modificar.
 * @param {string} nombre - Nuevo nombre de la fórmula.
 * @param {string} formula - Nueva fórmula.
 * @param {string} token - Token de autenticación.
 * @returns {Promise<Object>} Respuesta de la API con la fórmula modificada.
 * @throws {Error} Si no se pudo modificar la fórmula.
 */
async function modificarFormula(id, nombre, formula, token) {
    const respuesta = await fetch(`${URL_BASE}/formulas/modificarFormula`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id, nombre, formula }),
    });

    const datos = await respuesta.json();
    return { ok: respuesta.ok, ...datos };
}

module.exports = {
    guardarFormula,
    consultarFormulas,
    eliminarFormula,
    modificarFormula,
};
