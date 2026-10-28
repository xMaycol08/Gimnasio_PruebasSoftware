const {
  ErrorValidacion,
  ErrorNoEncontrado,
  ErrorConflicto,
  ErrorReglaNegocio,
} = require('../../src/shared/errores');
const { crearServicioDePrueba, pagoEjemplo } = require('./helpers');

const datosPago = (cambios = {}) => ({
  id_cliente: 1,
  id_membresia: 1,
  fecha_pago: '2026-03-01',
  monto: 30,
  ...cambios,
});

describe('registrar', () => {
  test('calcula el vencimiento y guarda el pago como PAGADO', async () => {
    const { servicio } = crearServicioDePrueba();
    const pago = await servicio.registrar(datosPago());
    expect(pago).toMatchObject({
      id_cliente: 1,
      fecha_pago: '2026-03-01',
      fecha_vencimiento: '2026-03-31',
      monto: 30,
      estado: 'PAGADO',
    });
  });

  test('respeta el estado PENDIENTE', async () => {
    const { servicio } = crearServicioDePrueba();
    const pago = await servicio.registrar(datosPago({ estado: 'PENDIENTE' }));
    expect(pago.estado).toBe('PENDIENTE');
  });

  test('rechaza datos inválidos antes de consultar a otros módulos', async () => {
    const { servicio } = crearServicioDePrueba();
    await expect(servicio.registrar(datosPago({ monto: -1 }))).rejects.toThrow(ErrorValidacion);
  });

  test('cliente inexistente -> ErrorNoEncontrado', async () => {
    const { servicio } = crearServicioDePrueba();
    await expect(servicio.registrar(datosPago({ id_cliente: 99 }))).rejects.toThrow(ErrorNoEncontrado);
  });

  test('membresía inexistente -> ErrorNoEncontrado', async () => {
    const { servicio } = crearServicioDePrueba();
    await expect(servicio.registrar(datosPago({ id_membresia: 99 }))).rejects.toThrow(
      'No existe la membresía 99'
    );
  });

  test('monto distinto del precio -> ErrorReglaNegocio', async () => {
    const { servicio } = crearServicioDePrueba();
    await expect(servicio.registrar(datosPago({ monto: 29.99 }))).rejects.toThrow(ErrorReglaNegocio);
  });

  test('pago duplicado (mismo cliente, membresía y fecha) -> ErrorConflicto', async () => {
    const { servicio } = crearServicioDePrueba();
    await servicio.registrar(datosPago());
    await expect(servicio.registrar(datosPago())).rejects.toThrow(ErrorConflicto);
  });

  test('un pago anulado no cuenta como duplicado', async () => {
    const { servicio } = crearServicioDePrueba({ pagos: [pagoEjemplo({ estado: 'ANULADO' })] });
    await expect(servicio.registrar(datosPago())).resolves.toMatchObject({ estado: 'PAGADO' });
  });

  describe('renovación', () => {
    const vigente = pagoEjemplo({ fecha_pago: '2026-03-01', fecha_vencimiento: '2026-03-31' });

    test('anticipada: el nuevo periodo empieza al vencer el actual', async () => {
      const { servicio } = crearServicioDePrueba({ pagos: [vigente] });
      const pago = await servicio.registrar(datosPago({ fecha_pago: '2026-03-20' }));
      expect(pago.fecha_vencimiento).toBe('2026-04-30');
    });

    test('tardía: cuenta desde la fecha de pago', async () => {
      const { servicio } = crearServicioDePrueba({ pagos: [vigente] });
      const pago = await servicio.registrar(datosPago({ fecha_pago: '2026-05-10' }));
      expect(pago.fecha_vencimiento).toBe('2026-06-09');
    });

    test('un pago PENDIENTE cuenta desde la fecha de pago aunque haya membresía vigente', async () => {
      const { servicio } = crearServicioDePrueba({ pagos: [vigente] });
      const pago = await servicio.registrar(datosPago({ fecha_pago: '2026-03-20', estado: 'PENDIENTE' }));
      expect(pago.fecha_vencimiento).toBe('2026-04-19');
    });
  });
});

