const router = require('./cliente.router');
const repositorio = require('./cliente.repositorio');

module.exports = {
  basePath: '/api/clientes',
  router,

  obtenerPorId: (idCliente) => repositorio.obtenerPorId(idCliente),

  clienteExiste: async (idCliente) => {
    const cliente = await repositorio.obtenerPorId(idCliente);
    return Boolean(cliente);
  },
};