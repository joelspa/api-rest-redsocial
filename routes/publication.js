const express = require('express');
const router = express.Router();
const publicationController = require("../controllers/publication");
const chek = require("../middlewares/auth");

// Definir rutas
router.get("/prueba-publication", publicationController.pruebaPublication);
router.post("/save", chek.auth, publicationController.save);
router.get("/detail/:id", chek.auth, publicationController.detail);
router.delete("/delete/:id", chek.auth, publicationController.remove);
router.get("/user/:id/:page?", chek.auth, publicationController.user);

// Exportar router
module.exports = router;