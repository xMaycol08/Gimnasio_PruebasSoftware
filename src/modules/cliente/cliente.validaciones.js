
const { ErrorValidacion } = require('../../shared/errores');

function validarId(id) {
  const idTexto = String(id);

  if (
    id === null ||
    id === undefined ||
    idTexto.trim() === '' ||
    !/^[1-9]\d*$/.test(idTexto)
  ) {
    throw new ErrorValidacion('El id debe ser un entero positivo');
  }

  const idNumero = Number(idTexto);

  if (!Number.isSafeInteger(idNumero)) {
    throw new ErrorValidacion('El id debe ser un entero positivo');
  }

  return idNumero;
}

function validarNombre(nombre) {
  if (typeof nombre !== 'string') {
    throw new ErrorValidacion('El nombre es obligatorio');
  }

  const nombreLimpio = nombre.trim();

  if (nombreLimpio.length < 1 || nombreLimpio.length > 100) {
    throw new ErrorValidacion('El nombre debe tener entre 1 y 100 caracteres');
  }

  return nombreLimpio;
}

function validarCedula(cedula) {
  if (typeof cedula !== 'string' || !/^\d{10}$/.test(cedula)) {
    throw new ErrorValidacion('La cédula debe tener 10 dígitos');
  }

  const provincia = Number(cedula.substring(0, 2));
  const tercerDigito = Number(cedula[2]);

  if (!((provincia >= 1 && provincia <= 24) || provincia === 30)) {
    throw new ErrorValidacion('La provincia de la cédula no es válida');
  }

  if (tercerDigito >= 6) {
    throw new ErrorValidacion('El tercer dígito de la cédula no es válido');
  }

  let suma = 0;

  for (let i = 0; i < 9; i++) {
    let valor = Number(cedula[i]);

    if (i % 2 === 0) {
      valor *= 2;

      if (valor > 9) {
        valor -= 9;
      }
    }

    suma += valor;
  }

  const digitoVerificador = (10 - (suma % 10)) % 10;

  if (digitoVerificador !== Number(cedula[9])) {
    throw new ErrorValidacion('La cédula no es válida');
  }

  return cedula;
}

function validarTelefono(telefono) {
  if (telefono === undefined || telefono === null || telefono === '') {
    return null;
  }

  if (typeof telefono !== 'string' || !/^\d{7,15}$/.test(telefono)) {
    throw new ErrorValidacion('El teléfono debe contener entre 7 y 15 dígitos');
  }

  return telefono;
}

function validarEmail(email) {
  if (typeof email !== 'string') {
    throw new ErrorValidacion('El correo electrónico es obligatorio');
  }

  const emailLimpio = email.trim().toLowerCase();

  if (
    emailLimpio.length > 120 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLimpio)
  ) {
    throw new ErrorValidacion('El correo electrónico no es válido');
  }

  return emailLimpio;
}

function validarDatosCliente(datos) {
  if (!datos || typeof datos !== 'object' || Array.isArray(datos)) {
    throw new ErrorValidacion('Los datos del cliente son obligatorios');
  }

  return {
    nombre: validarNombre(datos.nombre),
    cedula: validarCedula(datos.cedula),
    telefono: validarTelefono(datos.telefono),
    email: validarEmail(datos.email),
  };
}

module.exports = {
  validarId,
  validarNombre,
  validarCedula,
  validarTelefono,
  validarEmail,
  validarDatosCliente,
};
