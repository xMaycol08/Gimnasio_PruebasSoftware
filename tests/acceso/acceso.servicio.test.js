const crearServicio = require('../../src/modules/acceso/acceso.servicio');
const { ErrorValidacion } = require('../../src/shared/errores');

describe('acceso.servicio (reglas de negocio y transiciones)', () => {
  let repositorioMock;
  let moduloClienteMock;
  let moduloPagoMock;
  let servicio;

  beforeEach(() => {
    repositorioMock = {
      crearEntrada: jest.fn(),
      buscarAbiertoPorCliente: jest.fn(),
      buscarPorId: jest.fn(),
      cerrarSalida: jest.fn(),
      listar: jest.fn(),
      listarDentro: jest.fn(),
    };

    moduloClienteMock = {
      clienteExiste: jest.fn().mockResolvedValue(true),
    };

    moduloPagoMock = {
      tieneMembresiaVigente: jest.fn().mockResolvedValue(true),
    };

    servicio = crearServicio({
      repositorio: repositorioMock,
      obtenerClientes: () => moduloClienteMock,
      obtenerPagos: () => moduloPagoMock,
    });
  });

  describe('Transición de estados', () => {
    test('flujo completo correcto: sin entrada -> entrada (dentro) -> salida (fuera con permanencia)', async () => {
      const fechaEntrada = '2026-03-01T10:00:00.000Z';
      const fechaSalida = '2026-03-01T11:15:00.000Z';

      // 1. Estado inicial: sin entrada abierta
      repositorioMock.buscarAbiertoPorCliente.mockResolvedValueOnce(null);
      repositorioMock.crearEntrada.mockResolvedValueOnce({
        id_acceso: 101,
        id_cliente: 1,
        fecha_hora_entrada: new Date(fechaEntrada),
        fecha_hora_salida: null,
      });

      const entrada = await servicio.registrarEntrada(1, fechaEntrada);
      expect(entrada.id_acceso).toBe(101);
      expect(entrada.fecha_hora_salida).toBeNull();
      expect(repositorioMock.crearEntrada).toHaveBeenCalledWith({
        id_cliente: 1,
        fecha_hora_entrada: new Date(fechaEntrada),
      });

      // 2. Estado: dentro -> registrar salida
      repositorioMock.buscarAbiertoPorCliente.mockResolvedValueOnce({
        id_acceso: 101,
        id_cliente: 1,
        fecha_hora_entrada: new Date(fechaEntrada),
        fecha_hora_salida: null,
      });
      repositorioMock.cerrarSalida.mockResolvedValueOnce({
        id_acceso: 101,
        id_cliente: 1,
        fecha_hora_entrada: new Date(fechaEntrada),
        fecha_hora_salida: new Date(fechaSalida),
      });

      const salida = await servicio.registrarSalida(1, fechaSalida);
      expect(salida.id_acceso).toBe(101);
      expect(salida.fecha_hora_salida).toEqual(new Date(fechaSalida));
      expect(salida.permanencia_minutos).toBe(75);
    });

    test('intento inválido: salir sin haber entrado lanza ErrorConflicto (409)', async () => {
      repositorioMock.buscarAbiertoPorCliente.mockResolvedValueOnce(null);

      await expect(servicio.registrarSalida(1)).rejects.toMatchObject({
        name: 'ErrorConflicto',
        message: 'El cliente no tiene una entrada abierta',
      });
    });

    test('intento inválido: entrar dos veces consecutivas lanza ErrorConflicto (409)', async () => {
      repositorioMock.buscarAbiertoPorCliente.mockResolvedValueOnce({
        id_acceso: 101,
        id_cliente: 1,
        fecha_hora_entrada: new Date('2026-03-01T10:00:00.000Z'),
        fecha_hora_salida: null,
      });

      await expect(servicio.registrarEntrada(1)).rejects.toMatchObject({
        name: 'ErrorConflicto',
        message: 'El cliente ya tiene una entrada abierta',
      });
    });

    test('intento inválido: salir dos veces consecutivas lanza ErrorConflicto (409) en la segunda salida', async () => {
      const fechaEntrada = '2026-03-01T10:00:00.000Z';
      const fechaSalida = '2026-03-01T11:00:00.000Z';

      // Primera salida (éxito)
      repositorioMock.buscarAbiertoPorCliente.mockResolvedValueOnce({
        id_acceso: 101,
        id_cliente: 1,
        fecha_hora_entrada: new Date(fechaEntrada),
        fecha_hora_salida: null,
      });
      repositorioMock.cerrarSalida.mockResolvedValueOnce({
        id_acceso: 101,
        id_cliente: 1,
        fecha_hora_entrada: new Date(fechaEntrada),
        fecha_hora_salida: new Date(fechaSalida),
      });

      await servicio.registrarSalida(1, fechaSalida);

      // Segunda salida: ya no tiene entrada abierta
      repositorioMock.buscarAbiertoPorCliente.mockResolvedValueOnce(null);
      await expect(servicio.registrarSalida(1, fechaSalida)).rejects.toMatchObject({
        name: 'ErrorConflicto',
        message: 'El cliente no tiene una entrada abierta',
      });
    });
  });

  describe('Casos negativos', () => {
    test('cliente inexistente al registrar entrada lanza ErrorNoEncontrado (404)', async () => {
      moduloClienteMock.clienteExiste.mockResolvedValueOnce(false);

      await expect(servicio.registrarEntrada(999)).rejects.toMatchObject({
        name: 'ErrorNoEncontrado',
        message: 'El cliente con id 999 no existe',
      });
    });

    test('cliente inexistente al registrar salida lanza ErrorNoEncontrado (404)', async () => {
      moduloClienteMock.clienteExiste.mockResolvedValueOnce(false);

      await expect(servicio.registrarSalida(999)).rejects.toMatchObject({
        name: 'ErrorNoEncontrado',
        message: 'El cliente con id 999 no existe',
      });
    });

    test('membresía no vigente al registrar entrada lanza ErrorReglaNegocio (422)', async () => {
      moduloPagoMock.tieneMembresiaVigente.mockResolvedValueOnce(false);

      await expect(servicio.registrarEntrada(1, '2026-03-01T10:00:00Z')).rejects.toMatchObject({
        name: 'ErrorReglaNegocio',
        message: 'Membresía vencida o inexistente',
      });
    });

    test('salida con fecha/hora anterior a la entrada lanza ErrorReglaNegocio (422)', async () => {
      repositorioMock.buscarAbiertoPorCliente.mockResolvedValueOnce({
        id_acceso: 101,
        id_cliente: 1,
        fecha_hora_entrada: new Date('2026-03-01T10:00:00.000Z'),
        fecha_hora_salida: null,
      });

      await expect(
        servicio.registrarSalida(1, '2026-03-01T09:30:00.000Z')
      ).rejects.toMatchObject({
        name: 'ErrorReglaNegocio',
        message: 'La fecha y hora de salida no puede ser anterior a la de entrada',
      });
    });
  });

  describe('Listar accesos', () => {
    test('lista todos los accesos e incluye permanencia_minutos para los cerrados', async () => {
      const entrada1 = new Date('2026-03-01T10:00:00.000Z');
      const salida1 = new Date('2026-03-01T11:00:00.000Z');
      const entrada2 = new Date('2026-03-01T12:00:00.000Z');

      repositorioMock.listar.mockResolvedValueOnce([
        { id_acceso: 1, id_cliente: 1, fecha_hora_entrada: entrada1, fecha_hora_salida: salida1 },
        { id_acceso: 2, id_cliente: 2, fecha_hora_entrada: entrada2, fecha_hora_salida: null },
      ]);

      const lista = await servicio.listar();
      expect(lista).toHaveLength(2);
      expect(lista[0].permanencia_minutos).toBe(60);
      expect(lista[1].permanencia_minutos).toBeUndefined();
    });

    test('filtra accesos por idCliente válido', async () => {
      repositorioMock.listar.mockResolvedValueOnce([
        {
          id_acceso: 1,
          id_cliente: 1,
          fecha_hora_entrada: new Date('2026-03-01T10:00:00Z'),
          fecha_hora_salida: null,
        },
      ]);

      const lista = await servicio.listar({ idCliente: 1 });
      expect(lista).toHaveLength(1);
      expect(repositorioMock.listar).toHaveBeenCalledWith({ id_cliente: 1 });
    });

    test('lanza ErrorValidacion si idCliente en listar no es válido', async () => {
      await expect(servicio.listar({ idCliente: 'invalido' })).rejects.toThrow(
        ErrorValidacion
      );
    });
  });

  describe('obtenerDentro', () => {
    test('obtiene la lista de clientes que están dentro del gimnasio', async () => {
      repositorioMock.listarDentro.mockResolvedValueOnce([
        {
          id_acceso: 5,
          id_cliente: 2,
          nombre: 'Juan Perez',
          cedula: '1710000001',
          fecha_hora_entrada: new Date('2026-03-01T15:00:00.000Z'),
          fecha_hora_salida: null,
        },
      ]);

      const dentro = await servicio.obtenerDentro();
      expect(dentro).toHaveLength(1);
      expect(dentro[0].nombre).toBe('Juan Perez');
      expect(repositorioMock.listarDentro).toHaveBeenCalledTimes(1);
    });
  });

  describe('Carga perezosa con resolución por defecto', () => {
    test('los proveedores por defecto consultan la base de datos si los otros módulos no existen aún', async () => {
      const db = require('../../src/config/db');
      const spyDbQuery = jest.spyOn(db, 'query').mockImplementation(async (sql, params) => {
        if (sql.includes('FROM cliente')) {
          return { rows: params[0] === 77 ? [{ '1': 1 }] : [] };
        }
        if (sql.includes('FROM pago')) {
          return { rows: params[0] === 77 ? [{ '1': 1 }] : [] };
        }
        return { rows: [] };
      });

      const servicioConDefaults = crearServicio({
        repositorio: repositorioMock,
      });

      repositorioMock.buscarAbiertoPorCliente.mockResolvedValueOnce(null);
      repositorioMock.crearEntrada.mockResolvedValueOnce({
        id_acceso: 50,
        id_cliente: 77,
      });

      const acceso = await servicioConDefaults.registrarEntrada(77, '2026-03-01T10:00:00Z');
      expect(acceso.id_acceso).toBe(50);

      spyDbQuery.mockRestore();
    });
  });
});
