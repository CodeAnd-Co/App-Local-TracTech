// RF69 Guardar Fórmula - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF69
async function guardarFormula(nombre, formula){
    const respuesta = await fetch('http://localhost:3000/formulas/guardarFormula', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({nombre, formula}),
    });

    const datos = await respuesta.json();
    return { ok: respuesta.ok, ...datos };
}

module.exports = {
    guardarFormula,
};