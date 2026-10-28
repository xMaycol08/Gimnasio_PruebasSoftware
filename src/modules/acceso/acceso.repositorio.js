const db = require('../../config/db');

const crearEntrada = async ({ id_cliente, fecha_hora_entrada }) => {
  const { rows } = await db.query(
    'INSERT INTO acceso (id_cliente, fecha_hora_entrada) VALUES ($1, $2) RETURNING *',
    [id_cliente, fecha_hora_entrada]
  );
  return rows[0];
};

const buscarAbiertoPorCliente = async (idCliente) => {
  const { rows } = await db.query(
    'SELECT * FROM acceso WHERE id_cliente = $1 AND fecha_hora_salida IS NULL ORDER BY fecha_hora_entrada DESC LIMIT 1',
    [idCliente]
  );
  return rows[0] || null;
};

const buscarPorId = async (idAcceso) => {
  const { rows } = await db.query(
    'SELECT * FROM acceso WHERE id_acceso = $1',
    [idAcceso]
  );
  return rows[0] || null;
};

const cerrarSalida = async (idAcceso, fechaHoraSalida) => {
  const { rows } = await db.query(
    'UPDATE acceso SET fecha_hora_salida = $1 WHERE id_acceso = $2 RETURNING *',
    [fechaHoraSalida, idAcceso]
  );
  return rows[0];
};

const listar = async ({ id_cliente } = {}) => {
  if (id_cliente) {
    const { rows } = await db.query(
      'SELECT * FROM acceso WHERE id_cliente = $1 ORDER BY fecha_hora_entrada DESC',
      [id_cliente]
    );
    return rows;
  }
  const { rows } = await db.query(
    'SELECT * FROM acceso ORDER BY fecha_hora_entrada DESC'
  );
  return rows;
};

const listarDentro = async () => {
  const { rows } = await db.query(
    `SELECT a.id_acceso, a.id_cliente, a.fecha_hora_entrada, a.fecha_hora_salida,
            c.nombre, c.cedula
     FROM acceso a
     LEFT JOIN cliente c ON a.id_cliente = c.id_cliente
     WHERE a.fecha_hora_salida IS NULL
     ORDER BY a.fecha_hora_entrada DESC`
  );
  return rows;
};

module.exports = {
  crearEntrada,
  buscarAbiertoPorCliente,
  buscarPorId,
  cerrarSalida,
  listar,
  listarDentro,
};
