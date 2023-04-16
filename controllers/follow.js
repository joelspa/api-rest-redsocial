// Importar el modelo de Follow
const Follow = require('../models/follow');
const User = require('../models/user');


// Acctiones de prueba
const pruebaFollow = (req, res) => {
    res.status(200).send({
        message: 'Hola mundo desde: controllers/follow.js'
    });
}

// Acccion para seguir a un usuario
const save = (req, res) => {
    // Conseguir datos por body

    // Sacar id del usuario logueado

    // Crear objeto con modelo de Follow

    // Guardar el objeto en la base de datos


    return res.status(200).send({
        status: 'success',
        message: 'Metodo de follow',
        identity: req.user
    });
}

// Acccion para dejar de seguir a un usuario

// Acccion para obtener los usuarios que sigo

// Acccion para obtener los usuarios que me siguen


// Exportar acciones
module.exports = {
    pruebaFollow,
    save
}
