
jest.mock('../../src/config/db', () => ({
  query: jest.fn(),
}));

const db = require('../../src/config/db');
const repositorio = require('../../src/modules/cliente/cliente.repositorio');

describe('Repositorio de clientes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('busca correos sin distinguir mayúsculas y minúsculas', async () => {
    db.query.mockResolvedValue({
      rows: [
        {
          id_cliente: 1,
          nombre: 'Juan Perez',
          cedula: '1710034065',
          telefono: '0991234567',
          email: 'JUAN@EXAMPLE.COM',
        },
      ],
    });

    const resultado = await repositorio.buscarPorEmail('juan@example.com');

    expect(resultado).not.toBeNull();
    expect(resultado.email).toBe('JUAN@EXAMPLE.COM');
    expect(db.query.mock.calls[0][0]).toContain(
      'LOWER(email) = LOWER($1)'
    );
  });
});
