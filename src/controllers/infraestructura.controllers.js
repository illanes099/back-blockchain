import { pool } from "../database/database.js";

export const getInfraestructura = async (req, res) => {
  const { rows } = await pool.query("select * from infraestructura");

  res.json(rows);
};

export const createInfraestructura = async (req, res) => {
  const data = req.body;
  const { rows } = await pool.query(
    "insert into infraestructura (codigo_activo,ubicacion,fecha,descripcion,accion,tipo_id,grupo_id,encargado_id,procedencia) values ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *",
    [data.codigo_activo, data.ubicacion,data.fecha, data.descripcion, data.accion, data.tipo_id, data.grupo_id, data.encargado_id, data.procedencia]
  );

  return res.json(rows[0]);
};

export const deleteInfraestructura = async (req, res) => {
  const { id } = req.params;
  const { rowCount } = await pool.query(
    "delete from infraestructura where infraestructura_id = $1 RETURNING *",
    [id]
  );

  if (rowCount === 0) {
    return res.status(404).json({ message: "not founf" });
  }
  return res.sendStatus(204);
};

export const updateInfraestructura = async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  const { rows } = await pool.query(
    "update infraestructura set codigo_activo = $1 ,ubicacion = $2, fecha = $3, descripcion = $4, tipo_id = $5,  grupo_id = $6, encargado_id = $7 where infraestructura_id = $8 returning *",
    [data.codigo_activo, data.ubicacion,data.fecha, data.descripcion,  data.tipo_id, data.grupo_id, data.encargado_id,id]
  );
  return res.json(rows[0]);
};
