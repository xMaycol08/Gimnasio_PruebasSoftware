const crearServicio = require('../../src/modules/pago/pago.servicio');

// Repositorio en memoria con la misma interfaz que pago.repositorio.js
const crearRepositorioEnMemoria = (pagosIniciales = []) => {
  const pagos = [...pagosIniciales];
  return {
    pagos,
    crear: async (datos) => {
      const pago = { id_pago: pagos.length + 1, ...datos };
      pagos.push(pago);
      return pago;
    },
    buscarPorId: async (id) => pagos.find((pago) => pago.id_pago === id) || null,
    listar: async (idCliente) =>
      idCliente === undefined ? [...pagos] : pagos.filter((pago) => pago.id_cliente === idCliente),
    actualizarEstado: async (id, estado) => {
      const pago = pagos.find((p) => p.id_pago === id);
      pago.estado = estado;
      return pago;
    },
  };
};

// Suma días a una fecha 'YYYY-MM-DD' (equivale a calcularVencimiento del módulo Membresía)
const sumarDias = (fecha, dias) => {
  const resultado = new Date(`${fecha}T00:00:00Z`);
  resultado.setUTCDate(resultado.getUTCDate() + dias);
  return resultado.toISOString().slice(0, 10);
};

const MENSUAL = { id_membresia: 1, nombre: 'mensual', precio: 30, duracion_dias: 30 };

// Servicio con los módulos de Cliente y Membresía reemplazados por stubs
const crearServicioDePrueba = ({ pagos = [], clientes = [1], membresias = [MENSUAL], hoy } = {}) => {
  const repositorio = crearRepositorioEnMemoria(pagos);
  const servicio = crearServicio({
    repositorio,
    obtenerClientes: () => ({ clienteExiste: async (id) => clientes.includes(id) }),
    obtenerMembresias: () => ({
      obtenerPorId: async (id) => membresias.find((m) => m.id_membresia === id) || null,
      calcularVencimiento: sumarDias,
    }),
    fechaActual: hoy,
  });
  return { servicio, repositorio };
};

const pagoEjemplo = (cambios = {}) => ({
  id_pago: 1,
  id_cliente: 1,
  id_membresia: 1,
  fecha_pago: '2026-03-01',
  fecha_vencimiento: '2026-03-31',
  monto: 30,
  estado: 'PAGADO',
  ...cambios,
});

module.exports = { crearRepositorioEnMemoria, crearServicioDePrueba, sumarDias, MENSUAL, pagoEjemplo };
