const db = require('../../src/config/db');
const repositorio = require('../../src/modules/acceso/acceso.repositorio');

describe('acceso.repositorio', () => {
  let spyQuery;

  beforeEach(() => {
    spyQuery = jest.spyOn(db, 'query');
  });

  afterEach(() => {
    spyQuery.mockRestore();
  });

  test('crearEntrada ejecuta INSERT y retorna el acceso creado', async () => {
    const fila = {
      id_acceso: 1,
      id_cliente: 10,
      fecha_hora_entrada: new Date('2026-03-01T10:00:00Z'),
      fecha_hora_salida: null,
    };
    spyQuery.mockResolvedValueOnce({ rows: [fila] });

    const resultado = await repositorio.crearEntrada({
      id_cliente: 10,
      fecha_hora_entrada: fila.fecha_hora_entrada,
    });

    expect(spyQuery).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO acceso'),
      [10, fila.fecha_hora_entrada]
    );
    expect(resultado).toEqual(fila);
  });

  test('buscarAbiertoPorCliente retorna el acceso abierto o null si no hay', async () => {
    const fila = { id_acceso: 1, id_cliente: 10, fecha_hora_salida: null };
    spyQuery.mockResolvedValueOnce({ rows: [fila] });

    const encontrado = await repositorio.buscarAbiertoPorCliente(10);
    expect(encontrado).toEqual(fila);

    spyQuery.mockResolvedValueOnce({ rows: [] });
    const noEncontrado = await repositorio.buscarAbiertoPorCliente(99);
    expect(noEncontrado).toBeNull();
  });

  test('buscarPorId retorna el acceso por id o null si no existe', async () => {
    const fila = { id_acceso: 5, id_cliente: 10 };
    spyQuery.mockResolvedValueOnce({ rows: [fila] });

    const resultado = await repositorio.buscarPorId(5);
    expect(resultado).toEqual(fila);

    spyQuery.mockResolvedValueOnce({ rows: [] });
    const noEncontrado = await repositorio.buscarPorId(999);
    expect(noEncontrado).toBeNull();
  });

  test('cerrarSalida ejecuta UPDATE con fecha_hora_salida', async () => {
    const fechaSalida = new Date('2026-03-01T11:00:00Z');
    const fila = { id_acceso: 1, fecha_hora_salida: fechaSalida };
    spyQuery.mockResolvedValueOnce({ rows: [fila] });

    const resultado = await repositorio.cerrarSalida(1, fechaSalida);
    expect(spyQuery).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE acceso SET fecha_hora_salida'),
      [fechaSalida, 1]
    );
    expect(resultado).toEqual(fila);
  });

  test('listar consulta todos los accesos o filtra por id_cliente', async () => {
    spyQuery.mockResolvedValueOnce({ rows: [{ id_acceso: 1 }] });
    const todos = await repositorio.listar();
    expect(todos).toHaveLength(1);
    expect(spyQuery).toHaveBeenCalledWith(expect.stringContaining('SELECT * FROM acceso ORDER BY fecha_hora_entrada DESC'));

    spyQuery.mockResolvedValueOnce({ rows: [{ id_acceso: 2, id_cliente: 7 }] });
    const filtrado = await repositorio.listar({ id_cliente: 7 });
    expect(filtrado).toHaveLength(1);
    expect(spyQuery).toHaveBeenCalledWith(
      expect.stringContaining('WHERE id_cliente = $1'),
      [7]
    );
  });

  test('listarDentro consulta accesos con fecha_hora_salida IS NULL', async () => {
    spyQuery.mockResolvedValueOnce({
      rows: [{ id_acceso: 1, id_cliente: 5, nombre: 'Ana' }],
    });

    const dentro = await repositorio.listarDentro();
    expect(dentro).toHaveLength(1);
    expect(spyQuery).toHaveBeenCalledWith(
      expect.stringContaining('WHERE a.fecha_hora_salida IS NULL')
    );
  });
});
