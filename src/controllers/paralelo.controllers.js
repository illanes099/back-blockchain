import { pool } from "../database/database.js";

export const getParalelos = async (req, res) => {
  const { rows } = await pool.query("SELECT * FROM paralelo");
  res.json(rows);
};

export const getParalelo1 = async (req, res) => {
  const { id } = req.params;
  const { rows } = await pool.query(
    "SELECT * FROM paralelo WHERE paralelo_id = $1",
    [id]
  );

  if (rows.length === 0) {
    return res.status(404).json({ message: "Paralelo no encontrado" });
  }
  res.json(rows[0]);
};

export const createParalelo = async (req, res) => {
  const { descripcion, prof_id } = req.body;

  if (!descripcion || !prof_id) {
    return res
      .status(400)
      .json({ message: "descripcion y prof_id son requeridos" });
  }

  const { rows } = await pool.query(
    "INSERT INTO paralelo (descripcion, prof_id) VALUES ($1, $2) RETURNING *",
    [descripcion, prof_id]
  );

  return res.json(rows[0]);
};

export const deleteParalelo = async (req, res) => {
  const { id } = req.params;
  const { rowCount } = await pool.query(
    "DELETE FROM paralelo WHERE paralelo_id = $1",
    [id]
  );

  if (rowCount === 0) {
    return res.status(404).json({ message: "Paralelo no encontrado" });
  }
  return res.sendStatus(204);
};

export const updateParalelo = async (req, res) => {
  const { id } = req.params;
  const { descripcion, prof_id } = req.body;

  const { rows } = await pool.query(
    "UPDATE paralelo SET descripcion = $1, prof_id = $2 WHERE paralelo_id = $3 RETURNING *",
    [descripcion, prof_id, id]
  );

  if (rows.length === 0) {
    return res.status(404).json({ message: "Paralelo no encontrado" });
  }

  return res.json(rows[0]);
};
