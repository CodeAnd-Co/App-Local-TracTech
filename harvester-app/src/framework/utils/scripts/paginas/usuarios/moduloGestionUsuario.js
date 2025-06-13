// RF40 Administrador consulta usuarios - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF40
// RF41 Administrador modifica usuario - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF41
// RF43 Administrador elimina usuario - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF43
// RF41 Administrador consulta usuario - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF41 
// RF39 Administrador crea usuario - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF39

const { crearUsuario: crearUsuarioCU } = require(`${rutaBase}src/backend/casosUso/usuarios/crearUsuario`);
const { obtenerUsuarios: obtenerUsuariosCU } = require(`${rutaBase}src/backend/casosUso/usuarios/consultarUsuarios.js`);
const { eliminarUsuario: eliminarUsuarioCU } = require(`${rutaBase}src/backend/casosUso/usuarios/eliminarUsuario`);
const { consultarRoles: consultarRolesCU } = require(`${rutaBase}src/backend/casosUso/usuarios/consultarRoles.js`);
const { deshabilitarDispositivo } = require(`${rutaBase}src/backend/casosUso/dispositivos/deshabilitarDispositivo.js`);
const { modificarUsuario } = require(`${rutaBase}src/framework/utils/scripts/paginas/usuarios/modificarUsuario.js`);
const { validacionInicial, validarNombreCampo, validarCorreoCampo, validarContraseniaCampo, validarConfirmarContrasenia } = require(`${rutaBase}src/framework/utils/scripts/paginas/usuarios/validacionesUsuario.js`);

const { mostrarAlerta, mostrarAlertaBorrado } = require(`${rutaBase}/src/framework/vistas/includes/componentes/moleculas/alertaSwal/alertaSwal`);
const Swal = require(`${rutaBase}/node_modules/sweetalert2/dist/sweetalert2.all.min.js`);

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
let listaCorreos = [];

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

    obtenerUsuarios()
    configurarValidacionesCampos();
    configurarContadoresCampos();
    configurarBotones()
    configurarCampoCorreo();
    configurarCampoBusqueda();
    configurarVerContrasenia();
}

/** 
 * Obtiene la lista de usuarios del backend y los renderiza en la interfaz.
 * 
 * @async
 * @function renderizarUsuarios
 */
async function obtenerUsuarios() {
    try {
        listaUsuarios = [];
        usuariosFiltrados = [];
        document.getElementById('buscar-usuario').value = '';

        const usuarios = await obtenerUsuariosCU();
        listaUsuarios = usuarios?.obtenerUsuarios() ?? [];

        if (listaUsuarios.length === 0) {
            mostrarAlerta('No existen usuarios registrados en el sistema', '', 'warning');
            document.getElementById('lista-usuarios').innerHTML
                = '<div class="error-carga">No existen usuarios registrados en el sistema.</div>';
        } else {
            const usuarioActual = localStorage.getItem('nombreUsuario');
            listaUsuarios = listaUsuarios.filter(usuario => usuario.nombre !== usuarioActual.trim());
    
            usuariosFiltrados = [...listaUsuarios];
            cargarPagina(1);
        }

    } catch (error) {
        mostrarAlerta('Error al cargar usuarios', error.message || 'Verifica tu conexión e inténtalo de nuevo.', 'error');
        document.getElementById('lista-usuarios').innerHTML
            = '<div class="error-carga">Error al cargar los usuarios. Intente de nuevo más tarde.</div>';
    }

    listaCorreos = listaUsuarios.map(usuario => usuario.correo);
}

/**
 * Configura los botones de la interfaz para crear, cancelar y guardar usuarios.
 * 
 * @function configurarBotones
 */
