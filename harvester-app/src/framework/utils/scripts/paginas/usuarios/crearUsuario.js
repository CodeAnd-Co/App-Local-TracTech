const { crearUsuario: crearUsuarioCU } = require(`${rutaBase}src/backend/casosUso/usuarios/crearUsuario`);
const { mostrarAlerta } = require(`${rutaBase}/src/framework/vistas/includes/componentes/moleculas/alertaSwal/alertaSwal`);
const { validarCrearUsuario } = require(`${rutaBase}src/framework/utils/scripts/paginas/usuarios/validacionesUsuario.js`);

/**
 * Crea un nuevo usuario en el sistema.
 * Captura los datos del formulario, valida los campos, 
 * realiza la petición al backend mediante crearUsuarioCU y muestra retroalimentación.
 * @async
 * @function crearUsuario
 * @param {Array<String>} listaCorreos 
 * @returns {Promise<void>}
 */
async function crearUsuario(listaCorreos) {
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

    let nombre
    let correo
    let contrasenia
    let confirmContrasenia
    let idRolFK;
    
    const datosUsuario = {
        nombre: nombreSinTrim,
        correo: correoSinTrim,
        contrasenia: contraseniaSinTrim,
        confirmarContrasenia: confirmContraseniaSinTrim,
        idRol:rolSinTrim
    }
    if (validarCrearUsuario(datosUsuario, listaCorreos)) {
        nombre = nombreSinTrim.trim();
        correo = correoSinTrim.trim();
        contrasenia = contraseniaSinTrim.trim();
        confirmContrasenia = confirmContraseniaSinTrim.trim();
        idRolFK = parseInt(rolSinTrim, 10);
    } else {
        return false
    }

    try {
        const resultado = await crearUsuarioCU({ nombre, correo, contrasenia, idRolFK });
        if (resultado.ok) {
            mostrarAlerta('Usuario creado', resultado.mensaje || 'El usuario fue registrado correctamente.', 'success');

            nombreInput.value = '';
            correoInput.value = '';
            contraseniaInput.value = '';
            confirmContrasenia.value = '';
            rolInput.value = '';

            document.getElementById('columna-crear-modificar-usuario').style.display = 'none';

            return true
        } else {
            mostrarAlerta('Error al crear usuario', resultado.mensaje || 'No se pudo registrar el usuario.', 'error');
            return false
        }
    } catch {
        mostrarAlerta('Error de conexión', 'Hubo un problema al conectar con el servidor.', 'error');
        return false
    }
}

module.exports = {
    crearUsuario
}