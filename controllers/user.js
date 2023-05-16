// Importar dependencias y modulos
const bcrypt = require("bcrypt");
const mongoosePagination = require("mongoose-pagination");
const fs = require("fs");
const path = require("path");

// Importar modelos
const User = require("../models/user");

// Importar el servicios
const jwt = require("../services/jwt");
const followService = require("../services/followService");

// Acctiones de prueba
const pruebaUser = (req, res) => {
    res.status(200).send({
        message: 'Hola mundo desde: contollers/user.js',
        user: req.user
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

const login = (req, res) => {
    // Recoger parametros de la peticion
    let params = req.body;
    if (!params.email || !params.password) {
        return res.status(400).json({
            status: "error",
            message: "Faltan datos por enviar"
        })
    }
    // Buscar en la db si existe
    User.findOne({ email: params.email })
        .then(async user => {
            if (!user) {
                return res.status(400).json({
                    status: "error",
                    message: "El usuario no existe"
                })
            }
            // Comprobar la contraseña
            let pwd = await bcrypt.compare(params.password, user.password);
            if (!pwd) {
                return res.status(400).json({
                    status: "error",
                    message: "La contraseña no es correcta"
                })
            }
            // Conseguir token
            const token = jwt.createToken(user);
            // Devolver datos de usuario
            return res.status(200).json({
                status: "success",
                message: "Usuario logueado correctamente",
                user: {
                    id: user._id,
                    name: user.name,
                    nick: user.nick
                },
                token
            })
        })

}

const profile = (req, res) => {
    // Recibir el parámetro del id de usuario por la url
    const id = req.params.id;
    // Consulta para sacar los datos del usuario
    User.findById(id)
        .select({ password: 0, role: 0 }) // No mostrar estos campos
        .then(async userProfile => {
            if (!userProfile) {
                return res.status(400).json({
                    status: "error",
                    message: "El usuario no existe"
                })
            }

            // Info de follows
            const followInfo = await followService.followThisUser(req.user.id, id);

            // Devolver resultado
            return res.status(200).json({
                status: "success",
                message: "Usuario encontrado",
                user: userProfile,
                following: followInfo.following,
                follower: followInfo.follower
            })
        });
}

const list = (req, res) => {
    // Controlar en que pagina estamos
    let page = 1;
    if (req.params.page) {
        page = req.params.page;
    }
    page = parseInt(page);
    // Consulta con mongoose paginate 
    let itemsPerPage = 5; // Cantidad de usuarios por pagina
    // ordenar de manera ascendente y paginar usando mongoose 7.0
    User.countDocuments({})
        .then(count => {
            User.find({})
                .select({ password: 0, role: 0, email: 0, __v: 0 }) // No mostrar estos campos
                .sort('_id')
                .paginate(page, itemsPerPage)
                .then(async users => {
                    if (!users) {
                        return res.status(404).json({
                            status: "error",
                            message: "No hay usuarios disponibles",
                        });
                    }

                    // Sacar un array de los usuarios que estoy siguiendo
                    let followUserIds = await followService.followUserIds(req.user.id);

                    return res.status(200).json({
                        status: "success",
                        users,
                        page,
                        itemsPerPage,
                        total: count,
                        pages: Math.ceil(count / itemsPerPage),
                        user_following: followUserIds.following,
                        user_follow_me: followUserIds.followers
                    });
                })
                .catch(err => {
                    return res.status(500).json({
                        status: "error",
                        message: "No se pudieron recuperar los usuarios",
                        err
                    });
                });
        })
        .catch(err => {
            return res.status(500).json({
                status: "error",
                message: "No se pudo contar el número de usuarios",
                err
            });
        });
    //    User.find().sort('_id').paginate(page, itemsPerPage, (err, users, total) => {
    //
    //        if (err || !users) {
    //            return res.status(500).send ({
    //                status: "error",
    //                message: "No hay usuarios disponibles",
    //                err
    //            })
    //        }
    //
    //        // Devolver respuesta (info follow)
    //        return res.status(200).send({
    //            status: "success",
    //            users,
    //            page,
    //            itemsPerPAge,
    //            total,
    //            pages: Math.ceil(total / itemsPerPage)
    //        })
    //    });
}

const update = (req, res) => {
    // Recoger datos del usuario a actualizar
    const userIdentity = req.user;
    let userToUpdate = req.body;
    // Eliminar propiedades innecesarias
    delete userToUpdate.iat;
    delete userToUpdate.exp;
    delete userToUpdate.role;
    delete userToUpdate.image;
    // Comnprpbar si el usuario ya existe
    User.find({
        $or: [
            { email: userToUpdate.email.toLowerCase() },
            { nick: userToUpdate.nick.toLowerCase() }
        ]
    }).then(async users => {
        let userIsset = false;
        users.forEach(user => {
            if (user && user._id != userIdentity.id) {
                userIsset = true;
            }
        });
        // Cifrar la contraseña
        if (userToUpdate.password) {
            let pwd = await bcrypt.hash(userToUpdate.password, 10);
            userToUpdate.password = pwd;
        }
        // Buscar y actualizar
        try { // Manera de hacerlo con async await
            let userUpdated = await User.findByIdAndUpdate({ _id: userIdentity.id }, userToUpdate, { new: true });
            if (!userUpdated) {
                return res.status(404).send({
                    status: "error",
                    message: "Error al actualizar el usuario"
                })
            }
            // Devolver respuesta
            return res.status(200).send({
                status: "success",
                message: "Usuario actualizado correctamente",
                user: userUpdated
            })
        } catch (error) {
            return res.status(500).send({
                status: "error",
                message: "Error al actualizar el usuario"
            })
        }
    })
}

const upload = (req, res) => {
    // Recoger el fichero de la petición y comprobar si existe
    if (!req.file) {
        return res.status(404).send({
            status: "error",
            message: "No se ha subido ningún archivo"
        });
    }
    // Conseguir el nombre del fichero
    let image = req.file.originalname;
    // Conseguir la extensión del fichero
    const imageSplit = image.split("\.");
    const extension = imageSplit[1];
    // Comprobar la extensión, solo imagenes
    if (extension != "png" && extension != "jpg" && extension != "jpeg" && extension != "gif") {
        // Borrar el fichero subido
        const filePath = req.file.path;
        const fileDeleted = fs.unlinkSync(filePath); // Comprobar si existe el fichero
        // Devolver respuesta
        return res.status(400).send({
            status: "error",
            message: "La extensión del archivo no es válida"
        });
    }
    // Si es valido, guardar el fichero en el servidor
    User.findOneAndUpdate({ _id: req.user.id }, { image: req.file.filename }, { new: true })
        .then(userUpdated => {
            if (!userUpdated) {
                return res.status(500).send({
                    status: "error",
                    message: "Error en la subida de imagen de avatar"
                });
            }
            // Devolver respuesta   
            return res.status(200).send({
                status: "success",
                user: userUpdated,
                file: req.file
            });
        })
        .catch(err => {
            return res.status(500).send({
                status: "error",
                message: "Error en la subida de imagen de avatar",
                err
            });
        });
}

const avatar = (req, res) => {
    // Sacar el parametro de la url
    const file = req.params.file;

    // Montar el path real de la imagen
    const filePath = "./uploads/avatars/" + file;

    // Comprobar si el fichero existe
    fs.stat(filePath, (err, exists) => {
        if (!exists) {
            return res.status(404).send({
                status: "error",
                message: "La imagen no existe"
            });
        }
        // Devolver un file
        return res.sendFile(path.resolve(filePath));
    });


}


// Exportar acciones
module.exports = {
    pruebaUser,
    register,
    login,
    profile,
    list,
    update,
    upload,
    avatar
}
