const calcularPermanenciaMinutos = (fechaEntrada, fechaSalida) => {
  const entrada = fechaEntrada instanceof Date ? fechaEntrada : new Date(fechaEntrada);
  const salida = fechaSalida instanceof Date ? fechaSalida : new Date(fechaSalida);

  if (Number.isNaN(entrada.getTime()) || Number.isNaN(salida.getTime())) {
    throw new TypeError('Las fechas deben ser válidas');
  }

  const diffMs = salida.getTime() - entrada.getTime();
  if (diffMs < 0) {
    throw new RangeError('La fecha de salida no puede ser anterior a la de entrada');
  }

  return Math.floor(diffMs / (1000 * 60 * 60));
};

module.exports = {
  calcularPermanenciaMinutos,
};
