import { pool } from "../database/database.js";

export const getCalendario = async (req, res) => {
  const { rows } = await pool.query("SELECT * FROM calendario");
  res.json(rows);
};

export const getCalendario1 = async (req, res) => {
  const { id } = req.params;
  const { rows } = await pool.query(
    "SELECT * FROM calendario WHERE calendario_id = $1",
    [id]
  );

  if (rows.length === 0) {
    return res.status(404).json({ message: "Calendario no encontrado" });
  }
  res.json(rows[0]);
};

export const createCalendario = async (req, res) => {
  const data = req.body;
  const { rows } = await pool.query(
    "INSERT INTO calendario (descripcion, fecha) VALUES ($1, $2) RETURNING *",
    [data.descripcion, data.fecha]
  );

  return res.json(rows[0]);
};

export const deleteCalendario = async (req, res) => {
  const { id } = req.params;
  const { rowCount } = await pool.query(
    "DELETE FROM calendario WHERE calendario_id = $1 RETURNING *",
    [id]
  );

  if (rowCount === 0) {
    return res.status(404).json({ message: "Calendario no encontrado" });
  }
  return res.sendStatus(204);
};

export const updateCalendario = async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  const { rows } = await pool.query(
    "UPDATE calendario SET descripcion = $1, fecha = $2 WHERE calendario_id = $3 RETURNING *",
    [data.descripcion, data.fecha, id]
  );
  if (rows.length === 0) {
    return res.status(404).json({ message: "Calendario no encontrado" });
  }
  return res.json(rows[0]);
};
