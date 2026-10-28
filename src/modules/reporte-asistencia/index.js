const crearServicio = require('./reporte.asistencia.servicio');
const crearRouter = require('./reporte.asistencia.router');

module.exports = {
  basePath: '/api/reportes/asistencia',
  router: crearRouter(crearServicio()),
};
