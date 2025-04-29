async function inicializarModuloGestionUsuarios() {
    console.log("Módulo de Gestión de Usuarios inicializado");
    localStorage.setItem('seccion-activa', 'gestionUsuarios');

    try {
        const { obtenerUsuarios } = require('../../backend/casosUso/usuarios/consultarUsuarios.js');
        const usuarios = await obtenerUsuarios();
        mostrarUsuarios(usuarios?.obtenerUsuarios() ?? []);
    } catch (error) {
        console.error("Error al obtener usuarios:", error);
    }
}

function mostrarUsuarios(usuarios) {
    const listaUsuarios = document.getElementById('lista-usuarios');
    if (!listaUsuarios) {
        console.error("No se encontró el elemento de la lista de usuarios en el DOM.");
        return;
    }

    listaUsuarios.innerHTML = '';

    if (usuarios.length === 0) {
        listaUsuarios.innerHTML = '<li>No hay usuarios disponibles.</li>';
        return;
    }

    const fragmento = document.createDocumentFragment();
    for (const { nombre } of usuarios) {
        const div = document.createElement('div');
        div.className = 'frame-usuario';
        div.innerHTML = `
            <div class="nombre-usuario">
                <div class="texto-usuario">${nombre}</div>
                <button class="boton-editar"><img src="../utils/iconos/Editar2.svg" alt="Editar"/></button>
                <button class="boton-eliminar"><img src="../utils/iconos/BasuraBlanca.svg" alt="Eliminar"/></button>
            </div>
        `;
        fragmento.appendChild(div);
    }
    listaUsuarios.appendChild(fragmento);
}

window.inicializarModuloGestionUsuarios = inicializarModuloGestionUsuarios;