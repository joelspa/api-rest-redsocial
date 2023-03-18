// Importar dependencias
const jwt = require("jwt-simple");
const moment = require("moment");

// Clave secreta para codificar y decodificar el token
const secret = "CLAVE_SECRETA_del_proyecto_987987";

// Crear una funcion para generar tokens
const createToken = (user) => { 
    const payload = {
        id: user._id,
        name: user.name,
        surname: user.surname,
        nick: user.nick,
        email: user.email,
        role: user.role,
        image: user.image,
        iat: moment().unix(), // Fecha de creacion del token
        exp: moment().add(30, "days").unix() // Fecha de expiracion del token
    };

    // Devolver jwt token codificado
    return jwt.encode(payload, secret);
}

module.exports = {
    secret,
    createToken
}