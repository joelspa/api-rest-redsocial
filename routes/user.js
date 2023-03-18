const express = require('express');
const router = express.Router();
const userController = require("../controllers/user");
const check = require("../middlewares/auth");

// Definir rutas
router.get("/prueba-user", check.auth, userController.pruebaUser);
router.post("/register", userController.register);
router.post("/login", userController.login);
router.get("/profile/:id", check.auth, userController.profile);

// Exportar router
module.exports = router;