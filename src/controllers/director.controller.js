import { pool } from "../database/database.js";

export const getDirector = async (req, res) => {
  const { rows } = await pool.query("SELECT * FROM director");
  res.json(rows);
};

export const getDirector1 = async (req, res) => {
  const { id } = req.params;
  const { rows } = await pool.query(
    "SELECT * FROM director WHERE direc_id = $1",
    [id]
  );

  if (rows.length === 0) {
    return res.status(404).json({ message: "Director no encontrado" });
  }

  res.json(rows[0]);
};

export const createDirector = async (req, res) => {
  const { usuario_id } = req.body;

  if (!usuario_id) {
    return res.status(400).json({ message: "usuario_id es requerido" });
  }

  const { rows } = await pool.query(
    "INSERT INTO director (usuario_id) VALUES ($1) RETURNING *",
    [usuario_id]
  );

  return res.json(rows[0]);
};

export const updateDirector = async (req, res) => {
  const { id } = req.params;
  const { usuario_id } = req.body;

  const { rows } = await pool.query(
    "UPDATE director SET usuario_id = $1 WHERE direc_id = $2 RETURNING *",
    [usuario_id, id]
  );

  if (rows.length === 0) {
    return res.status(404).json({ message: "Director no encontrado" });
  }

  return res.json(rows[0]);
};

export const deleteDirector = async (req, res) => {
  const { id } = req.params;
  const { rowCount } = await pool.query(
    "DELETE FROM director WHERE direc_id = $1",
    [id]
  );

  if (rowCount === 0) {
    return res.status(404).json({ message: "Director no encontrado" });
  }

  return res.sendStatus(204);
};
