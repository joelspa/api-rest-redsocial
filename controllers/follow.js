// Importar el modelo de Follow
const Follow = require('../models/follow');
const User = require('../models/user');

// importar servicio
const followservice = require('../services/followService');

// importar depencias
const mongoosePaginate = require('mongoose-pagination');

// Acctiones de prueba
const pruebaFollow = (req, res) => {
    res.status(200).send({
        message: 'Hola mundo desde: controllers/follow.js'
    });
}

// Acccion para seguir a un usuario
const save = (req, res) => {
    // Conseguir datos por body
    const params = req.body;

    // Sacar id del usuario logueado
    const identity = req.user;

    // Crear objeto con modelo de Follow
    let userToFollow = new Follow({
        user: identity.id,
        followed: params.followed
    });

    // Guardar el objeto en la base de datos con mongoose 7.0.0
    userToFollow.save().then(followStored => {
        if (!followStored) {
            return res.status(404).send({
                status: 'error',
                message: 'El seguimiento no se ha guardado'
            });
        }

        return res.status(200).send({
            status: 'success',
            message: 'Metodo de follow',
            identity: req.user,
            follow: followStored
        });
    }).catch(err => {
        return res.status(500).send({
            status: 'error',
            message: 'Error al guardar el seguimiento'
        });
    });

    // Guardar el objeto en la base de datos con venrsiones anteriores a mongoose 7.0.0
    //    userToFollow.save((err, followStored) => {
    //        if (err) {
    //            return res.status(500).send({
    //                status: 'error',
    //                message: 'Error al guardar el seguimiento'
    //            });
    //        }
    //
    //
    //        return res.status(200).send({
    //            status: 'success',
    //            message: 'Metodo de follow',
    //            identity: req.user,
    //            follow: followStored
    //        });
    //    });

}

// Acccion para dejar de seguir a un usuario
const unfollow = (req, res) => {
    // Recoger el id del usuario logueado
    const identity = req.user.id;

    // Recoger el id del usuario que se quiere dejar de seguir
    const followedId = req.params.id;

    // Find de las coincidencias y hacer remove
    Follow.findOneAndDelete({
        user: identity,
        followed: followedId
    }).then(followRemoved => {
        if (!followRemoved) {
            return res.status(404).send({
                status: 'error',
                message: 'no se ha encontrado el follow'
            });
        }
        return res.status(200).send({
            status: 'success',
            message: 'El seguimiento se ha eliminado correctamente',
            follow: followRemoved
        });
    }).catch(err => {
        return res.status(500).send({
            status: 'error',
            message: 'Error al dejar de seguir',
            error: err
        });
    });
}
// Acccion listado de usarios que cualquier usuario esta siguiendo (siguiendo)
const following = (req, res) => {
    // Recoger el id del usuario logueado
    let userId = req.user.id;

    // Comprobar si se esta enviando el id por la url
    if (req.params.id) userId = req.params.id;

    // Comprobar si me llega la pagina, si no me llega la pagina por defecto es 1
    let page = 1;

    if (req.params.page) page = req.params.page;

    // Usuarios por pagina quiero mostrar
    const itemsPerPage = 5;

    // fin a follow, popular datos de los usuarios y paginar con mongoose paginate, mongoose 7.0.0
    Follow.countDocuments({ user: userId })
        .then(count => {
            Follow.find({ user: userId })
                .populate("user followed", "-password -__v -role") // usar - delante de los campos que no quiero que me devuelva
                .paginate(page, itemsPerPage)
                .then(async follows => {
                    {
                        if (!follows) {
                            return res.status(404).send({
                                status: 'error',
                                message: 'No se ha encontrado ningun follow'
                            });
                        }

                        // Sacar un array de los usuarios que estoy siguiendo
                        let followUserIds = await followservice.followUserIds(req.user.id);

                        return res.status(200).send({
                            status: 'success',
                            follows,
                            page,
                            total: count,
                            pages: Math.ceil(count / itemsPerPage),
                            user_following: followUserIds.following,
                            user_follow_me: followUserIds.followers
                        });
                    }
                }
                ).catch(err => {
                    return res.status(500).send({
                        status: 'error',
                        message: 'Error al devolver el follow',
                        error: err
                    });
                });
        }
        ).catch(err => {
            return res.status(500).send({
                status: 'error',
                message: 'Error al devolver el follow',
                error: err
            });
        });
}

// Acccion listado de usuarios que siguen a cualquier otro usuario (seguidores)
const followers = (req, res) => {
    return res.status(200).send({
        status: 'success',
        message: 'Metodo de followers'
    });
}

// Exportar acciones
module.exports = {
    pruebaFollow,
    save,
    unfollow,
    following,
    followers
}

