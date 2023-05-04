
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


// Listar publicaciones

// Listar publicaciones de un usuario

// Subir ficheros

// Devolver archivo multimedia ficheros

// Exportar acciones
module.exports = {
    pruebaPublication,
    save,
    detail,
    remove
}
