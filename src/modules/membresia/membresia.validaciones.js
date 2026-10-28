const { ErrorValidacion } = require('../../shared/errores');

const validarMembresia = (datos) => {
  const { nombre, precio, duracion_dias } = datos;

  if (typeof nombre !== 'string' || nombre.trim().length < 1 || nombre.trim().length > 30) {
    throw new ErrorValidacion('El nombre es obligatorio y debe tener entre 1 y 30 caracteres');
  }
  
  if (typeof precio !== 'number' || precio < 0 || precio >= 1000000) {
    throw new ErrorValidacion('El precio debe ser mayor a 0 y menor a 1,000,000');
  }
  
  if (!Number.isInteger(duracion_dias) || duracion_dias <= 0) {
    throw new ErrorValidacion('La duración en días debe ser un número entero mayor a 0');
  }

  return { nombre: nombre.trim(), precio, duracion_dias };
};

module.exports = { validarMembresia };