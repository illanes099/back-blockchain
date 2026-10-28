import { pool } from "../database/database.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import crypto from "node:crypto";
import bcrypt from "bcrypt";

dotenv.config();

// Helper para SHA-256
const hashPasswordSHA256 = (password) => {
  return crypto.createHash("sha256").update(password).digest("hex");
};

export const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    // 1. Buscar usuario en la base de datos
    const { rows } = await pool.query("SELECT * FROM usuarios WHERE username = $1", [username]);
    const user = rows[0];
    
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    let passwordMatch = false;

    // 2. Probar primero con el nuevo formato SHA-256
    const hashedSHA256 = hashPasswordSHA256(password);
    if (hashedSHA256 === user.password) {
      passwordMatch = true;
    } else {
      // 3. Si falla SHA-256 y la contraseña guardada es un hash bcrypt, intentar bcrypt
      if (user.password && user.password.startsWith("$2")) {
        passwordMatch = await bcrypt.compare(password, user.password).catch(() => false);
        
        // OPCIONAL: Si coincide con bcrypt, migramos automáticamente la clave a SHA-256
        if (passwordMatch) {
          await pool.query(
            "UPDATE usuarios SET password = $1 WHERE usuario_id = $2",
            [hashedSHA256, user.usuario_id]
          );
        }
      }
    }

    if (!passwordMatch) {
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }

    // 4. Generar Token JWT
    const token = jwt.sign(
      { id: user.usuario_id, username: user.username, rol: user.rol },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES || "1d" }
    );

    return res.json({
      message: "Inicio de sesión exitoso",
      token,
      usuario: { id: user.usuario_id, nombre: user.nombre, rol: user.rol },
    });
  } catch (error) {
    console.error("Error en login:", error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
};