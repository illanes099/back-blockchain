import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const verificarToken = (req, res, next) => {
  const token = req.headers["authorization"];

  if (!token) return res.status(403).json({ message: "Token no proporcionado" });

  try {
    const decoded = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET);
    req.user = decoded; // Guardamos la info del usuario
    next();
  } catch (error) {
    res.status(401).json({ message: "Token inválido o expirado" });
  }
};
