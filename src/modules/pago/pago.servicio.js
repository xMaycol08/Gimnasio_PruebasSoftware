const { ErrorNoEncontrado, ErrorConflicto, ErrorReglaNegocio } = require('../../shared/errores');
const {
  validarId,
  validarFecha,
  validarEstado,
  validarDatosPago,
  validarTransicion,
} = require('./pago.validaciones');
const { hoy, esVigente, vencimientoVigente } = require('./pago.vigencia');

const mismoDinero = (a, b) => Math.round(a * 100) === Math.round(b * 100);

// Las dependencias se reciben por parámetro: en las pruebas se reemplazan por stubs.
// Los módulos de otros compañeros se cargan solo al usarlos (así esta rama funciona sin ellos).
const crearServicio = ({
  repositorio = require('./pago.repositorio'),
  obtenerClientes = () => require('../cliente'),
  obtenerMembresias = () => require('../membresia'),
  fechaActual = hoy,
} = {}) => {
  const registrar = async (datos) => {
    const pago = validarDatosPago(datos);

    if (!(await obtenerClientes().clienteExiste(pago.id_cliente))) {
      throw new ErrorNoEncontrado(`No existe el cliente ${pago.id_cliente}`);
    }
    const membresia = await obtenerMembresias().obtenerPorId(pago.id_membresia);
    if (!membresia) {
      throw new ErrorNoEncontrado(`No existe la membresía ${pago.id_membresia}`);
    }
    if (!mismoDinero(pago.monto, membresia.precio)) {
      throw new ErrorReglaNegocio(
        `El monto debe ser igual al precio de la membresía (${membresia.precio})`
      );
    }

    const pagosCliente = await repositorio.listar(pago.id_cliente);
    const duplicado = pagosCliente.some(
      (existente) =>
        existente.id_membresia === pago.id_membresia &&
        existente.fecha_pago === pago.fecha_pago &&
        existente.estado !== 'ANULADO'
    );
    if (duplicado) {
      throw new ErrorConflicto('Ya existe un pago de esa membresía para ese cliente en esa fecha');
    }

    // Renovación anticipada: si aún está vigente, el nuevo periodo empieza al vencer el actual.
    let inicio = pago.fecha_pago;
    if (pago.estado === 'PAGADO') {
      inicio = vencimientoVigente(pagosCliente, pago.fecha_pago) || pago.fecha_pago;
    }
    const fecha_vencimiento = obtenerMembresias().calcularVencimiento(
      inicio,
      membresia.duracion_dias
    );

    return repositorio.crear({ ...pago, fecha_vencimiento });
  };

  const listar = async (idCliente) => {
    const filtro = idCliente === undefined ? undefined : validarId(idCliente, 'id_cliente');
    return repositorio.listar(filtro);
  };

  const obtenerPorId = async (idPago) => {
    const id = validarId(idPago, 'id_pago');
    const pago = await repositorio.buscarPorId(id);
    if (!pago) {
      throw new ErrorNoEncontrado(`No existe el pago ${id}`);
    }
    return pago;
  };

  const cambiarEstado = async (idPago, estado) => {
    const nuevoEstado = validarEstado(estado);
    const pago = await obtenerPorId(idPago);
    validarTransicion(pago.estado, nuevoEstado);
    return repositorio.actualizarEstado(pago.id_pago, nuevoEstado);
  };

  // Contrato público: lo usa el módulo de Accesos.
  const tieneMembresiaVigente = async (idCliente, fecha = fechaActual()) => {
    const id = validarId(idCliente, 'id_cliente');
    const dia = validarFecha(fecha, 'fecha');
    const pagos = await repositorio.listar(id);
    return pagos.some((pago) => esVigente(pago, dia));
  };

  const consultarVigencia = async (idCliente, fecha = fechaActual()) => {
    const id = validarId(idCliente, 'id_cliente');
    const dia = validarFecha(fecha, 'fecha');
    if (!(await obtenerClientes().clienteExiste(id))) {
      throw new ErrorNoEncontrado(`No existe el cliente ${id}`);
    }
    const pagos = await repositorio.listar(id);
    const fecha_vencimiento = vencimientoVigente(pagos, dia);
    return { vigente: fecha_vencimiento !== null, fecha_vencimiento };
  };

  return {
    registrar,
    listar,
    obtenerPorId,
    cambiarEstado,
    tieneMembresiaVigente,
    consultarVigencia,
  };
};

module.exports = crearServicio;
