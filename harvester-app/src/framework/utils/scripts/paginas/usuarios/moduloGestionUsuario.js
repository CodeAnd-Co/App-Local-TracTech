// RF40 Administrador consulta usuarios - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF40
// RF41 Administrador modifica usuario - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF41
// RF43 Administrador elimina usuario - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF43
// RF41 Administrador consulta usuario - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF41 
// RF39 Administrador crea usuario - https://codeandco-wiki.netlify.app/docs/proyectos/tractores/documentacion/requisitos/RF39

const { modificarUsuario } = require(`${rutaBase}src/backend/casosUso/usuarios/modificarUsuario.js`);
const { crearUsuario: crearUsuarioCU } = require(`${rutaBase}src/backend/casosUso/usuarios/crearUsuario`);
const { obtenerUsuarios } = require(`${rutaBase}src/backend/casosUso/usuarios/consultarUsuarios.js`);
const { eliminarUsuario: eliminarUsuarioCU } = require(`${rutaBase}src/backend/casosUso/usuarios/eliminarUsuario`);
const { consultarRoles: consultarRolesCU } = require(`${rutaBase}src/backend/casosUso/usuarios/consultarRoles.js`);
const { deshabilitarDispositivo } = require(`${rutaBase}src/backend/casosUso/dispositivos/deshabilitarDispositivo.js`);
const { validarNombreCampo, validarCorreoCampo, validarContraseniaCampo, validarRolCampo } = require(`${rutaBase}src/framework/utils/scripts/paginas/usuarios/validacionesUsuario.js`);

const { mostrarAlerta, mostrarAlertaBorrado } = require(`${rutaBase}/src/framework/vistas/includes/componentes/moleculas/alertaSwal/alertaSwal`);
const Swal = require(`${rutaBase}/node_modules/sweetalert2/dist/sweetalert2.all.min.js`);

