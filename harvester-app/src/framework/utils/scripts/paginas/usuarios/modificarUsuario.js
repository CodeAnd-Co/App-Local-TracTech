const { modificarUsuario: modificarUsuarioCU } = require(`${rutaBase}src/backend/casosUso/usuarios/modificarUsuario.js`);
const { mostrarAlerta } = require(`${rutaBase}/src/framework/vistas/includes/componentes/moleculas/alertaSwal/alertaSwal`);
const { validacionInicialModificar, validarYLimpiarUsuario } = require(`${rutaBase}src/framework/utils/scripts/paginas/usuarios/validacionesUsuario.js`);
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
    const confirmContraseniaSinTrim = confirmPasswordInput ? confirmPasswordInput.value : '';
    const rolSinTrim = rolInput.value;

    let error;
    let datos;

    if (validacionInicialModificar(nombreSinTrim, correoSinTrim, contraseniaSinTrim, confirmContraseniaSinTrim, rolSinTrim, listaCorreos)) {
        ({ error, datos } = validarYLimpiarUsuario({
                nombre: nombreSinTrim.trim(),
                correo: correoSinTrim.trim(),
                contrasenia: contraseniaSinTrim.trim(),
                idRol: parseInt(rolSinTrim, 10)
            },
            usuarioAEditar,
            roles,
            listaUsuarios))
    } else {
        return false;
    }

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