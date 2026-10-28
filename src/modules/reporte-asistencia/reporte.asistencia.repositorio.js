const db = require('../../config/db');

// Accesos cuya entrada cae en [desde, hasta). Ambos son texto 'YYYY-MM-DD'.
const listarAccesos = async (desde, hasta) => {
  const { rows } = await db.query(
    `SELECT a.id_acceso, a.id_cliente, c.nombre, a.fecha_hora_entrada, a.fecha_hora_salida
     FROM acceso a
     JOIN cliente c ON c.id_cliente = a.id_cliente
     WHERE a.fecha_hora_entrada >= $1::timestamp AND a.fecha_hora_entrada < $2::timestamp
     ORDER BY a.id_cliente, a.fecha_hora_entrada`,
    [desde, hasta]
  );
  return rows;
};

module.exports = { listarAccesos };
