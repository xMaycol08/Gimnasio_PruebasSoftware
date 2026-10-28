const crearServicio = require('../../src/modules/membresia/membresia.servicio');
const { ErrorNoEncontrado, ErrorConflicto } = require('../../src/shared/errores');

describe('Membresia Servicio', () => {
  let repositorioFalso;
  let servicio;

  beforeEach(() => {
    repositorioFalso = {
      crear: jest.fn(),
      listar: jest.fn(),
      buscarPorId: jest.fn(),
      actualizar: jest.fn(),
      eliminar: jest.fn(),
    };
    servicio = crearServicio({ repositorio: repositorioFalso });
  });

  test('crear - lanza ErrorConflicto si el nombre ya existe (23505)', async () => {
    const errorPg = new Error('duplicado');
    errorPg.code = '23505';
    repositorioFalso.crear.mockRejectedValue(errorPg);

    await expect(servicio.crear({ nombre: 'Semanal', precio: 10, duracion_dias: 7 }))
      .rejects.toThrow(ErrorConflicto);
  });

  test('obtenerPorId - devuelve null si no existe', async () => {
    repositorioFalso.buscarPorId.mockResolvedValue(null);
    const res = await servicio.obtenerPorId(99);
    expect(res).toBeNull();
  });

  test('obtenerPorId - devuelve el registro si existe', async () => {
    repositorioFalso.buscarPorId.mockResolvedValue({ id_membresia: 1 });
    const res = await servicio.obtenerPorId(1);
    expect(res.id_membresia).toBe(1);
  });

  test('eliminar - lanza ErrorConflicto si tiene pagos asociados (23503)', async () => {
    repositorioFalso.buscarPorId.mockResolvedValue({ id_membresia: 1 }); // Pasa la verificación de existencia
    const errorPg = new Error('llave foranea');
    errorPg.code = '23503';
    repositorioFalso.eliminar.mockRejectedValue(errorPg);

    await expect(servicio.eliminar(1)).rejects.toThrow(ErrorConflicto);
  });
});