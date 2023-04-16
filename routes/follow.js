const express = require('express');
const router = express.Router();
const followController = require("../controllers/follow");
const check = require("../middlewares/auth");

// Definir rutas
router.get("/prueba-follow", followController.pruebaFollow);
router.post("/save", check.auth, followController.save); 

// Exportar router
module.exports = router;