const { ErrorApp } = require('./errores');

const manejadorErrores = (err, _req, res, _next) => {
  if (err instanceof ErrorApp) {
    return res.status(err.estado).json({ error: err.message });
  }
  // JSON mal formado en el cuerpo de la petición
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'El cuerpo de la petición no es un JSON válido' });
  }
  console.error(err);
  return res.status(500).json({ error: 'Error interno del servidor' });
};

const noEncontrado = (req, res) => {
  res.status(404).json({ error: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
};

module.exports = { manejadorErrores, noEncontrado };
