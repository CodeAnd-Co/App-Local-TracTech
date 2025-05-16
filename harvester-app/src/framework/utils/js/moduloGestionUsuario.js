// RF40 Administrador consulta usuarios - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF40
// RF41 Administrador modifica usuario - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF41
// RF43 Administrador elimina usuario - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF43
// RF41 Administrador consulta usuario - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF41 
// RF39 Administrador crea usuario - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF39

const { modificarUsuario } = require('../../backend/casosUso/usuarios/modificarUsuario.js');
const { crearUsuario: crearUsuarioCU } = require('../../backend/casosUso/usuarios/crearUsuario');
const { obtenerUsuarios } = require('../../backend/casosUso/usuarios/consultarUsuarios.js');
const { eliminarUsuario: eliminarUsuarioCU } = require('../../backend/casosUso/usuarios/eliminarUsuario');
const { consultarRoles: consultarRolesCU } = require('../../backend/casosUso/usuarios/consultarRoles.js');

const Swal2 = require('sweetalert2');

const usuariosPorPagina = 6;
const modoFormulario = Object.freeze({
    CREAR: 'crear',
    EDITAR: 'editar',
});
let modoActual = modoFormulario.CREAR;
let usuarioAEditar = null;
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

    const columnaCrear = document.getElementById('columna-crear-modificar-usuario');

    try {
        // Cargar usuarios
        const usuarios = await obtenerUsuarios();
        listaUsuarios = usuarios?.obtenerUsuarios() ?? [];
        usuariosFiltrados = [...listaUsuarios];
        cargarPagina(1);

        // Cargar roles
        
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        document.getElementById('lista-usuarios').innerHTML
        = '<div class="error-carga">Error al cargar los usuarios. Intente de nuevo más tarde.</div>';
    }

    const botonAgregar = document.querySelector('.primario');
    // Eliminar event listeners anteriores y agregar uno nuevo
    const nuevoBotonAgregar = botonAgregar.cloneNode(true);
    botonAgregar.parentNode.replaceChild(nuevoBotonAgregar, botonAgregar);
    nuevoBotonAgregar.addEventListener('click', evento => {
        evento.preventDefault();

        // Actualizar estados globales
        modoActual = modoFormulario.CREAR;
        usuarioAEditar = null;

        // Cambiar texto del formulario
        document.querySelector('.crear-modificar-usuario').textContent = 'Crear usuario';
        document.querySelector('.btn-guardar').textContent = 'Guardar';

        // Limpiar los campos del formulario
        document.getElementById('username').value = '';
        document.getElementById('email').value = '';
        document.getElementById('password').value = '';
        document.getElementById('rol').value = '';

        columnaCrear.style.display = 'block';
        cargarRoles(); // Cargar roles al abrir el formulario
    });

    const botonCancelar = document.querySelector('.btn-cancelar');
    // Eliminar event listeners anteriores y agregar uno nuevo
    const nuevoBotonCancelar = botonCancelar.cloneNode(true);
    botonCancelar.parentNode.replaceChild(nuevoBotonCancelar, botonCancelar);
    nuevoBotonCancelar.addEventListener('click', evento => {
        evento.preventDefault();
        columnaCrear.style.display = 'none';
    });

    // Eliminar event listeners anteriores y agregar uno nuevo al botón guardar
    const botonGuardar = document.querySelector('.btn-guardar');
    const nuevoBotonGuardar = botonGuardar.cloneNode(true);
    botonGuardar.parentNode.replaceChild(nuevoBotonGuardar, botonGuardar);
    nuevoBotonGuardar.addEventListener('click', async evento => {
        evento.preventDefault();
        if (modoActual === modoFormulario.CREAR) {
            await crearUsuario();
        } else if (modoActual === modoFormulario.EDITAR) {
            await editarUsuario();
        }
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
                <button class='boton-editar' data-id='${id}'>
                  <img src='../utils/iconos/Editar2.svg' alt='Editar'/>
                </button>
                <button class='boton-eliminar' data-id='${id}'>
                  <img src='../utils/iconos/BasuraBlanca.svg' alt='Eliminar'/>
                </button>
        `;
        fragmento.appendChild(div);
    }
    listaUsuariosElemento.appendChild(fragmento);

    // Añadir eventos a los botones de editar
    escucharEventoBotonesEditar(listaUsuariosElemento);

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
 * Esta función busca todos los elementos con la clase `.boton-editar` en la lista
 * de usuarios actualmente renderizados (paginados). Al hacer clic en uno de estos
 * botones, se obtiene el `idUsuario` correspondiente desde `usuariosFiltrados`,
 * y se invoca la función `modificarUsuario(id)` para iniciar el proceso de edición.
 *
 * @param {void}
 * @returns {void}
 */
function escucharEventoBotonesEditar(listaDeUsuarios) {
    listaDeUsuarios.querySelectorAll('.boton-editar').forEach(boton => {
        boton.addEventListener('click', evento => {
            evento.preventDefault();
            modoEditar(boton.dataset.id);
            cargarRoles();
        });
    });
}

/**
 * Cambia el modo del formulario a "Editar" y precarga los datos del usuario seleccionado.
 *
 * @function modoEditar
 * @param {number} idUsuario - El identificador único del usuario que se desea editar.
 * @throws {Error} Si el usuario con el ID proporcionado no se encuentra en la lista de usuarios.
 */
function modoEditar(idUsuario) {

    // Precargar los datos del usuario
    const usuario = listaUsuarios.find(usuario => usuario.id === Number(idUsuario));
    if (!usuario) {
        console.error('Usuario no encontrado');
        return;
    }

    // Actualizar estados globales
    modoActual = modoFormulario.EDITAR;
    usuarioAEditar = usuario;

    // Cambiar texto del formulario
    document.querySelector('.crear-modificar-usuario').textContent = 'Modificar usuario';
    document.querySelector('.btn-guardar').textContent = 'Modificar';
    document.getElementById('columna-crear-modificar-usuario').style.display = 'block';

    
    document.getElementById('username').value = usuario.nombre;
    document.getElementById('email').value = usuario.correo;
    document.getElementById('password').value = ''; // Por seguridad, no se muestra
    document.getElementById('rol').value = usuario.rol;
}

/**
 * Envía los datos modificados del usuario al backend y actualiza la vista.
 * Al finalizar—tanto si tuvo éxito como si no—resetea el formulario y el estado
 * de edición para volver al modo de creación de usuario.
 *
 * @async
 * @function editarUsuario
 * @returns {Promise<void>}
 */
async function editarUsuario() {
    const nombreIngresado = document.getElementById('username').value.trim();
    const correoIngresado = document.getElementById('email').value.trim();
    const contraseniaIngresada = document.getElementById('password').value.trim();
    const rolIngresado = document.getElementById('rol').value.trim();
    const idRolIngresado = rolesCache.find(rol => rol.Nombre === usuarioAEditar.rol)?.idRol

    const usuario = listaUsuarios.find(usuario => usuario.id === usuarioAEditar.id);
    if (!usuario) {
        console.error('Usuario no encontrado');
        return;
    }

    // Flags de “campo modificado”
    const cambioNombre    = nombreIngresado && nombreIngresado !== usuario.nombre;
    const cambioCorreo    = correoIngresado && correoIngresado !== usuario.correo;
    const cambioPass      = contraseniaIngresada !== '';
    const cambioRol       = rolIngresado && Number(rolIngresado) !== idRolIngresado;

    if (!(cambioNombre || cambioCorreo || cambioPass || cambioRol)) {
        return Swal2.fire({
        title: 'Error',
        text: 'Debes modificar al menos un campo del usuario.',
        icon: 'warning',
        });
    }

    // Verificar si el correo ya existe para otro usuario
    const correoYaExiste = listaUsuarios.some(usuario =>
        usuario.correo === correoIngresado && usuario.id !== usuarioAEditar.id
    );
    
    if (correoYaExiste) {
        Swal2.fire({
            title: 'Error',
            text: 'No se puede repetir el correo entre usuarios.',
            icon: 'warning',
        });
        return;
    }

    // Validación de campos en caso de estar vacío
    const idUsuario = usuarioAEditar.id;
    const nombreUsuario = (nombreIngresado !== '') ? nombreIngresado : usuario.nombre;
    const correoUsuario = (correoIngresado !== '') ? correoIngresado : usuario.correo;
    const idRolUsuario = (!rolIngresado) ? rolIngresado : idRolIngresado;

    try {
        const resultado = await modificarUsuario(idUsuario, nombreUsuario, correoUsuario, contraseniaIngresada, idRolUsuario);
        if (resultado.ok) {
            Swal2.fire({
                title: 'Usuario modificado',
                text: resultado.mensaje || 'El usuario fue modificado correctamente.',
                icon: 'success',
            });

            // Limpiar los campos del formulario
            document.getElementById('username').value = '';
            document.getElementById('email').value = '';
            document.getElementById('password').value = '';
            document.getElementById('rol').value = '';

            // Recargar la lista de usuarios
            setTimeout(() => {
                inicializarModuloGestionUsuarios();
            }, 500);
        } else {
            Swal2.fire({
                title: 'Error al modificar usuario',
                text: resultado.mensaje || 'No se pudo modificar el usuario.',
                icon: 'error',
            });
        }
    } catch (error) {
        Swal2.fire({
            title: 'Error de red',
            text: 'Hubo un problema al conectar con el servidor.',
            icon: 'error',
        });
    }
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
    const idRolFK = parseInt(rolInput.value, 10);


    if (!nombre || !correo || !contrasenia || isNaN(idRolFK)) {
        return Swal2.fire({
            title: 'Datos incompletos',
            text: 'Por favor, completa todos los campos.',
            icon: 'warning',
        });
    }

    try {
        const resultado = await crearUsuarioCU({ nombre, correo, contrasenia, idRolFK });

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
            
            // Actualizar la vista para mostrar el nuevo usuario en la lista
            setTimeout(() => {
                inicializarModuloGestionUsuarios(); // Recargar la lista de usuarios
            }, 500);
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
    const usuario = listaUsuarios.find(usuario => usuario.id === usuarioAEditar.id);
    if (!usuario) {
        console.error('Usuario no encontrado');
        return;
    }

    const defaultIdRol = usuario.rol; // ID del rol por defecto
    
    if (!rolesCache || rolesCache.length === 0) {
        selectRol.innerHTML = '<option value="">No hay roles disponibles</option>';
        return;
    }



    // Limpiar el contenido previo del <select>
    selectRol.innerHTML = `
        <option value="" disabled ${defaultIdRol===null ? 'selected' : ''}>
        Selecciona rol
        </option>
    `;

    // Agregar los roles al <select>
    rolesCache.forEach(rol => {
        
        const option = document.createElement('option');
        option.value = rol.idRol; // Envía el idRol al backend
        option.textContent = rol.Nombre; // Muestra el nombre del rol
        selectRol.appendChild(option);
    });
}


function cargarRoles() {
    const selectRol = document.querySelector('#rol'); // Busca el <select> con id="rol"
    if (selectRol) {
        // Cargar y guardar los roles al iniciar
        guardarRoles().then(() => {
            // Llenar el <select> con los roles guardados
            llenarSelectConRoles(selectRol);
        });
    } else {
        console.error('No se encontró el elemento <select> con id="rol".');
    }
    return
}


// Expone la función de inicialización al objeto window
window.inicializarModuloGestionUsuarios = inicializarModuloGestionUsuarios;
