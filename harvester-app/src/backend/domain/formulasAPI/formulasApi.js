async function crearFormula(formula){
    const respuesta = await fetch("http://localhost:3000/formulas/crear-formula", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(formula),
    });

    const datos = await respuesta.json();
    return { ok: respuesta.ok, ...datos };
}

module.exports = {
    crearFormula,
};