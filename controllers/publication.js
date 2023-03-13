
// Acctiones de prueba
const pruebaPublication = (req, res) => {
    res.status(200).send({
        message: 'Hola mundo desde: constrollers/publication.js'
    });
}

// Exportar acciones
module.exports = {
    pruebaPublication
}
