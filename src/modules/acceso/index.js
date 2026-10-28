const crearServicio = require('./acceso.servicio');
const crearRouter = require('./acceso.router');

const servicio = crearServicio();

module.exports = {
  basePath: '/api/accesos',
  router: crearRouter(servicio),
  // Contrato público
  registrarEntrada: (idCliente, fechaHora) => servicio.registrarEntrada(idCliente, fechaHora),
  registrarSalida: (idCliente, fechaHora) => servicio.registrarSalida(idCliente, fechaHora),
  crearServicio,
  crearRouter,
};
