// Importar el modelo de usuario
const bcrypt = require("bcrypt");
const User = require("../models/user");

// Acctiones de prueba
const pruebaUser = (req, res) => {
    res.status(200).send({
        message: 'Hola mundo desde: contollers/user.js'
    });
}

// Registro de usuarios
const register = (req, res) => {
    // Recoger parametros de la peticion
    let params = req.body;

    // Comprobar que llegan todos los datos + validacion
    if (!params.name || !params.email || !params.password || !params.nick) {
        return res.status(400).json({
            status: "error",
            message: "Faltan datos por enviar"
        })
    }

    //Controlar usuarios duplicados
    User.find({ $or: [{ email: params.email.toLowerCase() }, { nick: params.nick.toLowerCase() }] })
        .then(async users => {
            if (users && users.length >= 1) {
                return res.status(400).json({
                    status: "error",
                    message: "El usuario que intentas registrar ya existe"
                })
            }
            // Cifrar la contraseña
            let pwd = await bcrypt.hash(params.password, 10);
            params.password = pwd;

            // Crear objeto de usuario
            let user_to_save = new User(params);

            // Guardar usuario en la base de datos
            user_to_save.save().then((userStored) => {
                if (!userStored) {
                    return res.status(400).json({
                        status: "error",
                        message: "El usuario no se ha guardado"
                    })
                }
                // Devolver respuesta
                return res.status(200).json({
                    status: "success",
                    message: "Usuario registrado correctamente",
                    user: userStored
                })
            })
        })
}

// Exportar acciones
module.exports = {
    pruebaUser,
    register
}
