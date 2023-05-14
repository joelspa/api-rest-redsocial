
const publication = require("../models/publication");
const Publication = require("../models/publication");
const { param } = require("../routes/publication");

// Acctiones de prueba
const pruebaPublication = (req, res) => {
    res.status(200).send({
        message: 'Hola mundo desde: constrollers/publication.js'
    });
}

// Guardar publicación
const save = (req, res) => {
    // Recoger datos del body
    const params = req.body;
    // Si no me llegan dar respuesa negativa
    if (!params.text) {
        return res.status(400).send({
            status: "error",
            message: "Debes enviar un texto"
        });
    }
    //Crear y rellenar el objeto del modelo
    let newPublication = new Publication(params);
    newPublication.user = req.user.id;

    // Guardar objeto en la base de datos
    newPublication.save()
        .then((publicationStored) => {
            // Devolver respuesta positiva
            return res.status(200).send({
                status: "success",
                message: "Guardado correctamente",
                publication: publicationStored
            });
        })
        .catch((err) => {
            // Devolver respuesta negativa
            return res.status(500).send({
                status: "error",
                message: "Error al guardar la publicación",
                error: err
            });
        });
}

// Sacar una publicación
const detail = (req, res) => {
    // Recoger el id de la publicación
    const publicationId = req.params.id;

    // Buscar la publicación por el id
    Publication.findById(publicationId)
        .then((publication) => {
            // Si no existe devolver error
            if (!publication) {
                return res.status(404).send({
                    status: "error",
                    message: "No existe la publicación"
                });
            }
            // Si existe devolver la publicación
            return res.status(200).send({
                status: "success",
                message: "Publicación encontrada",
                publication
            });
        })
        .catch((err) => {
            // Devolver respuesta negativa
            return res.status(500).send({
                status: "error",
                message: "Error al buscar la publicación",
                error: err
            });
        });
}

// Eliminar una publicación
const remove = (req, res) => {
    // Recoger el id de la publicación
    const publicationId = req.params.id;
    // Buscar la publicación por el id
    publication.findById({ user: req.user.id, _id: publicationId })
        .then((publication) => {
            // Si no existe devolver error
            if (!publication) {
                return res.status(404).send({
                    status: "error",
                    message: "No existe la publicación"
                });
            }
            // Si existe borrarla
            publication.deleteOne()
                .then(() => {
                    // Devolver respuesta positiva
                    return res.status(200).send({
                        status: "success",
                        message: "Publicación eliminada",
                        publication: publicationId
                    });
                })
                .catch((err) => {
                    // Devolver respuesta negativa
                    return res.status(500).send({
                        status: "error",
                        message: "Error al eliminar la publicación",
                        error: err
                    });
                });
        })
}


// Listar publicaciones de un usuario
const user = (req, res) => {
    // Sacar el id del usuario
    let userId = req.params.id;

    // Constrolar el paginado
    let page = 1;

    if (req.params.page) page = req.params.page;

    const itemsPerPage = 5;

    //Find, populate, ordenar, paginar
    Publication.find({ user: userId })
        .sort("-created_at")
        .populate("user", "name surname image _id")
        .paginate(page, itemsPerPage)
        .then((publications) => {
            // Si no existe devolver error
            if (!publications) {
                return res.status(404).send({
                    status: "error",
                    message: "No existe la publicación"
                });
            }

            if (publications.length == 0) {
                return res.status(404).send({
                    status: "error",
                    message: "No hay publicaciones"
                });
            }

            // Si existe devolver la publicación
            return res.status(200).send({
                status: "success",
                message: "Publicación encontrada",
                publications,
                total_items: publications.totalDocs,
                total_pages: publications.totalPages
            });
        })
        .catch((err) => {
            // Devolver respuesta negativa
            return res.status(500).send({
                status: "error",
                message: "Error al buscar la publicación",
                error: err
            });
        });

    //    // Devolver resultado (publicaciones, total de publicaciones, total de páginas)
    //    return res.status(200).send({
    //        status: "success",
    //        message: "Listado de publicaciones de un usuario",
    //        user: req.user
    //    });
}

// Subir ficheros
const upload = (req, res) => {
    // Sacar publicationId de la url
    const publicationId = req.params.id;

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
    Publication.findOneAndUpdate({ "user": req.user.id, "_id": publicationId }, { file: req.file.filename }, { new: true })
        .then(publicationUpdated => {
            if (!publicationUpdated) {
                return res.status(500).send({
                    status: "error",
                    message: "Error al subir el fichero"
                });
            }
            // Devolver respuesta   
            return res.status(200).send({
                status: "success",
                user: publicationUpdated,
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

// Devolver archivo multimedia ficheros

// Exportar acciones
module.exports = {
    pruebaPublication,
    save,
    detail,
    remove,
    user,
    upload
}
