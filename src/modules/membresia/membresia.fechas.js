const calcularVencimiento = (fechaPago, duracionDias) => {
  // DEFECTO INTENCIONAL 2: Cálculo ingenuo que fallará en bisiestos o cambios de huso horario
  // al no usar Date.UTC estrictamente para la instanciación de todas las partes.
  const fecha = new Date(fechaPago); 
  fecha.setDate(fecha.getDate() + duracionDias);
  return fecha.toISOString().split('T')[0];
};

module.exports = { calcularVencimiento };