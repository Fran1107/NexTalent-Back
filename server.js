import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import { corsConfig } from "./src/config/cors.js";
import { connectDB } from "./src/config/db.js";

import authRoutes from "./src/routes/authRoutes.js";
import pasanteRoutes from "./src/routes/pasanteRoutes.js";
import empresaRoutes from "./src/routes/empresaRoutes.js";
import reviewRoutes from "./src/routes/reviewsRoutes.js";

// Configura para las variables de entorno
dotenv.config()

// Conectar a la base de datos
connectDB()

// Inicializa el servidor
const server = express()

// Configuracion para el cors
server.use(corsConfig())
server.use(cookieParser())

// Configuracion para el body parser
server.use(express.json())

// Rutas
server.use("/api/auth", authRoutes)
server.use("/api/pasantes", pasanteRoutes)
server.use("/api/empresas", empresaRoutes)
server.use("/api/resenas", reviewRoutes);


// Ruta de prueba
server.get("/", (req, res) => {
    res.json({ message: "API Nextalent - Conectando talento con oportunidades" });
})


export default server;
