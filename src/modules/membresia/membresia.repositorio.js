const db = require('../../config/db');

const crear = async ({ nombre, precio, duracion_dias }) => {
  const { rows } = await db.query(
    'INSERT INTO membresia (nombre, precio, duracion_dias) VALUES ($1, $2, $3) RETURNING *',
    [nombre, precio, duracion_dias]
  );
  return rows[0];
};

const listar = async () => {
  const { rows } = await db.query('SELECT * FROM membresia ORDER BY id_membresia ASC');
  return rows;
};

const buscarPorId = async (id) => {
  const { rows } = await db.query('SELECT * FROM membresia WHERE id_membresia = $1', [id]);
  return rows[0] || null;
};

const actualizar = async (id, { nombre, precio, duracion_dias }) => {
  const { rows } = await db.query(
    'UPDATE membresia SET nombre = $1, precio = $2, duracion_dias = $3 WHERE id_membresia = $4 RETURNING *',
    [nombre, precio, duracion_dias, id]
  );
  return rows[0];
};

const eliminar = async (id) => {
  await db.query('DELETE FROM membresia WHERE id_membresia = $1', [id]);
};

module.exports = { crear, listar, buscarPorId, actualizar, eliminar };