const { ErrorValidacion, ErrorReglaNegocio } = require('../../shared/errores');

const ESTADOS = ['PAGADO', 'PENDIENTE', 'ANULADO'];
const TRANSICIONES = {
  PENDIENTE: ['PAGADO', 'ANULADO'],
  PAGADO: ['ANULADO'],
  ANULADO: [],
};
const MONTO_MAXIMO = 1000000;
const FORMATO_FECHA = /^\d{4}-\d{2}-\d{2}$/;

const validarId = (valor, campo) => {
  const numero = typeof valor === 'string' && /^\d+$/.test(valor) ? Number(valor) : valor;
  if (!Number.isInteger(numero) || numero <= 0) {
    throw new ErrorValidacion(`${campo} debe ser un entero positivo`);
  }
  return numero;
};

const validarFecha = (valor, campo) => {
  if (typeof valor !== 'string' || !FORMATO_FECHA.test(valor)) {
    throw new ErrorValidacion(`${campo} debe tener el formato YYYY-MM-DD`);
  }
  const fecha = new Date(`${valor}T00:00:00Z`);
  if (Number.isNaN(fecha.getTime()) || fecha.toISOString().slice(0, 10) !== valor) {
    throw new ErrorValidacion(`${campo} no es una fecha válida`);
  }
  return valor;
};

const validarMonto = (valor) => {
  if (typeof valor !== 'number' || !Number.isFinite(valor)) {
    throw new ErrorValidacion('El monto debe ser un número');
  }
  if (valor <= 0) {
    throw new ErrorValidacion('El monto debe ser mayor que 0');
  }
  if (valor >= MONTO_MAXIMO) {
    throw new ErrorValidacion(`El monto debe ser menor que ${MONTO_MAXIMO}`);
  }
  if (Math.round(valor * 100) / 100 !== valor) {
    throw new ErrorValidacion('El monto admite como máximo 2 decimales');
  }
  return valor;
};

const validarEstado = (estado) => {
  if (!ESTADOS.includes(estado)) {
    throw new ErrorValidacion(`El estado debe ser uno de: ${ESTADOS.join(', ')}`);
  }
  return estado;
};

// Si no se indica el estado, el pago se registra como PAGADO.
const validarDatosPago = (datos) => {
  const entrada = datos || {};
  return {
    id_cliente: validarId(entrada.id_cliente, 'id_cliente'),
    id_membresia: validarId(entrada.id_membresia, 'id_membresia'),
    fecha_pago: validarFecha(entrada.fecha_pago, 'fecha_pago'),
    monto: validarMonto(entrada.monto),
    estado: entrada.estado === undefined ? 'PAGADO' : validarEstado(entrada.estado),
  };
};

const validarTransicion = (actual, nuevo) => {
  if (!TRANSICIONES[actual].includes(nuevo)) {
    throw new ErrorReglaNegocio(`No se puede cambiar un pago de ${actual} a ${nuevo}`);
  }
};

module.exports = {
  ESTADOS,
  validarId,
  validarFecha,
  validarMonto,
  validarEstado,
  validarDatosPago,
  validarTransicion,
};
