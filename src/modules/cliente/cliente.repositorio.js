
const db = require('../../config/db');

async function listar() {
  const resultado = await db.query(
    'SELECT id_cliente, nombre, cedula, telefono, email FROM cliente ORDER BY id_cliente'
  );

  return resultado.rows;
}

async function obtenerPorId(idCliente) {
  const resultado = await db.query(
    'SELECT id_cliente, nombre, cedula, telefono, email FROM cliente WHERE id_cliente = $1',
    [idCliente]
  );

  return resultado.rows[0] || null;
}

async function buscarPorCedula(cedula, excluirId = null) {
  const resultado = await db.query(
    `SELECT id_cliente, nombre, cedula, telefono, email
     FROM cliente
     WHERE cedula = $1
     AND ($2::integer IS NULL OR id_cliente <> $2)
     LIMIT 1`,
    [cedula, excluirId]
  );

  return resultado.rows[0] || null;
}

async function buscarPorEmail(email, excluirId = null) {
  const resultado = await db.query(
    `SELECT id_cliente, nombre, cedula, telefono, email
     FROM cliente
     WHERE email = $1
     AND ($2::integer IS NULL OR id_cliente <> $2)
     LIMIT 1`,
    [email, excluirId]
  );

  return resultado.rows[0] || null;
}

async function crear(datos) {
  const resultado = await db.query(
    `INSERT INTO cliente (nombre, cedula, telefono, email)
     VALUES ($1, $2, $3, $4)
     RETURNING id_cliente, nombre, cedula, telefono, email`,
    [datos.nombre, datos.cedula, datos.telefono, datos.email]
  );

  return resultado.rows[0];
}

async function actualizar(idCliente, datos) {
  const resultado = await db.query(
    `UPDATE cliente
     SET nombre = $1, cedula = $2, telefono = $3, email = $4
     WHERE id_cliente = $5
     RETURNING id_cliente, nombre, cedula, telefono, email`,
    [datos.nombre, datos.cedula, datos.telefono, datos.email, idCliente]
  );

  return resultado.rows[0] || null;
}

async function eliminar(idCliente) {
  const resultado = await db.query(
    'DELETE FROM cliente WHERE id_cliente = $1 RETURNING id_cliente',
    [idCliente]
  );

  return resultado.rowCount > 0;
}

module.exports = {
  listar,
  obtenerPorId,
  buscarPorCedula,
  buscarPorEmail,
  crear,
  actualizar,
  eliminar,
};
