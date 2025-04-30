const token = localStorage.getItem('token');

async function obtenerUsuarios() {
    const respuesta = await fetch('http://localhost:3000/usuarios/consultar-usuarios', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    });
    
    const datos = await respuesta.json();

    return { ok: respuesta.ok, ...datos };
}

module.exports = {
    obtenerUsuarios,
};