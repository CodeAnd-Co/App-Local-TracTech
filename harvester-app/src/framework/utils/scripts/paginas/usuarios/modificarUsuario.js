const { modificarUsuario: modificarUsuarioCU } = require(`${rutaBase}src/backend/casosUso/usuarios/modificarUsuario.js`);
const { mostrarAlerta } = require(`${rutaBase}/src/framework/vistas/includes/componentes/moleculas/alertaSwal/alertaSwal`);
const { validarYLimpiarUsuario } = require(`${rutaBase}src/framework/utils/scripts/paginas/usuarios/validacionesUsuario.js`);
//const { inicializarModuloGestionUsuarios } = require(`${rutaBase}/src/framework/utils/scripts/paginas/usuarios/inicializarModuloGestionUsuarios.js`);

/**
 * Envía los datos modificados del usuario al backend y actualiza la vista.
 * Al finalizar—tanto si tuvo éxito como si no—resetea el formulario y el estado
 * de edición para volver al modo de creación de usuario.
 *
 * @async
 * @function modificarUsuario
 * @returns {Promise<void>}
 */
async function modificarUsuario(usuarioAEditar, roles, listaCorreos, listaUsuarios) {
    const nombreInput = document.getElementById('username');
    const correoInput = document.getElementById('email');
    const contraseniaInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('passwordConfirmar');
    const rolInput = document.getElementById('rol');

    const nombreSinTrim = nombreInput.value;
    const correoSinTrim = correoInput.value;
    const contraseniaSinTrim = contraseniaInput.value;
    const confirmarContraseniaSinTrim = confirmPasswordInput.value;
    const rol = rolInput.value;

    const { error, datos } = validarYLimpiarUsuario({
        nombre: nombreSinTrim,
        correo: correoSinTrim,
        contrasenia: contraseniaSinTrim,
        confirmarContrasenia: confirmarContraseniaSinTrim,
        idRol: rol
    },
        usuarioAEditar,
        roles,
        listaUsuarios)

    if (error) {
        mostrarAlerta('Error', error, 'warning');
        return false;
    }

    const { idUsuario, nombre, correo, contrasenia, idRol } = datos;

    try {
        const resultado = await modificarUsuarioCU(idUsuario, nombre, correo, contrasenia, idRol);
        if (resultado.ok) {
            mostrarAlerta('Usuario modificado', resultado.mensaje || 'El usuario fue modificado correctamente.', 'success');

            // Limpiar los campos del formulario
            document.getElementById('username').value = '';
            document.getElementById('username').placeholder = 'Nombre del nuevo usuario';
            document.getElementById('email').value = '';
            document.getElementById('email').placeholder = 'Correo del nuevo contacto';
            document.getElementById('password').value = '';
            document.getElementById('passwordConfirmar').value = '';
            document.getElementById('rol').value = '';

            return true;
        } else {
            mostrarAlerta('Error al modificar usuario', resultado.mensaje || 'No se pudo modificar el usuario.', 'error');
            return false;
        }
    } catch (error) {
        mostrarAlerta('Error de conexión', error.message || 'Hubo un problema al conectar con el servidor.', 'error');
        return false;
    }
}

module.exports = {
    modificarUsuario
};