describe('listar y obtenerPorId', () => {
  test('listar devuelve todos los pagos o los de un cliente', async () => {
    const { servicio } = crearServicioDePrueba({
      pagos: [pagoEjemplo({ id_pago: 1, id_cliente: 1 }), pagoEjemplo({ id_pago: 2, id_cliente: 2 })],
    });
    expect(await servicio.listar()).toHaveLength(2);
    expect(await servicio.listar('2')).toHaveLength(1);
  });

  test('listar valida el id_cliente', async () => {
    const { servicio } = crearServicioDePrueba();
    await expect(servicio.listar('abc')).rejects.toThrow(ErrorValidacion);
  });

  test('obtenerPorId devuelve el pago', async () => {
    const { servicio } = crearServicioDePrueba({ pagos: [pagoEjemplo()] });
    expect(await servicio.obtenerPorId('1')).toEqual(pagoEjemplo());
  });

  test('obtenerPorId inexistente -> ErrorNoEncontrado', async () => {
    const { servicio } = crearServicioDePrueba();
    await expect(servicio.obtenerPorId(99)).rejects.toThrow(ErrorNoEncontrado);
  });

  test('obtenerPorId con id inválido -> ErrorValidacion', async () => {
    const { servicio } = crearServicioDePrueba();
    await expect(servicio.obtenerPorId('x')).rejects.toThrow(ErrorValidacion);
  });
});

describe('cambiarEstado', () => {
  test('PENDIENTE -> PAGADO', async () => {
    const { servicio } = crearServicioDePrueba({ pagos: [pagoEjemplo({ estado: 'PENDIENTE' })] });
    expect((await servicio.cambiarEstado(1, 'PAGADO')).estado).toBe('PAGADO');
  });

  test('PAGADO -> ANULADO', async () => {
    const { servicio } = crearServicioDePrueba({ pagos: [pagoEjemplo()] });
    expect((await servicio.cambiarEstado(1, 'ANULADO')).estado).toBe('ANULADO');
  });

  test('un pago ANULADO no cambia más -> ErrorReglaNegocio', async () => {
    const { servicio } = crearServicioDePrueba({ pagos: [pagoEjemplo({ estado: 'ANULADO' })] });
    await expect(servicio.cambiarEstado(1, 'PAGADO')).rejects.toThrow(ErrorReglaNegocio);
  });

  test('estado inválido -> ErrorValidacion', async () => {
    const { servicio } = crearServicioDePrueba({ pagos: [pagoEjemplo()] });
    await expect(servicio.cambiarEstado(1, 'OTRO')).rejects.toThrow(ErrorValidacion);
  });

  test('pago inexistente -> ErrorNoEncontrado', async () => {
    const { servicio } = crearServicioDePrueba();
    await expect(servicio.cambiarEstado(99, 'ANULADO')).rejects.toThrow(ErrorNoEncontrado);
  });
});

describe('vigencia', () => {
  const pagos = [pagoEjemplo({ fecha_pago: '2026-03-01', fecha_vencimiento: '2026-03-31' })];

  test('tieneMembresiaVigente: true a mitad del periodo', async () => {
    const { servicio } = crearServicioDePrueba({ pagos });
    expect(await servicio.tieneMembresiaVigente(1, '2026-03-15')).toBe(true);
  });

  test('tieneMembresiaVigente: false fuera del periodo o sin pagos', async () => {
    const { servicio } = crearServicioDePrueba({ pagos });
    expect(await servicio.tieneMembresiaVigente(1, '2026-06-01')).toBe(false);
    expect(await servicio.tieneMembresiaVigente(2, '2026-03-15')).toBe(false);
  });

  test('tieneMembresiaVigente usa la fecha de hoy si no se indica', async () => {
    const { servicio } = crearServicioDePrueba({ pagos, hoy: () => '2026-03-10' });
    expect(await servicio.tieneMembresiaVigente(1)).toBe(true);
  });

  test('tieneMembresiaVigente valida sus parámetros', async () => {
    const { servicio } = crearServicioDePrueba();
    await expect(servicio.tieneMembresiaVigente(0, '2026-03-15')).rejects.toThrow(ErrorValidacion);
    await expect(servicio.tieneMembresiaVigente(1, '15/03/2026')).rejects.toThrow(ErrorValidacion);
  });

  test('consultarVigencia devuelve vigente y fecha de vencimiento', async () => {
    const { servicio } = crearServicioDePrueba({ pagos });
    expect(await servicio.consultarVigencia(1, '2026-03-15')).toEqual({
      vigente: true,
      fecha_vencimiento: '2026-03-31',
    });
    expect(await servicio.consultarVigencia(1, '2026-06-01')).toEqual({
      vigente: false,
      fecha_vencimiento: null,
    });
  });

  test('consultarVigencia con cliente inexistente -> ErrorNoEncontrado', async () => {
    const { servicio } = crearServicioDePrueba({ pagos });
    await expect(servicio.consultarVigencia(99, '2026-03-15')).rejects.toThrow(ErrorNoEncontrado);
  });
});
