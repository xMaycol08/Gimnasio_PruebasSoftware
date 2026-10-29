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

  test('crear - devuelve el registro si es exitoso', async () => {
    repositorioFalso.crear.mockResolvedValue({ id_membresia: 1, nombre: 'anual' });
    const res = await servicio.crear({ nombre: 'anual', precio: 10, duracion_dias: 7 });
    expect(res.id_membresia).toBe(1);
  });

  test('crear - lanza ErrorConflicto si el nombre ya existe (23505)', async () => {
    const errorPg = new Error('duplicado');
    errorPg.code = '23505';
    repositorioFalso.crear.mockRejectedValue(errorPg);
    await expect(servicio.crear({ nombre: 'Semanal', precio: 10, duracion_dias: 7 }))
      .rejects.toThrow(ErrorConflicto);
  });

  // --- PRUEBAS DE LISTAR ---
  test('listar - devuelve todos los registros', async () => {
    repositorioFalso.listar.mockResolvedValue([{ id_membresia: 1 }]);
    const res = await servicio.listar();
    expect(res.length).toBe(1);
  });

  // --- PRUEBAS DE OBTENER ---
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

  // --- PRUEBAS DE ACTUALIZAR ---
  test('actualizar - lanza ErrorNoEncontrado si no existe', async () => {
    repositorioFalso.buscarPorId.mockResolvedValue(null);
    await expect(servicio.actualizar(99, { nombre: 'a', precio: 10, duracion_dias: 7 }))
      .rejects.toThrow(ErrorNoEncontrado);
  });

  test('actualizar - lanza ErrorConflicto si el nombre ya existe', async () => {
    repositorioFalso.buscarPorId.mockResolvedValue({ id_membresia: 1 });
    const errorPg = new Error('duplicado'); 
    errorPg.code = '23505';
    repositorioFalso.actualizar.mockRejectedValue(errorPg);
    await expect(servicio.actualizar(1, { nombre: 'a', precio: 10, duracion_dias: 7 }))
      .rejects.toThrow(ErrorConflicto);
  });

  test('actualizar - devuelve el registro actualizado si es exitoso', async () => {
    repositorioFalso.buscarPorId.mockResolvedValue({ id_membresia: 1 });
    repositorioFalso.actualizar.mockResolvedValue({ id_membresia: 1, nombre: 'nuevo' });
    const res = await servicio.actualizar(1, { nombre: 'nuevo', precio: 10, duracion_dias: 7 });
    expect(res.nombre).toBe('nuevo');
  });

  // --- PRUEBAS DE ELIMINAR ---
  test('eliminar - lanza ErrorNoEncontrado si no existe', async () => {
    repositorioFalso.buscarPorId.mockResolvedValue(null);
    await expect(servicio.eliminar(99)).rejects.toThrow(ErrorNoEncontrado);
  });

  test('eliminar - lanza ErrorConflicto si tiene pagos asociados (23503)', async () => {
    repositorioFalso.buscarPorId.mockResolvedValue({ id_membresia: 1 });
    const errorPg = new Error('llave foranea');
    errorPg.code = '23503';
    repositorioFalso.eliminar.mockRejectedValue(errorPg);
    await expect(servicio.eliminar(1)).rejects.toThrow(ErrorConflicto);
  });

  test('eliminar - no devuelve nada si es exitoso', async () => {
    repositorioFalso.buscarPorId.mockResolvedValue({ id_membresia: 1 });
    repositorioFalso.eliminar.mockResolvedValue();
    await expect(servicio.eliminar(1)).resolves.toBeUndefined();
  });
});