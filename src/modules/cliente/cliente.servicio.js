
const repositorioPredeterminado = require('./cliente.repositorio');
const { validarDatosCliente } = require('./cliente.validaciones');
const {
  ErrorNoEncontrado,
  ErrorConflicto,
} = require('../../shared/errores');

function crearServicio(repositorio = repositorioPredeterminado) {
  async function listar() {
    return repositorio.listar();
  }

  async function obtenerPorId(idCliente) {
    const cliente = await repositorio.obtenerPorId(idCliente);

    if (!cliente) {
      throw new ErrorNoEncontrado('El cliente no existe');
    }

    return cliente;
  }

  async function crear(datos) {
    const clienteValidado = validarDatosCliente(datos);

    const cedulaExistente = await repositorio.buscarPorCedula(
      clienteValidado.cedula
    );

    if (cedulaExistente) {
      throw new ErrorConflicto('La cédula ya está registrada');
    }

    const emailExistente = await repositorio.buscarPorEmail(
      clienteValidado.email
    );

    if (emailExistente) {
      throw new ErrorConflicto('El correo electrónico ya está registrado');
    }

    return repositorio.crear(clienteValidado);
  }

  async function actualizar(idCliente, datos) {
    const clienteExistente = await repositorio.obtenerPorId(idCliente);

    if (!clienteExistente) {
      throw new ErrorNoEncontrado('El cliente no existe');
    }

    const clienteValidado = validarDatosCliente(datos);

    const cedulaExistente = await repositorio.buscarPorCedula(
      clienteValidado.cedula,
      idCliente
    );

    if (cedulaExistente) {
      throw new ErrorConflicto('La cédula ya está registrada');
    }

    const emailExistente = await repositorio.buscarPorEmail(
      clienteValidado.email,
      idCliente
    );

    if (emailExistente) {
      throw new ErrorConflicto('El correo electrónico ya está registrado');
    }

    return repositorio.actualizar(idCliente, clienteValidado);
  }

  async function eliminar(idCliente) {
    const clienteExistente = await repositorio.obtenerPorId(idCliente);

    if (!clienteExistente) {
      throw new ErrorNoEncontrado('El cliente no existe');
    }

    try {
      await repositorio.eliminar(idCliente);
    } catch (error) {
      if (error.code === '23503') {
        throw new ErrorConflicto(
          'No se puede eliminar el cliente porque tiene pagos o accesos asociados'
        );
      }

      throw error;
    }
  }

  return {
    listar,
    obtenerPorId,
    crear,
    actualizar,
    eliminar,
  };
}

module.exports = {
  crearServicio,
};
