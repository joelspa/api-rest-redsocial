
// Acctiones de prueba
const pruebaUser = (req, res) => {
    res.status(200).send({
        message: 'Hola mundo desde: contollers/user.js'
    });
}

// Exportar acciones
module.exports = {
    pruebaUser
}
