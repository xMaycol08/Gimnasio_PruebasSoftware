const {
  ErrorNoEncontrado,
  ErrorConflicto,
  ErrorReglaNegocio,
} = require('../../shared/errores');
const {
  validarIdCliente,
  validarFechaHora,
  validarOrdenFechas,
  extraerFechaYMD,
} = require('./acceso.validaciones');
const { calcularPermanenciaMinutos } = require('./acceso.permanencia');

const crearServicio = ({
  repositorio = require('./acceso.repositorio'),
  obtenerClientes = () => require('../cliente'),
  obtenerPagos = () => require('../pago'),
} = {}) => ({
  async registrarEntrada(idClienteRaw, fechaHoraRaw) {
    const idCliente = validarIdCliente(idClienteRaw);
    const fechaHora = validarFechaHora(fechaHoraRaw);

    const clientes = obtenerClientes();
    const existe = await clientes.clienteExiste(idCliente);
    if (!existe) {
      throw new ErrorNoEncontrado(`El cliente con id ${idCliente} no existe`);
    }

    const fechaYMD = extraerFechaYMD(fechaHora);
    const pagos = obtenerPagos();
    const tieneVigente = await pagos.tieneMembresiaVigente(idCliente, fechaYMD);
    if (!tieneVigente) {
      throw new ErrorReglaNegocio('Membresía vencida o inexistente');
    }

    return repositorio.crearEntrada({
      id_cliente: idCliente,
      fecha_hora_entrada: fechaHora,
    });
  },

  async registrarSalida(idClienteRaw, fechaHoraRaw) {
    const idCliente = validarIdCliente(idClienteRaw);
    const fechaHoraSalida = validarFechaHora(fechaHoraRaw);

    const clientes = obtenerClientes();
    const existe = await clientes.clienteExiste(idCliente);
    if (!existe) {
      throw new ErrorNoEncontrado(`El cliente con id ${idCliente} no existe`);
    }

    const accesoAbierto = await repositorio.buscarAbiertoPorCliente(idCliente);
    if (!accesoAbierto) {
      throw new ErrorConflicto('El cliente no tiene una entrada abierta');
    }

    validarOrdenFechas(accesoAbierto.fecha_hora_entrada, fechaHoraSalida);

    const permanencia_minutos = calcularPermanenciaMinutos(
      accesoAbierto.fecha_hora_entrada,
      fechaHoraSalida
    );

    const accesoCerrado = await repositorio.cerrarSalida(
      accesoAbierto.id_acceso,
      fechaHoraSalida
    );

    return {
      ...accesoCerrado,
      permanencia_minutos,
    };
  },

  async listar({ idCliente: idClienteRaw } = {}) {
    let idCliente;
    if (idClienteRaw !== undefined && idClienteRaw !== null && idClienteRaw !== '') {
      idCliente = validarIdCliente(idClienteRaw);
    }
    const accesos = await repositorio.listar(idCliente ? { id_cliente: idCliente } : {});
    return accesos.map((acc) => {
      if (acc.fecha_hora_salida) {
        return {
          ...acc,
          permanencia_minutos: calcularPermanenciaMinutos(
            acc.fecha_hora_entrada,
            acc.fecha_hora_salida
          ),
        };
      }
      return acc;
    });
  },

  async obtenerDentro() {
    return repositorio.listarDentro();
  },
});

module.exports = crearServicio;
