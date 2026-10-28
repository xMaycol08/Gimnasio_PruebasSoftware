const { ErrorNoEncontrado, ErrorConflicto } = require('../../shared/errores');
const { validarMembresia } = require('./membresia.validaciones');

const crearServicio = ({ repositorio = require('./membresia.repositorio') } = {}) => ({
  async crear(datos) {
    const datosValidos = validarMembresia(datos);
    try {
      return await repositorio.crear(datosValidos);
    } catch (error) {
      if (error.code === '23505') throw new ErrorConflicto('El nombre de la membresía ya existe');
      throw error;
    }
  },

  async listar() {
    return repositorio.listar();
  },

  async obtenerPorId(id) {
    const membresia = await repositorio.buscarPorId(id);
    if (!membresia) throw new ErrorNoEncontrado(`No existe la membresía ${id}`);
    return membresia;
  },

  async actualizar(id, datos) {
    const datosValidos = validarMembresia(datos);
    await this.obtenerPorId(id); // Verifica existencia
    try {
      return await repositorio.actualizar(id, datosValidos);
    } catch (error) {
      if (error.code === '23505') throw new ErrorConflicto('El nombre de la membresía ya existe');
      throw error;
    }
  },

  async eliminar(id) {
    await this.obtenerPorId(id); // Verifica existencia
    try {
      await repositorio.eliminar(id);
    } catch (error) {
      if (error.code === '23503') {
        throw new ErrorConflicto('No se puede eliminar la membresía porque ya tiene pagos registrados');
      }
      throw error;
    }
  }
});

module.exports = crearServicio;