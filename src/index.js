import express from "express";
import { PORT } from "./config.js";

import otrosRoutes from "./routes/otros.routes.js";
import mantenimientoRoutes from "./routes/mantenimiento.routes.js";
import infraestructuraRoutes from "./routes/infraestructura.routes.js";
import grupoRoutes from "./routes/grupos.routes.js";
import encargadoRoutes from "./routes/encargado.routes.js";
import usersRoutes from "./routes/users.routes.js";
import usuarioRoutes from "./routes/usuario.routes.js";
import tipoRoutes from "./routes/tipo.routes.js";
import authRoutes from "./routes/auth.routes.js";
import calendarioRoutes from "./routes/calendario.routes.js";
import directorRoutes from "./routes/director.routes.js";
import paraleloRoutes from "./routes/paralelo.routes.js";
import materiaRoutes from "./routes/materias.routes.js";
import calificacionRoutes from "./routes/calificaciones.routes.js";
import boletinRoutes from "./routes/boletines.routes.js";
import teacherRoutes from "./routes/profesor.routes.js";
import estudiantesRoutes from "./routes/estudiantes.routes.js";
import horariosRoutes from "./routes/horarios.routes.js";
import vistaProfRoutes from "./routes/vistaprofesores.routes.js";
import blockchainRoutes from "./routes/blockchain.routes.js";

import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";

dotenv.config();

const app = express();

app.use(morgan("dev"));

// 🚀 CONFIGURACIÓN CLAVE PARA SOPORTAR IMÁGENES EN BASE64 GRANDES (Evita el Error 413)
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Configuración limpia y unificada de CORS (Permite peticiones concurrentes rápidas desde Vite)
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// ----------- RUTAS DE LA API -----------
app.use("/api", authRoutes);

app.use(otrosRoutes);
app.use(mantenimientoRoutes);
app.use(infraestructuraRoutes);
app.use(grupoRoutes);
app.use(encargadoRoutes);
app.use(tipoRoutes);
app.use(usersRoutes);
app.use(usuarioRoutes);
app.use(teacherRoutes);
app.use(calendarioRoutes);
app.use(directorRoutes);
app.use(paraleloRoutes);
app.use(materiaRoutes);
app.use(calificacionRoutes);
app.use(boletinRoutes);
app.use(estudiantesRoutes);
app.use(horariosRoutes);
app.use(vistaProfRoutes);
app.use(blockchainRoutes);


app.listen(PORT, () => {
  console.log(`SERVER ON PORT ${PORT}`);
});