function configurarBotones() {
    const botonAgregar = document.querySelector('.primario');
    const nuevoBotonAgregar = botonAgregar.cloneNode(true);
    botonAgregar.parentNode.replaceChild(nuevoBotonAgregar, botonAgregar);
    nuevoBotonAgregar.addEventListener('click', evento => {
        evento.preventDefault();
        mostrarFormularioUsuario(modoFormulario.CREAR);
    });

    const botonCancelar = document.querySelector('.btn-cancelar');
    const nuevoBotonCancelar = botonCancelar.cloneNode(true);
    botonCancelar.parentNode.replaceChild(nuevoBotonCancelar, botonCancelar);
    nuevoBotonCancelar.addEventListener('click', evento => {
        evento.preventDefault();
        ocultarFormularioUsuario();
    });

    const botonGuardar = document.querySelector('.btn-guardar');
    const nuevoBotonGuardar = botonGuardar.cloneNode(true);
    botonGuardar.parentNode.replaceChild(nuevoBotonGuardar, botonGuardar);
    nuevoBotonGuardar.addEventListener('click', async evento => {
        evento.preventDefault();
        actualizarTodosContadores();

        let resultado;
        if (modoActual === modoFormulario.CREAR) {
            nuevoBotonGuardar.disabled = true;
            resultado = await crearUsuario();
            nuevoBotonGuardar.disabled = false;
        } else if (modoActual === modoFormulario.EDITAR) {
            resultado = await modificarUsuario(usuarioAEditar, rolesCache, listaCorreos);
        }
        if (resultado) {
            setTimeout(() => {
                inicializarModuloGestionUsuarios(); // Recargar la lista de usuarios
            }, 500);
            //ocultarFormularioUsuario();
        }
    });
}

/**
 * Muestra la vista de creación de usuario.
 * Reinicia el formulario, actualiza el título y los campos.
 * @function mostrarVistaCrear
 */
function mostrarFormularioUsuario(modo, idUsuario = null) {
    const columnaCrear = document.getElementById('columna-crear-modificar-usuario');
    
    modoActual = modo
    usuarioAEditar = null;

    let textoTitulo = 'Crear usuario';
    let textoBotonGuardar = 'Guardar';
    let nombreUsuario = ''
    let textoNombreUsuario = 'Nombre del nuevo usuario'
    let correo = '';
    let textoCorreo = 'Correo del nuevo usuario';
    let rol = '';

    if (idUsuario) {
        const usuario = listaUsuarios.find(usuario => usuario.id === Number(idUsuario));
        if (!usuario) {
            mostrarAlerta('Error', 'Usuario no encontrado.', 'error');
            return;
        } else {
            usuarioAEditar = usuario;
            
            textoTitulo = 'Modificar usuario';
            textoBotonGuardar = 'Modificar';
            nombreUsuario = usuario.nombre;
            textoNombreUsuario = usuario.nombre;
            correo = usuario.correo;
            textoCorreo = usuario.correo;
            rol = usuario.rol;
        }
    }

    document.querySelector('.crear-modificar-usuario').textContent = textoTitulo;
    document.querySelector('.btn-guardar').textContent = textoBotonGuardar;
    document.getElementById('username').value = nombreUsuario;
    document.getElementById('username').placeholder = textoNombreUsuario;
    document.getElementById('email').value = correo;
    document.getElementById('email').placeholder = textoCorreo;
    document.getElementById('password').value = '';
    document.getElementById('passwordConfirmar').value = '';
    document.getElementById('rol').value = rol;
    columnaCrear.style.display = 'block';

    cargarRoles();
    actualizarTodosContadores();
    limpiarMensajesError();
}

/**
 * Oculta la vista de creación de usuario.
 * 
 * @function ocultarFormularioUsuario
 */
function ocultarFormularioUsuario() {
    const columnaCrear = document.getElementById('columna-crear-modificar-usuario');
    columnaCrear.style.display = 'none';
}

/**
 * Configura ek campo de correo electrónico para evitar espacios.
 * 
 * @function configurarCampoCorreo
 */
function configurarCampoCorreo() {
    const entradaCorreo = document.getElementById('email');
    if (entradaCorreo) {
        // Evita escribir espacios con el teclado
        entradaCorreo.addEventListener('keydown', (entrada) => {
            if (entrada.key === ' ') {
                entrada.preventDefault();
            }
        });
        // Elimina espacios al pegar
        entradaCorreo.addEventListener('input',  (evento) => {
            evento.target.value = evento.target.value.replace(/\s/g, '');
        });
    }
}

