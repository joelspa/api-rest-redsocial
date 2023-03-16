// Importar dependencias
const connection = require('./database/connection');
const express = require("express");
const cors = require("cors");

// Mensaje bienvenida
console.log("API REST - Mi Red Social arrancada")

// Conexion a bbdd
connection();

// Crear servidor node
const app = express();
const puerto = 3900;

// Congfigurar cors
app.use(cors());

// Convertir los datos del body a objetos json
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cargar conf rutas
const UserRoutes = require("./routes/user");
const FollowRoutes = require("./routes/follow");
const PublicationRoutes = require("./routes/publication");

app.use("/api/user", UserRoutes);
app.use("/api/follow", FollowRoutes);
app.use("/api/publication", PublicationRoutes);

// Ruta de prueba
app.get("/ruta-prueba", (req, res) => {
    return res.status(200).json(
        {
            "id": 1,
            "nombre": "Ruta de prueba",
            "mensaje": "Bienvenido a mi red social"
        }
    );

})

// Poner servidor a escuchar peticiones http
app.listen(puerto, () => {
    console.log("Servidor de NodeJS corriendo en el puerto " + puerto)
});