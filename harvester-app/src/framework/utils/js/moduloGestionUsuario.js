// RF40 Administrador consulta usuarios - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF40
// RF43 Administrador elimina usuario - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF43
// RF41 Administrador consulta usuario - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF41 
// RF39 Administrador crea usuario - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF39

const { crearUsuario: crearUsuarioCU } = require('../../backend/casosUso/usuarios/crearUsuario');
const { obtenerUsuarios } = require('../../backend/casosUso/usuarios/consultarUsuarios.js');
const { eliminarUsuario: eliminarUsuarioCU } = require('../../backend/casosUso/usuarios/eliminarUsuario');
const { consultarRoles: consultarRolesCU } = require('../../backend/casosUso/usuarios/consultarRoles.js');

const Swal2 = require('sweetalert2');

const usuariosPorPagina = 6;
let paginaActual = 1;
let listaUsuarios = [];
let usuariosFiltrados = [];
let terminoBusqueda = '';

/**
 * Inicializa el módulo de gestión de usuarios.
 * Carga los usuarios desde el backend, configura la paginación
 * y añade event listeners a los botones de la interfaz.
 * @async
 * @function inicializarModuloGestionUsuarios
 * @returns {Promise<void>}
 */
async function inicializarModuloGestionUsuarios() {
    localStorage.setItem('seccion-activa', 'gestionUsuarios');

    const columnaCrear = document.getElementById('columna-crear-usuario');
    columnaCrear.style.display = 'none';

    try {
        // Cargar usuarios
        const usuarios = await obtenerUsuarios();
        listaUsuarios = usuarios?.obtenerUsuarios() ?? [];
        usuariosFiltrados = [...listaUsuarios];
        cargarPagina(1);

        // Cargar roles
        await guardarRoles();
        const selectRol = document.querySelector('#rol');
        if (selectRol) {
            llenarSelectConRoles(selectRol);
        }
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        document.getElementById('lista-usuarios').innerHTML
        = '<div class="error-carga">Error al cargar los usuarios. Intente de nuevo más tarde.</div>';
    }

    const botonAgregar = document.querySelector('.primario');
    botonAgregar.addEventListener('click', evento => {
        evento.preventDefault();
        columnaCrear.style.display = 'block';
    });

    const botonCancelar = document.querySelector('.btn-cancelar');
    botonCancelar.addEventListener('click', evento => {
        evento.preventDefault();
        columnaCrear.style.display = 'none';
    });

    // Configurar el campo de búsqueda
    const inputBusqueda = document.getElementById('buscar-usuario');
    inputBusqueda.addEventListener('input', evento => {
        terminoBusqueda = evento.target.value.toLowerCase().trim();
        filtrarUsuarios();
    });

    // Agregar también un listener para cuando se presiona Enter
    inputBusqueda.addEventListener('keypress', evento => {
        if (evento.key === 'Enter') {
            evento.preventDefault(); // Evitar que se envíe un formulario si está dentro de uno
            terminoBusqueda = inputBusqueda.value.toLowerCase().trim();
            filtrarUsuarios();
        }
    });
}
function filtrarUsuarios() {
    if (terminoBusqueda === '') {
        usuariosFiltrados = [...listaUsuarios];
    } else {
        usuariosFiltrados = listaUsuarios.filter(usuario => 
            usuario.nombre.toLowerCase().includes(terminoBusqueda) 
            || (usuario.correo && usuario.correo.toLowerCase().includes(terminoBusqueda)));
    }
    paginaActual = 1; // Reiniciar la página actual al filtrar
    cargarPagina(1); // Volver a la primera página con resultados filtrados
}

/**
 * Elimina un usuario del sistema.
 * Llama al backend para eliminar el usuario y actualiza la lista de usuarios.
 * @async
 * @function eliminarUsuario
 * @param {string} id - ID del usuario a eliminar
 * @returns {Promise<void>}
 */