/**
 * Configura el campo de búsqueda de usuarios.
 * 
 * @function configurarCampoBusqueda
 */
function configurarCampoBusqueda() {
    const inputBusqueda = document.getElementById('buscar-usuario');
    inputBusqueda.addEventListener('input', evento => {
        actualizarCaracteresBuscador(inputBusqueda);
        terminoBusqueda = evento.target.value.toLowerCase().trim();
        filtrarUsuarios();
    });
}

/**
 * Actualiza el contador de caracteres restantes para el buscador de usuarios.
 * @param {HTMLInputElement} campoEntrada - Campo de entrada a validar.
 * @returns {void}
 */
function actualizarCaracteresBuscador(campoEntrada) {
    const caracteresUsados = campoEntrada.value.length;
    const limite = parseInt(campoEntrada.getAttribute('maxlength'), 10);

    // Verificación cuando se alcanza el maxlength
    if (caracteresUsados >= limite) {
        // Usar setTimeout para evitar conflictos con el evento input
        setTimeout(() => {
            mostrarAlerta('Límite alcanzado', `Has alcanzado el límite máximo de caracteres para la búsqueda de usuarios (${limite} caracteres).`, 'warning');
        }, 100);
    }
}

/**
 * Actualiza los contadores de caracteres que ya existen en el HTML.
 * No inserta nada, solo los inicializa y los mantiene al día.
 */
function configurarContadoresCampos() {
    document.querySelectorAll('.modificacion input[maxlength]').forEach(input => {
        const maximoCaracteres = input.getAttribute('maxlength');
        const contador = input.parentNode.querySelector('.contador-caracteres');
        if (!contador) return;


        // Inicializa una sola llamada a la función extraída
        actualizarContador(input, contador, maximoCaracteres);

        // Y vuelve a usar la misma función como callback
        input.addEventListener('input', () => {
            actualizarContador(input, contador, maximoCaracteres);
        });
    });
}

/**
 * Configura la checkbox de "Ver contraseña" para mostrar u ocultar la contraseña ingresada.
 * 
 * @function configurarVerContrasenia
 */
function configurarVerContrasenia() {
    const botonVerContrasenia = document.querySelector('#verContrasenia');
    const inputContrasenia = document.querySelector('#password');
    const inputConfirmarContrasenia = document.querySelector('#passwordConfirmar');

    if (botonVerContrasenia && inputContrasenia) {
        botonVerContrasenia.addEventListener('change', () => {
            if (botonVerContrasenia.checked) {
                inputContrasenia.type = 'text';
                if (inputConfirmarContrasenia) {
                    inputConfirmarContrasenia.type = 'text';
                }
            } else {
                inputContrasenia.type = 'password';
                if (inputConfirmarContrasenia) {
                    inputConfirmarContrasenia.type = 'password';
                }
            }
        });
    }
}

/** 
 * Filtra la lista de usuarios según el término de búsqueda ingresado.
 * 
 * @function filtrarUsuarios
*/
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
            mostrarAlerta('Error', 'Error al eliminar el usuario.', 'error');
        } else {
            mostrarAlerta('Eliminación exitosa', 'El usuario ha sido eliminado.', 'success');
        }
        return;
    } catch {
        mostrarAlerta('Error de conexión', 'Verifica tu conexión e inténtalo de nuevo.', 'error');
        return;
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

    if (usuariosFiltrados.length === 0) {
        const listaUsuariosElemento = document.getElementById('lista-usuarios');
        listaUsuariosElemento.innerHTML = '<div class="sin-resultados">No hay usuarios que coincidan con la búsqueda.</div>';
        return;
    } else {
        mostrarUsuarios(usuariosPagina);
    }

    configurarPaginacion(paginasTotales)
}

/**
 * Muestra los usuarios en la interfaz gráfica.
 * Crea elementos DOM para cada usuario y los añade a la lista de usuarios.
 * @function mostrarUsuarios
 * @param {Array<Object>} usuarios - Lista de usuarios a mostrar
 * @param {string} usuarios[].nombre - Nombre del usuario
 * @param {boolean} usuarios[].tieneDispositivo - Si el usuario tiene dispositivo vinculado
 * @param {boolean} usuarios[].dispositivoActivo - Si el dispositivo está activo
 * @returns {void}
 */
