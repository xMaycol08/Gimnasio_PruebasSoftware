const calcularVencimiento = (fechaPago, duracionDias) => {
  const [year, month, day] = fechaPago.split('-').map(Number);
  const fecha = new Date(Date.UTC(year, month - 1, day));
  fecha.setUTCDate(fecha.getUTCDate() + duracionDias);
  return fecha.toISOString().split('T')[0];
};

module.exports = { calcularVencimiento };