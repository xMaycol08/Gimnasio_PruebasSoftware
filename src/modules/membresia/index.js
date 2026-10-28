const crearServicio = require('./membresia.servicio');
const crearRouter = require('./membresia.router');
const { calcularVencimiento } = require('./membresia.fechas');

const servicio = crearServicio();

module.exports = {
  basePath: '/api/membresias',
  router: crearRouter(servicio),
  obtenerPorId: servicio.obtenerPorId,
  calcularVencimiento
};