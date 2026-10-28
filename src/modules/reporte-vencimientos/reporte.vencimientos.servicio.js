const { ErrorValidacion } = require('../../shared/errores');
const { hoy, esFechaValida, sumarDias, diasEntre } = require('../../shared/fechas');

const DIAS_POR_DEFECTO = 7;
const DIAS_MAXIMO = 365;

const validarFecha = (fecha) => {
  if (fecha === undefined) {
    return undefined;
  }
  if (!esFechaValida(fecha)) {
    throw new ErrorValidacion('fecha debe tener el formato YYYY-MM-DD y ser una fecha válida');
  }
  return fecha;
};

const validarDias = (dias) => {
  if (dias === undefined) {
    return DIAS_POR_DEFECTO;
  }
  const numero = typeof dias === 'string' && /^\d+$/.test(dias) ? Number(dias) : dias;
  if (!Number.isInteger(numero) || numero < 1 || numero > DIAS_MAXIMO) {
    throw new ErrorValidacion(`dias debe ser un entero entre 1 y ${DIAS_MAXIMO}`);
  }
  return numero;
};

// Agrupa los pagos por cliente separando los PAGADO de la cantidad de PENDIENTE.
const agruparPorCliente = (pagos) => {
  const clientes = new Map();
  for (const pago of pagos) {
    if (!clientes.has(pago.id_cliente)) {
      clientes.set(pago.id_cliente, {
        id_cliente: pago.id_cliente,
        nombre: pago.nombre,
        email: pago.email,
        pagados: [],
        pendientes: 0,
      });
    }
    const cliente = clientes.get(pago.id_cliente);
    if (pago.estado === 'PAGADO') {
      cliente.pagados.push(pago);
    } else {
      cliente.pendientes += 1;
    }
  }
  return [...clientes.values()];
};

const mayorVencimiento = (pagos) =>
  pagos.length === 0 ? null : pagos.map((pago) => pago.fecha_vencimiento).sort().pop();

const crearServicio = ({
  repositorio = require('./reporte.vencimientos.repositorio'),
  fechaActual = hoy,
} = {}) => {
  // Clientes con membresía vigente que vence dentro de los próximos "dias" días.
  const porVencer = async ({ dias, fecha } = {}) => {
    const limiteDias = validarDias(dias);
    const dia = validarFecha(fecha) || fechaActual();
    const limite = sumarDias(dia, limiteDias);

    const clientes = agruparPorCliente(await repositorio.listarPagosActivos())
      .map((cliente) => {
        const vigentes = cliente.pagados.filter(
          (pago) => pago.fecha_pago <= dia && dia <= pago.fecha_vencimiento
        );
        return { cliente, vencimiento: mayorVencimiento(vigentes) };
      })
      .filter(({ vencimiento }) => vencimiento !== null && vencimiento <= limite)
      .map(({ cliente, vencimiento }) => ({
        id_cliente: cliente.id_cliente,
        nombre: cliente.nombre,
        email: cliente.email,
        fecha_vencimiento: vencimiento,
        dias_restantes: diasEntre(dia, vencimiento),
      }))
      .sort((a, b) => a.fecha_vencimiento.localeCompare(b.fecha_vencimiento));

    return { fecha: dia, dias: limiteDias, total: clientes.length, clientes };
  };

  // Clientes que tuvieron pagos y hoy no tienen ninguna membresía pagada que cubra la fecha.
  const morosos = async ({ fecha } = {}) => {
    const dia = validarFecha(fecha) || fechaActual();

    const clientes = agruparPorCliente(await repositorio.listarPagosActivos())
      .filter((cliente) => !cliente.pagados.some((pago) => pago.fecha_vencimiento >= dia))
      .map((cliente) => ({
        id_cliente: cliente.id_cliente,
        nombre: cliente.nombre,
        email: cliente.email,
        motivo: cliente.pendientes > 0 ? 'PAGO_PENDIENTE' : 'MEMBRESIA_VENCIDA',
        ultimo_vencimiento: mayorVencimiento(cliente.pagados),
      }));

    return { fecha: dia, total: clientes.length, clientes };
  };

  return { porVencer, morosos };
};

module.exports = crearServicio;
