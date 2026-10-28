// Utilidades de fechas. Las fechas (DATE) son texto 'YYYY-MM-DD'.
const FORMATO_FECHA = /^\d{4}-\d{2}-\d{2}$/;
const MS_POR_DIA = 86400000;

const aUtc = (fecha) => new Date(`${fecha}T00:00:00Z`);

// Fecha de hoy (hora local del servidor) como 'YYYY-MM-DD'.
const hoy = () => {
  const ahora = new Date();
  const mes = String(ahora.getMonth() + 1).padStart(2, '0');
  const dia = String(ahora.getDate()).padStart(2, '0');
  return `${ahora.getFullYear()}-${mes}-${dia}`;
};

const esFechaValida = (valor) => {
  if (typeof valor !== 'string' || !FORMATO_FECHA.test(valor)) {
    return false;
  }
  const fecha = aUtc(valor);
  return !Number.isNaN(fecha.getTime()) && fecha.toISOString().slice(0, 10) === valor;
};

const sumarDias = (fecha, dias) => {
  const resultado = aUtc(fecha);
  resultado.setUTCDate(resultado.getUTCDate() + dias);
  return resultado.toISOString().slice(0, 10);
};

// Días entre dos fechas (positivo si "hasta" es posterior a "desde").
const diasEntre = (desde, hasta) => Math.round((aUtc(hasta) - aUtc(desde)) / MS_POR_DIA);

module.exports = { hoy, esFechaValida, sumarDias, diasEntre };
