import crypto from "node:crypto";
import { pool } from "../database/database.js";

const ROLES_PERMITIDOS = new Set(["docente", "estudiante", "director"]);

// 💡 Helper para calcular SHA-256
const hashPassword = (password) => {
  return crypto.createHash("sha256").update(password).digest("hex");
};

// 💡 Helper para no exponer contraseñas
const sanitizeUser = (row) => {
  if (!row) return row;
  const { password, ...safe } = row;
  return safe;
};

// ✅ Obtener todos los usuarios (sin password)
export const getUsuarios = async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM usuarios ORDER BY usuario_id ASC"
    );
    res.json(rows.map(sanitizeUser));
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// ✅ Crear o retornar usuario existente para evitar duplicados al subir desde Excel
export const createUsuario = async (req, res) => {
  const client = await pool.connect();

  try {
    const { username, password, rol, nombre, apellido, paralelo_id } = req.body;

    if (!username || !password || !rol || !nombre || !apellido) {
      return res.status(400).json({ message: "Todos los campos son requeridos" });
    }

    if (!ROLES_PERMITIDOS.has(rol)) {
      return res.status(400).json({
        message: `Rol inválido. Use uno de: ${[...ROLES_PERMITIDOS].join(", ")}`,
      });
    }

    // Iniciar transacción
    await client.query("BEGIN");

    // Verificar si el usuario ya existe por su 'username'
    const existingUser = await client.query(
      "SELECT * FROM usuarios WHERE username = $1",
      [username]
    );

    let usuarioFinal;

    if (existingUser.rows.length > 0) {
      // Si ya existe, no lo creamos de nuevo, reutilizamos el existente
      usuarioFinal = existingUser.rows[0];
    } else {
      // Hashear contraseña con SHA-256
      const hashed = hashPassword(password);

      // 1. Insertar el nuevo usuario si no existe
      const { rows } = await client.query(
        `INSERT INTO usuarios (username, password, rol, nombre, apellido)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [username, hashed, rol, nombre, apellido]
      );

      usuarioFinal = rows[0];
      const nuevoUsuarioId = usuarioFinal.usuario_id;

      // 2. Insertar inmediatamente en la tabla según el rol asignado
      if (rol === "estudiante") {
        await client.query(
          `INSERT INTO estudiantes (usuario_id, paralelo_id) VALUES ($1, $2)`,
          [nuevoUsuarioId, paralelo_id || null]
        );
      } else if (rol === "docente") {
        await client.query(
          `INSERT INTO profesores (usuario_id) VALUES ($1)`,
          [nuevoUsuarioId]
        );
      } else if (rol === "director") {
        await client.query(
          `INSERT INTO director (usuario_id) VALUES ($1)`,
          [nuevoUsuarioId]
        );
      }
    }

    // Confirmar la transacción
    await client.query("COMMIT");

    res.status(existingUser.rows.length > 0 ? 200 : 201).json(sanitizeUser(usuarioFinal));
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error al crear usuario y asignar rol:", error);

    if (error.code === "23514") {
      return res.status(400).json({ message: "Rol inválido según la restricción de la tabla" });
    }
    res.status(500).json({ message: "Error interno del servidor" });
  } finally {
    client.release();
  }
};

// ✅ Actualizar usuario
export const updateUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, password, rol, nombre, apellido } = req.body;

    const current = await pool.query(
      "SELECT * FROM usuarios WHERE usuario_id = $1",
      [id]
    );
    if (current.rows.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    if (rol && !ROLES_PERMITIDOS.has(rol)) {
      return res.status(400).json({
        message: `Rol inválido. Use uno de: ${[...ROLES_PERMITIDOS].join(", ")}`,
      });
    }

    const newUsername = username ?? current.rows[0].username;
    const newRol = rol ?? current.rows[0].rol;
    const newNombre = nombre ?? current.rows[0].nombre;
    const newApellido = apellido ?? current.rows[0].apellido;

    let newPassword = current.rows[0].password;
    if (typeof password === "string" && password.length > 0) {
      newPassword = hashPassword(password);
    }

    const { rows } = await pool.query(
      `UPDATE usuarios
       SET username = $1, password = $2, rol = $3, nombre = $4, apellido = $5
       WHERE usuario_id = $6
       RETURNING *`,
      [newUsername, newPassword, newRol, newNombre, newApellido, id]
    );

    res.json(sanitizeUser(rows[0]));
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    if (error.code === "23505") {
      return res.status(400).json({ message: "El nombre de usuario ya existe" });
    }
    if (error.code === "23514") {
      return res.status(400).json({ message: "Rol inválido según la restricción de la tabla" });
    }
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// ✅ Eliminar usuario
export const deleteUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { rowCount } = await pool.query(
      "DELETE FROM usuarios WHERE usuario_id = $1",
      [id]
    );

    if (rowCount === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.sendStatus(204);
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// ✅ Obtener usuario por ID (sin password)
export const getUsuarioById = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query(
      "SELECT * FROM usuarios WHERE usuario_id = $1",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.json(sanitizeUser(rows[0]));
  } catch (error) {
    console.error("Error al obtener usuario:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};