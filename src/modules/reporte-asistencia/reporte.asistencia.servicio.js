const { ErrorValidacion } = require('../../shared/errores');
const { hoy, esFechaValida, sumarDias, diasEntre } = require('../../shared/fechas');

const DIAS_POR_DEFECTO = 30;
const RANGO_MAXIMO_DIAS = 366;
const MS_POR_MINUTO = 60000;

const validarRango = (desde, hasta, fechaActual) => {
  const fin = hasta === undefined ? fechaActual : hasta;
  const inicio = desde === undefined ? sumarDias(fin, -(DIAS_POR_DEFECTO - 1)) : desde;

  for (const [campo, valor] of [['desde', inicio], ['hasta', fin]]) {
    if (!esFechaValida(valor)) {
      throw new ErrorValidacion(`${campo} debe tener el formato YYYY-MM-DD y ser una fecha válida`);
    }
  }
  if (inicio > fin) {
    throw new ErrorValidacion('desde no puede ser posterior a hasta');
  }
  if (diasEntre(inicio, fin) + 1 > RANGO_MAXIMO_DIAS) {
    throw new ErrorValidacion(`El rango no puede superar ${RANGO_MAXIMO_DIAS} días`);
  }
  return { desde: inicio, hasta: fin };
};

const minutosEntre = (entrada, salida) =>
  Math.floor((new Date(salida).getTime() - new Date(entrada).getTime()) / MS_POR_MINUTO);

const crearServicio = ({
  repositorio = require('./reporte.asistencia.repositorio'),
  fechaActual = hoy,
} = {}) => {
  // Visitas y minutos por cliente en el rango, ambos extremos incluidos.
  const asistencia = async ({ desde, hasta } = {}) => {
    const rango = validarRango(desde, hasta, fechaActual());
    const accesos = await repositorio.listarAccesos(rango.desde, sumarDias(rango.hasta, 1));

    const porCliente = new Map();
    for (const acceso of accesos) {
      if (!porCliente.has(acceso.id_cliente)) {
        porCliente.set(acceso.id_cliente, {
          id_cliente: acceso.id_cliente,
          nombre: acceso.nombre,
          visitas: 0,
          minutos_totales: 0,
          accesos_abiertos: 0,
        });
      }
      const cliente = porCliente.get(acceso.id_cliente);
      cliente.visitas += 1;
      if (acceso.fecha_hora_salida) {
        cliente.minutos_totales += minutosEntre(acceso.fecha_hora_entrada, acceso.fecha_hora_salida);
      } else {
        cliente.accesos_abiertos += 1;
      }
    }

    const clientes = [...porCliente.values()].sort((a, b) => b.visitas - a.visitas);
    return { ...rango, total_visitas: accesos.length, clientes };
  };

  return { asistencia };
};

module.exports = crearServicio;
