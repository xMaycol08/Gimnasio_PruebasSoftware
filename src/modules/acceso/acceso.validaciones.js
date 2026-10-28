const { ErrorValidacion, ErrorReglaNegocio } = require('../../shared/errores');

const validarIdCliente = (idCliente) => {
  if (idCliente === undefined || idCliente === null || idCliente === '') {
    throw new ErrorValidacion('El id_cliente es obligatorio');
  }

  const num = Number(idCliente);
  if (!Number.isInteger(num) || num <= 0) {
    throw new ErrorValidacion('El id_cliente debe ser un número entero positivo');
  }

  return num;
};

const validarFechaHora = (fechaHora) => {
  if (fechaHora === undefined || fechaHora === null || fechaHora === '') {
    return new Date();
  }

  if (fechaHora instanceof Date) {
    if (Number.isNaN(fechaHora.getTime())) {
      throw new ErrorValidacion('La fecha_hora proporcionada no es válida');
    }
    return fechaHora;
  }

  if (typeof fechaHora !== 'string') {
    throw new ErrorValidacion('La fecha_hora debe ser una cadena ISO 8601');
  }

  const fecha = new Date(fechaHora);
  if (Number.isNaN(fecha.getTime())) {
    throw new ErrorValidacion('La fecha_hora debe tener un formato ISO 8601 válido');
  }

  return fecha;
};

const validarOrdenFechas = (fechaEntrada, fechaSalida) => {
  const entrada = fechaEntrada instanceof Date ? fechaEntrada : new Date(fechaEntrada);
  const salida = fechaSalida instanceof Date ? fechaSalida : new Date(fechaSalida);

  if (salida.getTime() < entrada.getTime()) {
    throw new ErrorReglaNegocio('La fecha y hora de salida no puede ser anterior a la de entrada');
  }
};

const extraerFechaYMD = (fecha) => {
  const d = fecha instanceof Date ? fecha : new Date(fecha);
  return d.toISOString().slice(0, 10);
};

module.exports = {
  validarIdCliente,
  validarFechaHora,
  validarOrdenFechas,
  extraerFechaYMD,
};
