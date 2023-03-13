
// Acctiones de prueba
const pruebaFollow = (req, res) => {
    res.status(200).send({
        message: 'Hola mundo desde: controllers/follow.js'
    });
}

// Exportar acciones
module.exports = {
    pruebaFollow
}
