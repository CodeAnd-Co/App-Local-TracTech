const usuariosPorPagina = 3;
let paginaActual = 1;
let listaUsuarios = [];

async function inicializarModuloGestionUsuarios() {
    console.log("Módulo de Gestión de Usuarios inicializado");
    localStorage.setItem('seccion-activa', 'gestionUsuarios');

    try {
        const { obtenerUsuarios } = require('../../backend/casosUso/usuarios/consultarUsuarios.js');
        const usuarios = await obtenerUsuarios();
        listaUsuarios = usuarios?.obtenerUsuarios() ?? [];
        cargarPagina(1);
    } catch (error) {
        console.error("Error al obtener usuarios:", error);
    }
}

function cargarPagina(pagina) {
    paginaActual = pagina;
    const paginasTotales = Math.ceil(listaUsuarios.length / usuariosPorPagina);

    const inicio = (pagina - 1) * usuariosPorPagina;
    const fin = inicio + usuariosPorPagina;
    const usuariosPagina = listaUsuarios.slice(inicio, fin);

    mostrarUsuarios(usuariosPagina);

    const paginacion = document.querySelector('.paginacion');
    paginacion.innerHTML = '';

    const previo = document.createElement('button');
    previo.href = '#';
    previo.textContent = '<';
    previo.classList.add('boton-pagina-previa');
    previo.onclick = paginaPrevia => {
        paginaPrevia.preventDefault();
        if (paginaActual > 1) {
            cargarPagina(paginaActual - 1);
        }
    };
    paginacion.appendChild(previo);

    for (let i = 1; i <= paginasTotales; i++) {
        if (
            i === 1 || // Siempre mostrar la primera página
            i === paginasTotales || // Siempre mostrar la última página
            (i >= paginaActual - 1 && i <= paginaActual + 1) // Mostrar páginas cercanas a la actual
        ) {
            const botonPagina = document.createElement('button');
            botonPagina.textContent = i;
            botonPagina.classList.add('boton-pagina');
            if (i === paginaActual) {
                botonPagina.classList.add('pagina-actual');
            }
            botonPagina.onclick = paginas => {
                paginas.preventDefault();
                cargarPagina(i);
            };
            paginacion.appendChild(botonPagina);
        } else if (
            i === paginaActual - 2 || // Mostrar "..." antes de las páginas cercanas
            i === paginaActual + 2 // Mostrar "..." después de las páginas cercanas
        ) {
            const puntos = document.createElement('span');
            puntos.textContent = '...';
            puntos.classList.add('puntos-paginacion');
            paginacion.appendChild(puntos);
        }
    }

    const siguiente = document.createElement('button');
    siguiente.href = '#';
    siguiente.textContent = '>';
    siguiente.classList.add('boton-pagina-siguiente');
    siguiente.onclick = paginaSiguiente => {
        paginaSiguiente.preventDefault();
        if (paginaActual < paginasTotales) {
            cargarPagina(paginaActual + 1);
        }
    };
    paginacion.appendChild(siguiente);
}

function mostrarUsuarios(usuarios) {
    const listaUsuariosElemento = document.getElementById('lista-usuarios');
    if (!listaUsuariosElemento) {
        console.error("No se encontró el elemento de la lista de usuarios en el DOM.");
        return;
    }

    listaUsuariosElemento.innerHTML = '';

    if (usuarios.length === 0) {
        listaUsuariosElemento.innerHTML = '<li>No hay usuarios disponibles.</li>';
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
    listaUsuariosElemento.appendChild(fragmento);
}

window.inicializarModuloGestionUsuarios = inicializarModuloGestionUsuarios;