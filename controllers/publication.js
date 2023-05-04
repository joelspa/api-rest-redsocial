
const Publication = require("../models/publication");

// Acctiones de prueba
const pruebaPublication = (req, res) => {
    res.status(200).send({
        message: 'Hola mundo desde: constrollers/publication.js'
    });
}

// Guardar publicación

// Sacar una publicación

// Eliminar una publicación

// Listar publicaciones

// Listar publicaciones de un usuario

// Subir ficheros

// Devolver archivo multimedia ficheros

// Exportar acciones
module.exports = {
    pruebaPublication
}