async function eliminarUsuario(id) {
    try {
        const respuesta = await eliminarUsuarioCU(id);

        if (!respuesta.ok) {
            return Swal2.fire({
                title: 'Error',
                text: 'Error al eliminar el usuario.',
                icon: 'error'
            });
        }
        
        return Swal2.fire({
            title: 'Eliminación exitosa',
            text: 'El usuario ha sido eliminado.',
            icon: 'success'
        });
    } catch (error) {
        console.error('Error al eliminar el usuario:', error);
        return Swal2.fire({
                title: 'Error de conexión',
                text: 'Verifica tu conexión e inténtalo de nuevo.',
                icon: 'error'
            });
    }
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
    const paginasTotales = Math.ceil(usuariosFiltrados.length / usuariosPorPagina);

    const inicio = (pagina - 1) * usuariosPorPagina;
    const fin = inicio + usuariosPorPagina;
    const usuariosPagina = usuariosFiltrados.slice(inicio, fin);

    mostrarUsuarios(usuariosPagina);

    const paginacion = document.querySelector('.paginacion');
    paginacion.innerHTML = '';

    if (usuariosFiltrados.length === 0) {
        const listaUsuariosElemento = document.getElementById('lista-usuarios');
        listaUsuariosElemento.innerHTML = '<div class="sin-resultados">No hay usuarios que coincidan con la búsqueda.</div>';
        return;
    }

    // Solo mostrar paginación si hay más de una página
    if (paginasTotales <= 1) {
        return;
    }

    const previo = document.createElement('button');
    previo.textContent = '<';
    previo.classList.add('boton-pagina-previa');
    previo.disabled = paginaActual === 1;
    previo.onclick = evento => {
        evento.preventDefault();
        if (paginaActual > 1) {
            cargarPagina(paginaActual - 1);
        }
    };
    paginacion.appendChild(previo);

    for (let numeroPagina = 1; numeroPagina <= paginasTotales; numeroPagina += 1) {
        if (
            numeroPagina === 1
            || numeroPagina === paginasTotales
            || (numeroPagina >= paginaActual - 1 && numeroPagina <= paginaActual + 1)
        ) {
            const botonPagina = document.createElement('button');
            botonPagina.textContent = numeroPagina;
            botonPagina.classList.add('boton-pagina');
            if (numeroPagina === paginaActual) {
                botonPagina.classList.add('pagina-actual');
            }
            botonPagina.onclick = evento => {
                evento.preventDefault();
                cargarPagina(numeroPagina);
            };
            paginacion.appendChild(botonPagina);
        } else if (
            (numeroPagina === paginaActual - 2 && numeroPagina > 1)
            || (numeroPagina === paginaActual + 2 && numeroPagina < paginasTotales)
        ) {
            // Evitamos duplicar los puntos
            const puntos = document.createElement('span');
            puntos.textContent = '...';
            puntos.classList.add('puntos-paginacion');
            paginacion.appendChild(puntos);
        }
    }

    const siguiente = document.createElement('button');
    siguiente.textContent = '>';
    siguiente.classList.add('boton-pagina-siguiente');
    siguiente.disabled = paginaActual === paginasTotales;
    siguiente.onclick = evento => {
        evento.preventDefault();
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
    for (const { id, nombre } of usuarios) {
        const div = document.createElement('div');
        div.className = 'frame-usuario';
        div.innerHTML = `
            <div class='nombre-usuario'>
                <div class='texto-usuario'>${nombre}</div>
            </div>
                <button class='boton-editar'>
                  <img src='../utils/iconos/Editar2.svg' alt='Editar'/>
                </button>
                <button class='boton-eliminar' data-id='${id}'>
                  <img src='../utils/iconos/BasuraBlanca.svg' alt='Eliminar'/>
                </button>
        `;
        fragmento.appendChild(div);
    }
    listaUsuariosElemento.appendChild(fragmento);

    // Añadir eventos a los botones de eliminar
    const botonesEliminar = listaUsuariosElemento.querySelectorAll('.boton-eliminar');
    botonesEliminar.forEach(boton => {
        boton.addEventListener('click', async evento => {
            evento.preventDefault();
            const id = boton.getAttribute('data-id');
            Swal2.fire({
                title: '¿Eliminar usuario?',
                text: 'Esta acción no se puede deshacer.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Confirmar',
                cancelButtonText: 'Cancelar'
              }).then(async (resultado) => { // Cambiar el callback a async
                if (resultado.isConfirmed) {
                    await eliminarUsuario(id); // Ahora puedes usar await aquí
                    setTimeout(() => {
                        inicializarModuloGestionUsuarios(); // Recargar la lista de usuarios
                    }, 500);
                }
            });
        });
    });
}

/**
 * Crea un nuevo usuario en el sistema.
 * Captura los datos del formulario, valida los campos, 
 * realiza la petición al backend mediante crearUsuarioAPI y muestra retroalimentación.
 * @async
 * @function crearUsuario
 * @returns {Promise<void>}
 */
async function crearUsuario() {
    const nombreInput = document.getElementById('username');
    const correoInput = document.getElementById('email');
    const contraseniaInput = document.getElementById('password');
    const rolInput = document.getElementById('rol');

    const nombre = nombreInput.value.trim();
    const correo = correoInput.value.trim();
    const contrasenia = contraseniaInput.value.trim();
    const idRol_FK = parseInt(rolInput.value, 10);

    console.log('Datos enviados al backend:');
    console.log({ nombre, correo, contrasenia, idRol_FK });

    if (!nombre || !correo || !contrasenia || isNaN(idRol_FK)) {
        return Swal2.fire({
            title: 'Datos incompletos',
            text: 'Por favor, completa todos los campos.',
            icon: 'warning',
        });
    }

    try {
        const resultado = await crearUsuarioCU({ nombre, correo, contrasenia, idRol_FK });

        if (resultado.ok) {
            Swal2.fire({
                title: 'Usuario creado',
                text: resultado.mensaje || 'El usuario fue registrado correctamente.',
                icon: 'success',
            });

            // Limpiar los campos del formulario
            nombreInput.value = '';
            correoInput.value = '';
            contraseniaInput.value = '';
            rolInput.value = '';

            document.getElementById('columna-crear-usuario').style.display = 'none';
            await inicializarModuloGestionUsuarios(); // Recargar usuarios
        } else {
            Swal2.fire({
                title: 'Error al crear usuario',
                text: resultado.mensaje || 'No se pudo registrar el usuario.',
                icon: 'error',
            });
        }
    } catch (error) {
        console.error('Error al crear usuario:', error);
        Swal2.fire({
            title: 'Error de red',
            text: 'Hubo un problema al conectar con el servidor.',
            icon: 'error',
        });
    }
}

// Asociar el evento al botón btn-guardar
const botonGuardar = document.querySelector('.btn-guardar');
botonGuardar.addEventListener('click', async evento => {
    evento.preventDefault();
    await crearUsuario();
});

// Variable global para almacenar los roles
let rolesCache = [];

/**
 * Carga los roles desde el backend y los guarda en la variable global `rolesCache`.
 * @async
 * @function guardarRoles
 * @returns {Promise<void>}
 */
async function guardarRoles() {
    try {
        const roles = await consultarRolesCU(); // Llama a la función de consultarRoles.js
        console.log('Roles obtenidos:', roles); // Para depuración

        if (!roles || roles.length === 0) {
            console.warn('No hay roles disponibles para guardar.');
            rolesCache = []; // Vacía la caché si no hay roles
            return;
        }

        rolesCache = roles; // Guarda los roles en la variable global
    } catch (error) {
        console.error('Error al cargar y guardar los roles:', error);
        rolesCache = []; // Vacía la caché en caso de error
    }
}

/**
 * Llena el elemento <select> con los roles almacenados en `rolesCache`.
 * @function llenarSelectConRoles
 * @param {HTMLElement} selectRol - El elemento <select> a llenar
 * @returns {void}
 */
function llenarSelectConRoles(selectRol) {
    if (!rolesCache || rolesCache.length === 0) {
        selectRol.innerHTML = '<option value="">No hay roles disponibles</option>';
        return;
    }

    // Limpiar el contenido previo del <select>
    selectRol.innerHTML = '<option value="">Selecciona un rol</option>';

    // Agregar los roles al <select>
    rolesCache.forEach(rol => {
        console.log(`Agregando rol: ID=${rol.idRol}, Nombre=${rol.Nombre}`); // Para depuración
        const option = document.createElement('option');
        option.value = rol.idRol; // Envía el idRol al backend
        option.textContent = rol.Nombre; // Muestra el nombre del rol
        selectRol.appendChild(option);
    });
}


// Ejemplo de uso
const selectRol = document.querySelector('#rol'); // Busca el <select> con id="rol"
if (selectRol) {
    // Cargar y guardar los roles al iniciar
    guardarRoles().then(() => {
        // Llenar el <select> con los roles guardados
        llenarSelectConRoles(selectRol);
    });

    // También puedes agregar un evento para recargar los roles si es necesario
    selectRol.addEventListener('focus', () => llenarSelectConRoles(selectRol));
} else {
    console.error('No se encontró el elemento <select> con id="rol".');
}


// Expone la función de inicialización al objeto window
window.inicializarModuloGestionUsuarios = inicializarModuloGestionUsuarios;