function mostrarUsuarios(usuarios) {
    const listaUsuariosElemento = document.getElementById('lista-usuarios');
    if (!listaUsuariosElemento) {
        return;
    }

    listaUsuariosElemento.innerHTML = '';

    if (usuarios.length === 0) {
        listaUsuariosElemento.innerHTML = '<li>No hay usuarios disponibles.</li>';
        return;
    }

    const fragmento = crearListaUsuarios(usuarios);
    listaUsuariosElemento.appendChild(fragmento);

    configurarBotonEditar(listaUsuariosElemento);
    configurarBotonEliminar(listaUsuariosElemento);
    configurarBotonDeshabilitar(listaUsuariosElemento, usuarios);
}

/**
 * Configura la paginación de usuarios.
 * 
 * @function configurarPaginacion
 * @param {number} paginasTotales - Total de páginas disponibles.
 * @returns {void}
 */
function configurarPaginacion(paginasTotales) {
    const paginacion = document.querySelector('.paginacion');
    paginacion.innerHTML = '';
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

    crearBotonNumeros(paginasTotales, paginacion);

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
 * Crea los botones de paginación numéricos.
 * @function crearBotonNumeros
 * @param {number} paginasTotales - Total de páginas disponibles.
 * @param {HTMLElement} paginacion - Elemento contenedor de la paginación.
 * @returns {void}
 */
function crearBotonNumeros(paginasTotales, paginacion) {
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
}

/**
 * Limpia todos los mensajes de error y quita la clase de error de los inputs.
 */
function limpiarMensajesError() {
    // Borra el texto de todos los <small class="mensajeError">…
    document.querySelectorAll('.mensajeError').forEach(el => {
        el.textContent = '';
    });
    // Quita la clase .inputError de cualquier input que la tuviera
    document.querySelectorAll('.inputError').forEach(input => {
        input.classList.remove('inputError');
    });
}

/**
 * Crea un fragmento de documento con los usuarios.
 * 
 * @function crearListaUsuarios
 * @param {Array<Object>} usuarios - Lista de usuarios a renderizar.
 *  @returns {DocumentFragment} Un fragmento de documento con los usuarios renderizados.
 */
function crearListaUsuarios(usuarios) {
    const fragmento = document.createDocumentFragment();
    usuarios.forEach(usuario => {
        const { id, nombre, tieneDispositivo, dispositivoActivo } = usuario;
        const div = document.createElement('div');
        div.className = 'frame-usuario';

        const dispositivoHabilitado = tieneDispositivo && dispositivoActivo;
        const claseBotonDeshabilitar = dispositivoHabilitado
            ? 'boton-deshabilitar'
            : 'boton-deshabilitar boton-deshabilitado';
        const tituloBoton = dispositivoHabilitado
            ? 'Deshabilitar dispositivo vinculado'
            : 'Sin dispositivo vinculado';

        const botonDeshabilitar = `
            <button class='${claseBotonDeshabilitar}' data-id='${id}' title='${tituloBoton}'>
              <img src='${rutaBase}src/framework/utils/iconos/Deshabilitar.svg' alt='Deshabilitar Dispositivo'/>
            </button>`;

        div.innerHTML = `
            <div class='nombre-usuario'>
                <div class='texto-usuario'>${nombre}</div>
            </div>
                <button class='boton-editar' data-id='${id}'>
                  <img src='${rutaBase}src/framework/utils/iconos/Editar2.svg' alt='Editar'/>
                </button>
                ${botonDeshabilitar}
                <button class='boton-eliminar' data-id='${id}'>
                  <img src='${rutaBase}src/framework/utils/iconos/BasuraBlanca.svg' alt='Eliminar'/>
                </button>
        `;
        fragmento.appendChild(div);
    });
    return fragmento;
}

/**
 * Esta función busca todos los elementos con la clase `.boton-editar` en la lista
 * de usuarios actualmente renderizados (paginados). Al hacer clic en uno de estos
 * botones, se obtiene el `idUsuario` correspondiente desde `usuariosFiltrados`,
 * y se invoca la función `modificarUsuario(id)` para iniciar el proceso de edición.
 * @function configurarBotonEditar
 * @param {HTMLElement} listaDeUsuarios - Elemento contenedor de la lista de usuarios.
 * @returns {void}
 */
function configurarBotonEditar(listaDeUsuarios) {
    listaDeUsuarios.querySelectorAll('.boton-editar').forEach(boton => {
        boton.addEventListener('click', evento => {
            evento.preventDefault();
            mostrarFormularioUsuario(modoFormulario.EDITAR, boton.dataset.id);
        });
    });
}

/**
 * Configura el botón de eliminar usuario para cada usuario en la lista.
 * 
 * @function configurarBotonEliminar
 * @param {HTMLElement} listaDeUsuarios - Elemento contenedor de la lista de usuarios.
 * @returns {void}
 */
function configurarBotonEliminar(listaDeUsuarios) {
    const botonesEliminar = listaDeUsuarios.querySelectorAll('.boton-eliminar');
    botonesEliminar.forEach(boton => {
        boton.addEventListener('click', async evento => {
            evento.preventDefault();
            const id = boton.getAttribute('data-id');
            const respuesta = await mostrarAlertaBorrado('Esta acción no se puede deshacer.', 'Eliminar', 'Cancelar');
            if (respuesta) {
                await eliminarUsuario(id);
                setTimeout(() => {
                    ocultarFormularioUsuario();
                    inicializarModuloGestionUsuarios();
                }, 500);
            }
        });
    });
}

/**
 * Configura el botón de deshabilitar dispositivo para cada usuario.
 * 
 * @function configurarBotonDeshabilitar
 * @param {HTMLElement} listaDeUsuarios - Elemento contenedor de la lista de usuarios.
 * @param {Array<Object>} usuarios - Lista de usuarios a los que se les puede deshabilitar el dispositivo.
 * @returns {void}
 */
function configurarBotonDeshabilitar(listaDeUsuarios, usuarios) {
    const botonesDeshabilitarDispositivo = listaDeUsuarios.querySelectorAll('.boton-deshabilitar');
    botonesDeshabilitarDispositivo.forEach(boton => {
        boton.addEventListener('click', async evento => {
            evento.preventDefault();

            // Si el botón está deshabilitado, no hacer nada
            if (boton.classList.contains('boton-deshabilitado')) {
                return;
            }

            const idUsuario = boton.getAttribute('data-id');
            const usuario = usuarios.find(usuario => usuario.id == idUsuario);

            Swal.fire({
                title: '¿Deshabilitar dispositivo?',
                html: `La aplicación Harvester en el dispositivo vinculado al usuario <strong>${usuario ? usuario.nombre : ''}</strong> será inaccesible.<br><br><strong>SOLO DESHABILITAR EN CASO DE ROBO O PÉRDIDA DEL DISPOSITIVO.</strong>`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#a61930',
                confirmButtonText: 'Deshabilitar',
                cancelButtonText: 'Cancelar'
            }).then(async (resultado) => {
                if (resultado.isConfirmed) {
                    await deshabilitarDispositivoUsuario(idUsuario);
                    setTimeout(() => {
                        inicializarModuloGestionUsuarios();
                    }, 1000);
                }
            });
        });
    });
}





/**
 * Configura validaciones en tiempo real para los campos del formulario de usuarios.
 *
 * @function configurarValidacionesCampos
 * @returns {void}
 */
function configurarValidacionesCampos() {
    const campos = [{
            idInput: 'username',
            idError: 'mensajeErrorNombre',
            validador: validarNombreCampo
        }, {
            idInput: 'email',
            idError: 'mensajeErrorCorreo',
            validador: validarCorreoCampo
        }, {
            idInput: 'password',
            idError: 'mensajeErrorContrasenia',
            validador: validarContraseniaCampo
        }];

    campos.forEach(({ idInput, idError, validador }) => {
        const campoEntrada = document.getElementById(idInput);

        if (!campoEntrada) {
            return;
        }

        let mensajeError = document.getElementById(idError);
        if (!mensajeError) {
            mensajeError = document.createElement('div');
            mensajeError.id = idError;
            mensajeError.className = 'mensajeError';
            campoEntrada.parentNode.insertBefore(mensajeError, campoEntrada.nextSibling);
        }

        campoEntrada.addEventListener('input', () => {
            const valor = campoEntrada.value;
            const valorTrim = valor.trim();

            const respuesta = validador(valor);
            if (respuesta) {
                const mensaje = respuesta.mensaje
                campoEntrada.classList.add('inputError');
                mensajeError.textContent = mensaje;
            } else {
                campoEntrada.classList.remove('inputError');
            }

            if (modoActual === modoFormulario.EDITAR && valorTrim === '') {
                campoEntrada.classList.remove('inputError');
                return;
            }
        });

    });
    validarCoincidenciaContrasenas
}

/**
 * Valida que las contraseñas ingresadas coincidan.
 * 
 * @function validarCoincidenciaContrasenas
 * @returns {void}
 */
function validarCoincidenciaContrasenas() {
    const entradaContrasenia = document.getElementById('password');
    const entradaConfirmarContrasenia = document.getElementById('passwordConfirmar');

    // Verificar si ambos campos existen
    if (!entradaContrasenia || !entradaConfirmarContrasenia) {
        return;
    }

    // Crear o buscar el elemento para el mensaje de error
    const idError = 'mensajeErrorConfirmacion';
    let mensajeError = document.getElementById(idError);
    if (!mensajeError) {
        mensajeError = document.createElement('div');
        mensajeError.id = idError;
        mensajeError.className = 'mensajeError';
        entradaConfirmarContrasenia.parentNode.insertBefore(mensajeError, entradaConfirmarContrasenia.nextSibling);
    }

    // Configurar eventos para validación en tiempo real
    entradaConfirmarContrasenia.addEventListener('input', () => {
        validarCoincidencia(entradaContrasenia, entradaConfirmarContrasenia, mensajeError)
    });

    // También validar cuando cambie la contraseña principal
    entradaContrasenia.addEventListener('input', () => {
        if (entradaConfirmarContrasenia.value.trim() !== '') {
            validarCoincidencia(entradaContrasenia, entradaConfirmarContrasenia, mensajeError)
        }
    });
}

/**
* Valida que la confirmación de contrasea coincida con la contraseña principal y maneja los mensajes de error del campo de entrada.
*
* @returns {void}
*/
function validarCoincidencia(entradaContrasenia, entradaConfirmarContrasenia, mensajeError) {
    const contrasenia = entradaContrasenia.value
    const confirmarContrasenia = entradaConfirmarContrasenia.value
    const respuesta = validarConfirmarContrasenia(confirmarContrasenia, contrasenia)
    if (respuesta) {
        if (modoActual === modoFormulario.EDITAR && confirmarContrasenia === '') {
            entradaConfirmarContrasenia.classList.remove('inputError');
        } else {
            entradaConfirmarContrasenia.classList.add('inputError');
            mensajeError.textContent = respuesta.mensaje
        }
    } else {
        entradaConfirmarContrasenia.classList.remove('inputError');
    }
};

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
    const confirmPasswordInput = document.getElementById('passwordConfirmar');
    const rolInput = document.getElementById('rol');

    // OBTENER LOS VALORES SIN TRIM
    const nombreSinTrim = nombreInput.value;
    const correoSinTrim = correoInput.value;
    const contraseniaSinTrim = contraseniaInput.value;
    const confirmContraseniaSinTrim = confirmPasswordInput ? confirmPasswordInput.value : '';
    const rolSinTrim = rolInput.value;

    let nombre
    let correo
    let contrasenia
    let confirmContrasenia
    let idRolFK;

    if (validacionInicial(nombreSinTrim, correoSinTrim, contraseniaSinTrim, confirmContraseniaSinTrim, rolSinTrim, listaCorreos)) {
        nombre = nombreSinTrim.trim();
        correo = correoSinTrim.trim();
        contrasenia = contraseniaSinTrim.trim();
        confirmContrasenia = confirmContraseniaSinTrim.trim();
        idRolFK = parseInt(rolSinTrim, 10);
    } else {
        return;
    }

    try {
        const resultado = await crearUsuarioCU({ nombre, correo, contrasenia, idRolFK });
        if (resultado.ok) {
            mostrarAlerta('Usuario creado', resultado.mensaje || 'El usuario fue registrado correctamente.', 'success');

            // Limpiar los campos del formulario
            nombreInput.value = '';
            correoInput.value = '';
            contraseniaInput.value = '';
            confirmContrasenia.value = '';
            rolInput.value = '';

            document.getElementById('columna-crear-modificar-usuario').style.display = 'none';

            // Actualizar la vista para mostrar el nuevo usuario en la lista
            setTimeout(() => {
                inicializarModuloGestionUsuarios(); // Recargar la lista de usuarios
            }, 500);
        } else {
            mostrarAlerta('Error al crear usuario', resultado.mensaje || 'No se pudo registrar el usuario.', 'error');
        }
    } catch {
        mostrarAlerta('Error de conexión', 'Hubo un problema al conectar con el servidor.', 'error');
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
            rolesCache = []; // Vacía la caché si no hay roles
            return;
        }

        rolesCache = roles; // Guarda los roles en la variable global
    } catch {
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

    const rolPorDefecto = usuarioAEditar ? usuarioAEditar.rol : null;

    if (!rolesCache || rolesCache.length === 0) {
        selectRol.innerHTML = '<option value="">No hay roles disponibles</option>';
        return;
    }

    // Limpiar el contenido previo del <select>
    selectRol.innerHTML = `
        <option value="" disabled ${rolPorDefecto === null ? 'selected' : ''}>
        Selecciona rol
        </option>
    `;

    // Agregar los roles al <select>
    rolesCache.forEach(rol => {
        const option = document.createElement('option');
        option.value = rol.idRol;
        option.textContent = rol.Nombre;
        if (rol.Nombre === rolPorDefecto) {
            option.selected = true;
        }
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
    }
    return
}

/**
 * Actualiza el texto de un contador dado el input, su contenedor de contador y el maxlength.
 * @param {HTMLInputElement} input
 * @param {HTMLElement} contador
 * @param {number|string} maximoCaracteres
 */
function actualizarContador(input, contador, maximoCaracteres) {
    contador.textContent = `${input.value.length}/${maximoCaracteres} caracteres`;
}

/**
 * Recalcula TODOS los contadores a partir del valor actual de cada input.
 */
function actualizarTodosContadores() {
    document.querySelectorAll('.modificacion input[maxlength]').forEach(input => {
        const maximoCaracteres = input.getAttribute('maxlength');
        const contador = input.parentNode.querySelector('.contador-caracteres');
        if (!contador) return;
        actualizarContador(input, contador, maximoCaracteres);
    });
}

/**
 * Deshabilita el dispositivo de un usuario específico.
 * Llama al backend para deshabilitar el dispositivo del usuario y muestra retroalimentación.
 * @async
 * @function deshabilitarDispositivoUsuario
 * @param {string} idUsuario - ID del usuario cuyo dispositivo se va a deshabilitar
 * @returns {Promise<void>}
 */
async function deshabilitarDispositivoUsuario(idUsuario) {
    try {
        const respuesta = await deshabilitarDispositivo(idUsuario);

        if (respuesta.ok) {
            mostrarAlerta('Dispositivo deshabilitado', respuesta.mensaje || 'El dispositivo del usuario ha sido deshabilitado exitosamente.', 'success');
        } else {
            mostrarAlerta('Error al deshabilitar dispositivo', respuesta.mensaje || 'No se pudo deshabilitar el dispositivo del usuario.', 'error');
        }
    } catch {
        mostrarAlerta('Error de conexión', 'Verifica tu conexión e inténtalo de nuevo.', 'error');
    }
}

inicializarModuloGestionUsuarios()

module.exports = {
    inicializarModuloGestionUsuarios,
};