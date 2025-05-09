// RF69 Guardar Fórmula - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF69
async function guardarFormula(nombre, formula, token) {
    const respuesta = await fetch('http://localhost:3000/formulas/guardarFormula', {
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

async function consultarFormulas(token){
    console.log(token)
    console.log('Consultando fórmulas en el API...');
    const respuesta = await fetch('http://localhost:3000/formulas/consultarFormulas', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
    });

    const datos = await respuesta.json();
    return { ok: respuesta.ok, ...datos };
}

async function eliminarFormula(id, token){
    const respuesta = await fetch('http://localhost:3000/formulas/eliminarFormula/', {
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

module.exports = {
    guardarFormula,
    consultarFormulas,
    eliminarFormula,
};
