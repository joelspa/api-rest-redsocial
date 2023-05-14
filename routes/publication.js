const express = require('express');
const router = express.Router();
const publicationController = require("../controllers/publication");
const chek = require("../middlewares/auth");
const multer = require("multer");
// Configuracion de multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads/publications/")
    },
    filename: (req, file, cb) => {
        cb(null, "pub-" + Date.now() + "-" + file.originalname);
    }
});

const uploads = multer({ storage }); // middleware de multer

// Definir rutas
router.get("/prueba-publication", publicationController.pruebaPublication);
router.post("/save", chek.auth, publicationController.save);
router.get("/detail/:id", chek.auth, publicationController.detail);
router.delete("/delete/:id", chek.auth, publicationController.remove);
router.get("/user/:id/:page?", chek.auth, publicationController.user);
router.post("/upload/:id", [chek.auth, uploads.single("file0")], publicationController.upload);

// Exportar router
module.exports = router;