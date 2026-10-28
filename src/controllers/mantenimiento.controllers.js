import { pool } from "../database/database.js";

export const getMantenimientos = async (req, res) => {
  const { rows } = await pool.query("select * from mantenimiento");

  res.json(rows);
};

export const getMantenimiento = async (req, res) => {
  const {id} = req.params;

  const { rows } = await pool.query("select * from mantenimiento where mantenimiento_id = $1",[id]);

  res.json(rows[0]);
};

export const createMantenimientos = async (req, res) => {
  const data = req.body;
  const { rows } = await pool.query(
    "insert into mantenimiento (codigo_activo, estado, tipo_mantenimiento, fecha, descripcion, encargado_id) values ($1, $2, $3, $4, $5, $6) RETURNING *",
    [
      data.codigo_activo,
      data.estado,
      data.tipo_mantenimiento,
      data.fecha,
      data.descripcion,
      data.encargado_id,
    ]
  );

  return res.json(rows[0]);
};

export const deleteMantenimientos = async (req, res) => {
  const { id } = req.params;
  const { rowCount } = await pool.query(
    "delete from mantenimiento where mantenimiento_id = $1 RETURNING *",
    [id]
  );

  if (rowCount === 0) {
    return res.status(404).json({ message: "not founf" });
  }
  return res.sendStatus(204);
};

export const updateMantenimientos = async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  const { rows } = await pool.query(
    "update mantenimiento set codigo_activo = $1 ,estado = $2, tipo_mantenimiento = $3, fecha = $4, descripcion = $5, encargado_id = $6 where mantenimiento_id = $7 returning *",
    [
      data.codigo_activo,
      data.estado,
      data.tipo_mantenimiento,
      data.fecha,
      data.descripcion,
      data.encargado_id,
      id,
    ]
  );
  return res.json(rows[0]);
};
