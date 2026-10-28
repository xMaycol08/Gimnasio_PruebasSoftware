const db = require('../../config/db');

// Pagos que pueden afectar la vigencia de un cliente (los anulados no cuentan).
const listarPagosActivos = async () => {
  const { rows } = await db.query(
    `SELECT p.id_cliente, c.nombre, c.email, p.fecha_pago, p.fecha_vencimiento, p.estado
     FROM pago p
     JOIN cliente c ON c.id_cliente = p.id_cliente
     WHERE p.estado IN ('PAGADO', 'PENDIENTE')
     ORDER BY p.id_cliente, p.fecha_vencimiento`
  );
  return rows;
};

module.exports = { listarPagosActivos };
