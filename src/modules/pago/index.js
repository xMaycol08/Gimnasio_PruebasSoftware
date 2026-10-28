const crearServicio = require('./pago.servicio');
const crearRouter = require('./pago.router');

const servicio = crearServicio();

module.exports = {
  basePath: '/api/pagos',
  router: crearRouter(servicio),
  // Contrato público (lo usa el módulo Acceso)
  tieneMembresiaVigente: servicio.tieneMembresiaVigente,
};
