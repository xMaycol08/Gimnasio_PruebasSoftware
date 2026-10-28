
const {
  validarNombre,
  validarCedula,
  validarTelefono,
  validarEmail,
  validarDatosCliente,
} = require('../../src/modules/cliente/cliente.validaciones');

describe('Validaciones del cliente', () => {
  describe('validarNombre', () => {
    test('acepta un nombre válido', () => {
      expect(validarNombre(' Rubén Bustos ')).toBe('Rubén Bustos');
    });

    test('rechaza un nombre vacío', () => {
      expect(() => validarNombre('  ')).toThrow();
    });

    test('rechaza nombres de más de 100 caracteres', () => {
      expect(() => validarNombre('a'.repeat(101))).toThrow();
    });
  });

  describe('validarCedula', () => {
    test('acepta una cédula ecuatoriana válida', () => {
      expect(validarCedula('1710034065')).toBe('1710034065');
    });

    test('rechaza una cédula con menos de 10 dígitos', () => {
      expect(() => validarCedula('171003406')).toThrow();
    });

    test('rechaza una cédula con más de 10 dígitos', () => {
      expect(() => validarCedula('17100340651')).toThrow();
    });

    test('rechaza una cédula con letras', () => {
      expect(() => validarCedula('17100340AB')).toThrow();
    });

    test('rechaza una cédula con dígito verificador incorrecto', () => {
      expect(() => validarCedula('1712345678')).toThrow();
    });
  });

  describe('validarTelefono', () => {
    test('acepta un teléfono de 7 dígitos', () => {
      expect(validarTelefono('2345678')).toBe('2345678');
    });

    test('acepta un teléfono de 15 dígitos', () => {
      expect(validarTelefono('123456789012345')).toBe('123456789012345');
    });

    test('acepta un teléfono opcional vacío', () => {
      expect(validarTelefono('')).toBeNull();
    });

    test('rechaza un teléfono de 6 dígitos', () => {
      expect(() => validarTelefono('123456')).toThrow();
    });

    test('rechaza un teléfono de 16 dígitos', () => {
      expect(() => validarTelefono('1234567890123456')).toThrow();
    });
  });

  describe('validarEmail', () => {
    test('acepta un correo y lo convierte a minúsculas', () => {
      expect(validarEmail('RUBEN@EXAMPLE.COM')).toBe('ruben@example.com');
    });

    test('rechaza un correo sin arroba', () => {
      expect(() => validarEmail('rubenexample.com')).toThrow();
    });

    test('rechaza un correo sin dominio', () => {
      expect(() => validarEmail('ruben@')).toThrow();
    });
  });

  describe('validarDatosCliente', () => {
    test('valida todos los datos de un cliente', () => {
      const resultado = validarDatosCliente({
        nombre: 'Rubén Bustos',
        cedula: '1710034065',
        telefono: '0991234567',
        email: 'RUBEN@EXAMPLE.COM',
      });

      expect(resultado).toEqual({
        nombre: 'Rubén Bustos',
        cedula: '1710034065',
        telefono: '0991234567',
        email: 'ruben@example.com',
      });
    });

    test('rechaza datos incompletos', () => {
      expect(() => validarDatosCliente({
        nombre: 'Rubén Bustos',
      })).toThrow();
    });
  });
});
