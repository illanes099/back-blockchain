import { pool } from "../database/database.js";

export const getOtros = async (req, res) => {
  const { rows } = await pool.query("select * from otros");

  res.json(rows);
};

export const createOtros = async (req, res) => {
  const data = req.body;
  const { rows } = await pool.query(
    "insert into otros (serie,modelo,marca,estado,fecha,descripcion,grupo_id,encargado_id,accion, procedencia) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *",
    [data.serie, data.modelo, data.marca, data.estado, data.fecha, data.descripcion, data.grupo_id, data.encargado_id, data.accion,data.procedencia]
  );

  return res.json(rows[0]);
};

export const deleteOtros = async (req, res) => {
  const { id } = req.params;
  const { rowCount } = await pool.query(
    "delete from otros where otros_id = $1 RETURNING *",
    [id]
  );

  if (rowCount === 0) {
    return res.status(404).json({ message: "not founf" });
  }
  return res.sendStatus(204);
};

export const updateOtros = async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  const { rows } = await pool.query(
    "update otros set serie = $1 ,modelo = $2, marca = $3, estado = $4, fecha = $5, descripcion = $6, grupo_id = $7, encargado_id = $8, accion = $9 where otros_id = $10 returning *",
     [data.serie, data.modelo, data.marca, data.estado, data.fecha, data.descripcion, data.grupo_id, data.encargado_id, data.accion,id]
  );
  return res.json(rows[0]);
};