const validator = require(`${rutaBase}/node_modules/validator/validator.min.js`);

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

    const columnaCrear = document.getElementById('columna-crear-modificar-usuario');

    try {
        // Limpiar la lista de usuarios y los filtros
        listaUsuarios = [];
        usuariosFiltrados = [];

        // Limpiar el campo de búsqueda
        document.getElementById('buscar-usuario').value = '';

        // Cargar usuarios
        const usuarios = await obtenerUsuarios();
        listaUsuarios = usuarios?.obtenerUsuarios() ?? [];

        // No mostrar el usuario que consulta la lista
        const usuarioActual = localStorage.getItem('nombreUsuario');
        listaUsuarios = listaUsuarios.filter(usuario => usuario.nombre !== usuarioActual.trim());

        // Cargar usuarios filtrados
        usuariosFiltrados = [...listaUsuarios];
        cargarPagina(1);

        configurarValidacionesCampos();
        configurarContadoresCampos();
        
    } catch {
        mostrarAlerta('Error al cargar usuarios', 'Verifica tu conexión e inténtalo de nuevo.', 'error');
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
        document.getElementById('passwordConfirmar').value = '';
        document.getElementById('rol').value = '';

        actualizarTodosContadores();
        limpiarMensajesError();

        columnaCrear.style.display = 'block';
        cargarRoles(); // Cargar roles al abrir el formulario
        listaCorreos = listaUsuarios.map(usuario => usuario.correo);  // Guardar todos los correos en la variable global
    });

    const botonCancelar = document.querySelector('.btn-cancelar');
    // Eliminar event listeners anteriores y agregar uno nuevo
    const nuevoBotonCancelar = botonCancelar.cloneNode(true);
    botonCancelar.parentNode.replaceChild(nuevoBotonCancelar, botonCancelar);
    nuevoBotonCancelar.addEventListener('click', evento => {
        evento.preventDefault();
        actualizarTodosContadores();
        limpiarMensajesError();
        columnaCrear.style.display = 'none';
    });

    // Eliminar event listeners anteriores y agregar uno nuevo al botón guardar
    const botonGuardar = document.querySelector('.btn-guardar');
    const nuevoBotonGuardar = botonGuardar.cloneNode(true);
    botonGuardar.parentNode.replaceChild(nuevoBotonGuardar, botonGuardar);
    nuevoBotonGuardar.addEventListener('click', async evento => {
        evento.preventDefault();
        actualizarTodosContadores();
        limpiarMensajesError();
        if (modoActual === modoFormulario.CREAR) {
            // Deshabilitar el botón para evitar múltiples envíos
            nuevoBotonGuardar.disabled = true;
            await crearUsuario();
            // Volver a habilitar el botón después de que termine el proceso
            nuevoBotonGuardar.disabled = false;
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

    // Configurar el botón de ver contraseña
    verContrasenia();
    validarCoincidenciaContrasenas();
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

function verContrasenia() {
    const botonVerContrasenia = document.querySelector('#verContrasenia');
    const inputContrasenia = document.querySelector('#password');
    const inputConfirmarContrasenia = document.querySelector('#passwordConfirmar');

    // Función para alternar entre mostrar/ocultar contraseña
    if (botonVerContrasenia && inputContrasenia) {
        botonVerContrasenia.addEventListener('change', () => {
            // Cambia el tipo de los inputs según el estado del checkbox
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
        
        const botonDeshabilitar =  `
                <button class='boton-deshabilitar' data-id='${id}'>
                  <img src='${rutaBase}src/framework/utils/iconos/Deshabilitar.svg' alt='Deshabilitar Dispositivo'/>
                </button>` ;
        
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
            const respuesta = await mostrarAlertaBorrado('Esta acción no se puede deshacer.', 'Eliminar', 'Cancelar');
            if (respuesta) {
                await eliminarUsuario(id); // Ahora puedes usar await aquí
                setTimeout(() => {
                    inicializarModuloGestionUsuarios(); // Recargar la lista de usuarios
                }, 500);
            }
        });
    });

    // Añadir eventos a los botones de deshabilitar dispositivo
    const botonesDeshabilitarDispositivo = listaUsuariosElemento.querySelectorAll('.boton-deshabilitar');
    botonesDeshabilitarDispositivo.forEach(boton => {
        boton.addEventListener('click', async evento => {
            evento.preventDefault();
            const idUsuario = boton.getAttribute('data-id');

            Swal.fire({
                title: '¿Deshabilitar dispositivo?',
                html: `La aplicación Harvester en el dispositivo vinculado al usuario será inaccesible.<br><br><strong>SOLO DESHABILITAR EN CASO DE ROBO O PÉRDIDA DEL DISPOSITIVO.</strong>`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#a61930',
                confirmButtonText: 'Deshabilitar',
                cancelButtonText: 'Cancelar'
            }).then(async (resultado) => {
                if (resultado.isConfirmed) {
                    await deshabilitarDispositivoUsuario(idUsuario);
                }
            });
        });
    });
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
            actualizarTodosContadores();
            limpiarMensajesError();
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
    document.getElementById('passwordConfirmar').value = '';
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
    // Verificar si hay mensajes de error visibles en el formulario
    const mensajesError = document.querySelectorAll('.mensajeError');
    let hayErroresVisibles = false;

    mensajesError.forEach(mensaje => {
        if (mensaje.textContent.trim() !== '') {
            hayErroresVisibles = true;
        }
    });

    if (hayErroresVisibles) {
        mostrarAlerta('Formulario con errores', 'Por favor, corrige los errores señalados en el formulario antes de continuar.', 'warning');
    }

    const nombreIngresado = document.getElementById('username').value.trim();
    const correoIngresado = document.getElementById('email').value.trim();
    const contraseniaIngresada = document.getElementById('password').value.trim();
    const contraseniaConfirmada = document.getElementById('passwordConfirmar').value.trim();
    const rolIngresado = document.getElementById('rol').value.trim();

    // Verificar que las contraseñas coincidan si se está cambiando la contraseña
    if (contraseniaIngresada !== '') {
        if (contraseniaIngresada !== contraseniaConfirmada) {
            mostrarAlerta('Las contraseñas no coinciden', 'Por favor, asegúrate de que la contraseña y su confirmación sean iguales.', 'warning');
            return;
        }
    }

    // Llamar a la función de validación
    const { error, datos } = validarYLimpiarUsuario({
        nombre: nombreIngresado,
        correo: correoIngresado,
        contrasenia: contraseniaIngresada,
        idRol: Number(rolIngresado),
    });

    if (error) {
        mostrarAlerta('Error', error, 'warning');
    }

    const { idUsuario, nombre, correo, contrasenia, idRol } = datos;

    try {
        const resultado = await modificarUsuario(idUsuario, nombre, correo, contrasenia, idRol);
        if (resultado.ok) {
            mostrarAlerta('Usuario modificado', resultado.mensaje || 'El usuario fue modificado correctamente.', 'success');

            // Limpiar los campos del formulario
            document.getElementById('username').value = '';
            document.getElementById('email').value = '';
            document.getElementById('password').value = '';
            document.getElementById('passwordConfirmar').value = '';
            document.getElementById('rol').value = '';

            // Recargar la lista de usuarios
            setTimeout(() => {
                inicializarModuloGestionUsuarios();
            }, 500);

            // Ocultar el formulario tras una modificación exitosa
            document.getElementById('columna-crear-modificar-usuario').style.display = 'none';
        } else {
            mostrarAlerta('Error al modificar usuario', resultado.mensaje || 'No se pudo modificar el usuario.', 'error');
        }
    } catch (error) {
        mostrarAlerta('Error de conexión', error.message || 'Hubo un problema al conectar con el servidor.', 'error');
    }
}

/**
 * Valida y sanea los datos para la edición de un usuario en el front-end.
 * Reproduce las mismas validaciones que el back-end y devuelve los valores listos para enviar.
 *
 * @param {Object} params - Parámetros de validación.
 * @param {string} params.nombre - Nuevo nombre ingresado por el usuario.
 * @param {string} params.correo - Nuevo correo ingresado por el usuario.
 * @param {string} params.contrasenia - Nueva contraseña ingresada por el usuario.
 * @param {number|null} params.idRol - Nuevo ID de rol ingresado, o null si no se modificó.
 * @returns {{ error: string|null, datos: Object|null }}
 */
function validarYLimpiarUsuario({ nombre, correo, contrasenia, idRol }) {

    const idRolUsuarioAEditar = rolesCache.find(rol => rol.Nombre === usuarioAEditar.rol)?.idRol

    // TODO: Utilizar estructuras de control en lugar de operadores ternarios
    // Flags de “campo modificado”
    const cambioNombre = nombre !== '' && nombre !== usuarioAEditar.nombre;
    const cambioCorreo = correo !== '' && correo !== usuarioAEditar.correo;
    const cambioContrasenia = contrasenia !== '';
    const cambioRol = idRol !== null && idRol !== idRolUsuarioAEditar

    // Validar que haya cambiado mínimo un campo
    if (!(cambioNombre || cambioCorreo || cambioContrasenia || cambioRol)) {
        return { error: 'Debes modificar al menos un campo del usuario.', datos: null };
    }

    const datos = { idUsuario: usuarioAEditar.id };

    // Validar nombre
    if (cambioNombre) {
        const error = validarNombreCampo(nombre);
        if (error) {
            return { error, datos: null };
        }
        datos.nombre = validator.escape(nombre.trim());
    } else {
        datos.nombre = usuarioAEditar.nombre;
    }

    // Validar correo
    if (cambioCorreo) {
        const error = validarCorreoCampo(correo);
        if (error) {
            return { error, datos: null };
        }
        const correoNormalizado = validator.normalizeEmail(correo.trim())
        const correoYaExiste = listaUsuarios.some(usuario =>
            usuario.correo === correoNormalizado && usuario.id !== usuarioAEditar.id);
        if (correoYaExiste) {
            return { error: 'No se puede repetir el correo entre usuarios.', datos: null };
        }
        datos.correo = correoNormalizado;
    } else {
        datos.correo = usuarioAEditar.correo;
    }

    // Validar contraseña
    if (cambioContrasenia) {
        const error = validarContraseniaCampo(contrasenia);
        if (error) {
            return { error, datos: null };
        }
        datos.contrasenia = contrasenia.trim();
    } else {
        datos.contrasenia = contrasenia;
    }

    // Validar rol
    if (cambioRol) {
        const error = validarRolCampo(idRol);
        if (error) {
            return { error, datos: null };
        }
        datos.idRol = idRol;
    } else {
        datos.idRol = idRolUsuarioAEditar;
    }

    return { error: null, datos };
}

/**
 * Configura validaciones en tiempo real para los campos del formulario de usuarios.
 *
 * @function configurarValidacionesCampos
 * @returns {void}
 */
function configurarValidacionesCampos() {
    // Mapeo de campos a validar:
    const campos = [
        {
            idInput: 'username',
            idError: 'mensajeErrorNombre',
            validador: validarNombreCampo
        },
        {
            idInput: 'email',
            idError: 'mensajeErrorCorreo',
            validador: validarCorreoCampo
        },
        {
            idInput: 'password',
            idError: 'mensajeErrorContrasenia',
            validador: validarContraseniaCampo
        }
    ];

    campos.forEach(({ idInput, idError, validador, evento = 'input' }) => {
        const campoEntrada = document.getElementById(idInput);

        // Verificar si el campo existe
        if (!campoEntrada) {
            return;
        }

        // Buscar elemento de error o crear uno si no existe
        let mensajeError = document.getElementById(idError);
        if (!mensajeError) {
            // Crear elemento para mostrar errores si no existe
            mensajeError = document.createElement('div');
            mensajeError.id = idError;
            mensajeError.className = 'mensajeError';
            // Insertar después del campo
            campoEntrada.parentNode.insertBefore(mensajeError, campoEntrada.nextSibling);
        }

        // Configurar el evento para validación en tiempo real
        campoEntrada.addEventListener(evento, () => {
            const valor = campoEntrada.value;

            if (valor.trim() === '') {
                campoEntrada.classList.add('inputError');
                mensajeError.textContent = 'El campo no puede estar vacío';
                return;
            }

            // Validar el campo
            const mensaje = validador(valor);

            if (mensaje) {
                campoEntrada.classList.add('inputError');
                mensajeError.textContent = mensaje;
            } else {
                campoEntrada.classList.remove('inputError');
                mensajeError.textContent = '';
            }
        });
    });
}

/**
 * Valida que las contraseñas ingresadas coincidan.
 * 
 * @function validarCoincidenciaContrasenas
 * @returns {void}
 */
function validarCoincidenciaContrasenas() {
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('passwordConfirmar');

    // Verificar si ambos campos existen
    if (!passwordInput || !confirmPasswordInput) {
        return;
    }

    // Crear o buscar el elemento para el mensaje de error
    const idError = 'mensajeErrorConfirmacion';
    let mensajeError = document.getElementById(idError);
    if (!mensajeError) {
        mensajeError = document.createElement('div');
        mensajeError.id = idError;
        mensajeError.className = 'mensajeError';
        confirmPasswordInput.parentNode.insertBefore(mensajeError, confirmPasswordInput.nextSibling);
    }

    // Función para validar la coincidencia
    const validarCoincidencia = () => {
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        // Si el campo de confirmación está vacío, no mostrar error
        if (confirmPassword.trim() === '') {
            confirmPasswordInput.classList.add('inputError');
            mensajeError.textContent = 'El campo no puede estar vacío';
            return;
        }

        // Validar coincidencia
        if (password !== confirmPassword) {
            confirmPasswordInput.classList.add('inputError');
            mensajeError.textContent = 'Las contraseñas no coinciden';
        } else {
            confirmPasswordInput.classList.remove('inputError');
            mensajeError.textContent = '';
        }
    };

    // Configurar eventos para validación en tiempo real
    confirmPasswordInput.addEventListener('input', validarCoincidencia);

    // También validar cuando cambie la contraseña principal
    passwordInput.addEventListener('input', () => {
        if (confirmPasswordInput.value.trim() !== '') {
            validarCoincidencia();
        }
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
    const confirmPasswordInput = document.getElementById('passwordConfirmar');
    const rolInput = document.getElementById('rol');

    const nombre = nombreInput.value.trim();
    const correo = correoInput.value.trim();
    const contrasenia = contraseniaInput.value.trim();
    const confirmContrasenia = confirmPasswordInput ? confirmPasswordInput.value.trim() : '';
    const idRolFK = parseInt(rolInput.value, 10);

    // Verificar si hay mensajes de error visibles en el formulario
    const mensajesError = document.querySelectorAll('.mensajeError');
    let hayErroresVisibles = false;

    mensajesError.forEach(mensaje => {
        if (mensaje.textContent.trim() !== '') {
            hayErroresVisibles = true;
        }
    });

    if (hayErroresVisibles) {
        mostrarAlerta('Formulario con errores', 'Por favor, corrige los errores señalados en el formulario antes de continuar.', 'warning');
        return;
    }

    // Verificar si las contraseñas coinciden (si existe el campo de confirmación)
    if (confirmPasswordInput && contrasenia !== confirmContrasenia) {
        mostrarAlerta('Las contraseñas no coinciden', 'Por favor, asegúrate de que la contraseña y su confirmación sean iguales.', 'warning');
        return;
    }

    // Verificar campos obligatorios
    if (!nombre || !correo || !contrasenia || !confirmContrasenia || isNaN(idRolFK)) {
        mostrarAlerta('Datos incompletos', 'Por favor, completa todos los campos.', 'warning');
        return;
    }


    if (listaCorreos.some(correoExistente => correoExistente && correoExistente.toLowerCase() === correo.toLowerCase())) {
        mostrarAlerta('Correo ya registrado', 'El correo ingresado ya existe. Por favor, usa otro correo.', 'error');;
        return;
    }

    if (nombre.length > 45) {
        mostrarAlerta('Nombre demasiado largo', 'El nombre no puede tener más de 45 caracteres.', 'error');
        return;
    }

    if (correo.length > 50) {
        mostrarAlerta('Correo demasiado largo', 'El correo no puede tener más de 50 caracteres.', 'error');
        return
    }


    if (contrasenia.length < 8) {
        mostrarAlerta('Contraseña demasiado corta', 'La contraseña debe de tener más de 8 caracteres.', 'error');
        return
    }

    if (contrasenia.length > 512) {
        mostrarAlerta('Contraseña demasiado larga', 'La contraseña no puede tener más de 512 caracteres.', 'error');
        return
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

// Expone la función de inicialización al objeto window
inicializarModuloGestionUsuarios()