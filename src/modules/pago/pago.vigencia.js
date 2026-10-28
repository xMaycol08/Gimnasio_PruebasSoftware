// Las fechas son texto 'YYYY-MM-DD', por lo que comparar como texto equivale a comparar fechas.

// Fecha de hoy (hora local del servidor) como 'YYYY-MM-DD'.
const hoy = () => {
  const ahora = new Date();
  const mes = String(ahora.getMonth() + 1).padStart(2, '0');
  const dia = String(ahora.getDate()).padStart(2, '0');
  return `${ahora.getFullYear()}-${mes}-${dia}`;
};

// Un pago da vigencia si fue PAGADO y la fecha cae entre el pago y el vencimiento.
const esVigente = (pago, fecha) =>
  pago.fecha_pago <= fecha && fecha < pago.fecha_vencimiento;

// Mayor vencimiento entre los pagos vigentes en la fecha, o null si no hay ninguno.
const vencimientoVigente = (pagos, fecha) => {
  const vigentes = pagos.filter((pago) => esVigente(pago, fecha));
  if (vigentes.length === 0) {
    return null;
  }
  return vigentes.map((pago) => pago.fecha_vencimiento).sort().pop();
};

module.exports = { hoy, esVigente, vencimientoVigente };
