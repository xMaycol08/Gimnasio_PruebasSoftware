const db = require('../../config/db');

const crear = async ({ id_cliente, id_membresia, fecha_pago, fecha_vencimiento, monto, estado }) => {
  const { rows } = await db.query(
    `INSERT INTO pago (id_cliente, id_membresia, fecha_pago, fecha_vencimiento, monto, estado)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [id_cliente, id_membresia, fecha_pago, fecha_vencimiento, monto, estado]
  );
  return rows[0];
};

const buscarPorId = async (idPago) => {
  const { rows } = await db.query('SELECT * FROM pago WHERE id_pago = $1', [idPago]);
  return rows[0] || null;
};

// Sin id_cliente devuelve todos los pagos; con id_cliente, solo los de ese cliente.
const listar = async (idCliente) => {
  const filtro = idCliente === undefined ? '' : 'WHERE id_cliente = $1';
  const parametros = idCliente === undefined ? [] : [idCliente];
  const { rows } = await db.query(
    `SELECT * FROM pago ${filtro} ORDER BY fecha_pago DESC, id_pago DESC`,
    parametros
  );
  return rows;
};

const actualizarEstado = async (idPago, estado) => {
  const { rows } = await db.query('UPDATE pago SET estado = $1 WHERE id_pago = $2 RETURNING *', [
    estado,
    idPago,
  ]);
  return rows[0] || null;
};

module.exports = { crear, buscarPorId, listar, actualizarEstado };
