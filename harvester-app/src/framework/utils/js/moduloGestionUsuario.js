const usuariosPorPagina = 6;
let paginaActual = 1;
let listaUsuarios = [];

/**
 * Inicializa el módulo de gestión de usuarios.
 * Carga los usuarios desde el backend, configura la paginación
 * y añade event listeners a los botones de la interfaz.
 * @async
 * @function inicializarModuloGestionUsuarios
 * @returns {Promise<void>}
 */
async function inicializarModuloGestionUsuarios() {
    console.log('Módulo de Gestión de Usuarios inicializado');
    localStorage.setItem('seccion-activa', 'gestionUsuarios');

    const columnaCrear = document.getElementById('columna-crear-usuario');
    columnaCrear.style.display = 'none';

    try {
        const { obtenerUsuarios } = require('../../backend/casosUso/usuarios/consultarUsuarios.js');
        const usuarios = await obtenerUsuarios();
        listaUsuarios = usuarios?.obtenerUsuarios() ?? [];
        cargarPagina(1);
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
    }

    const btnAgregar = document.querySelector('.primario');
    btnAgregar.addEventListener('click', ev => {
        ev.preventDefault();
        columnaCrear.style.display = 'block';
    });

    const btnCancelar = document.querySelector('.btn-cancelar');
    btnCancelar.addEventListener('click', ev => {
        ev.preventDefault();
        columnaCrear.style.display = 'none';
    });
}

/**
 * Carga y muestra una página específica de usuarios.
 * Calcula los usuarios correspondientes a la página solicitada
 * y actualiza la interfaz de paginación.
 * @function cargarPagina
 * @param {number} pagina - Número de la página a cargar (empezando desde 1)
 * @returns {void}
 */
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
    previo.textContent = '<';
    previo.classList.add('boton-pagina-previa');
    previo.onclick = ev => {
        ev.preventDefault();
        if (paginaActual > 1) {
            cargarPagina(paginaActual - 1);
        }
    };
    paginacion.appendChild(previo);

    for (let i = 1; i <= paginasTotales; i++) {
        if (
            i === 1 ||
            i === paginasTotales ||
            (i >= paginaActual - 1 && i <= paginaActual + 1)
        ) {
            const botonPagina = document.createElement('button');
            botonPagina.textContent = i;
            botonPagina.classList.add('boton-pagina');
            if (i === paginaActual) {
                botonPagina.classList.add('pagina-actual');
            }
            botonPagina.onclick = ev => {
                ev.preventDefault();
                cargarPagina(i);
            };
            paginacion.appendChild(botonPagina);
        } else if (
            i === paginaActual - 2 ||
            i === paginaActual + 2
        ) {
            const puntos = document.createElement('span');
            puntos.textContent = '...';
            puntos.classList.add('puntos-paginacion');
            paginacion.appendChild(puntos);
        }
    }

    const siguiente = document.createElement('button');
    siguiente.textContent = '>';
    siguiente.classList.add('boton-pagina-siguiente');
    siguiente.onclick = ev => {
        ev.preventDefault();
        if (paginaActual < paginasTotales) {
            cargarPagina(paginaActual + 1);
        }
    };
    paginacion.appendChild(siguiente);
}

/**
 * Muestra los usuarios en la interfaz gráfica.
 * Crea elementos DOM para cada usuario y los añade a la lista de usuarios.
 * @function mostrarUsuarios
 * @param {Array<Object>} usuarios - Lista de usuarios a mostrar
 * @param {string} usuarios[].nombre - Nombre del usuario
 * @returns {void}
 */
function mostrarUsuarios(usuarios) {
    const listaUsuariosElemento = document.getElementById('lista-usuarios');
    if (!listaUsuariosElemento) {
        console.error('No se encontró el elemento de la lista de usuarios en el DOM.');
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
            <div class='nombre-usuario'>
                <div class='texto-usuario'>${nombre}</div>
            </div>
                <button class='boton-editar'>
                  <img src='../utils/iconos/Editar2.svg' alt='Editar'/>
                </button>
                <button class='boton-eliminar'>
                  <img src='../utils/iconos/BasuraBlanca.svg' alt='Eliminar'/>
                </button>
        `;
        fragmento.appendChild(div);
    }
    listaUsuariosElemento.appendChild(fragmento);
}

// Expone la función de inicialización al objeto window
window.inicializarModuloGestionUsuarios = inicializarModuloGestionUsuarios;
