const crearServicio = require('./reporte.vencimientos.servicio');
const crearRouter = require('./reporte.vencimientos.router');

module.exports = {
  basePath: '/api/reportes/vencimientos',
  router: crearRouter(crearServicio()),
};
