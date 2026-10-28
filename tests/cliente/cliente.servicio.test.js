
const { crearServicio } = require('../../src/modules/cliente/cliente.servicio');
const {
  ErrorNoEncontrado,
  ErrorConflicto,
} = require('../../src/shared/errores');

describe('Servicio de clientes', () => {
  let repositorio;
  let servicio;

  const cliente = {
    id_cliente: 1,
    nombre: 'Juan Perez',
    cedula: '1710034065',
    telefono: '0991234567',
    email: 'juan@example.com',
  };

  const datosNuevos = {
    nombre: 'Maria Lopez',
    cedula: '0926687856',
    telefono: '0987654321',
    email: 'maria@example.com',
  };

  beforeEach(() => {
    repositorio = {
      listar: jest.fn().mockResolvedValue([cliente]),
      obtenerPorId: jest.fn().mockResolvedValue(cliente),
      buscarPorCedula: jest.fn().mockResolvedValue(null),
      buscarPorEmail: jest.fn().mockResolvedValue(null),
      crear: jest.fn().mockImplementation(async (datos) => ({
        id_cliente: 2,
        ...datos,
      })),
      actualizar: jest.fn().mockImplementation(async (id, datos) => ({
        id_cliente: id,
        ...datos,
      })),
      eliminar: jest.fn().mockResolvedValue(true),
    };

    servicio = crearServicio(repositorio);
  });

  test('lista los clientes', async () => {
    await expect(servicio.listar()).resolves.toEqual([cliente]);
  });

  test('consulta un cliente existente', async () => {
    await expect(servicio.obtenerPorId(1)).resolves.toEqual(cliente);
  });

  test('lanza 404 si el cliente no existe', async () => {
    repositorio.obtenerPorId.mockResolvedValue(null);

    await expect(servicio.obtenerPorId(99)).rejects.toBeInstanceOf(
      ErrorNoEncontrado
    );
  });

  test('crea un cliente válido', async () => {
    const resultado = await servicio.crear(datosNuevos);

    expect(resultado.email).toBe('maria@example.com');
    expect(repositorio.crear).toHaveBeenCalled();
  });

  test('rechaza una cédula duplicada', async () => {
    repositorio.buscarPorCedula.mockResolvedValue(cliente);

    await expect(servicio.crear(datosNuevos)).rejects.toBeInstanceOf(
      ErrorConflicto
    );
  });

  test('rechaza un correo duplicado', async () => {
    repositorio.buscarPorEmail.mockResolvedValue(cliente);

    await expect(servicio.crear(datosNuevos)).rejects.toBeInstanceOf(
      ErrorConflicto
    );
  });

  test('actualiza un cliente existente', async () => {
    const resultado = await servicio.actualizar(1, datosNuevos);

    expect(resultado.nombre).toBe('Maria Lopez');
    expect(repositorio.actualizar).toHaveBeenCalled();
  });

  test('no actualiza un cliente inexistente', async () => {
    repositorio.obtenerPorId.mockResolvedValue(null);

    await expect(
      servicio.actualizar(99, datosNuevos)
    ).rejects.toBeInstanceOf(ErrorNoEncontrado);
  });

  test('elimina un cliente existente', async () => {
    await expect(servicio.eliminar(1)).resolves.toBeUndefined();
    expect(repositorio.eliminar).toHaveBeenCalledWith(1);
  });

  test('rechaza eliminar un cliente inexistente', async () => {
    repositorio.obtenerPorId.mockResolvedValue(null);

    await expect(servicio.eliminar(99)).rejects.toBeInstanceOf(
      ErrorNoEncontrado
    );
  });

  test('rechaza eliminar clientes con pagos o accesos asociados', async () => {
    repositorio.eliminar.mockRejectedValue({ code: '23503' });

    await expect(servicio.eliminar(1)).rejects.toBeInstanceOf(
      ErrorConflicto
    );
  });
});
