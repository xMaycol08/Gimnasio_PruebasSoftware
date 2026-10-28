const { ErrorNoEncontrado, ErrorConflicto } = require('../../shared/errores');
const { validarMembresia } = require('./membresia.validaciones');

const crearServicio = ({ repositorio = require('./membresia.repositorio') } = {}) => ({
  async crear(datos) {
    const datosValidos = validarMembresia(datos);
    try {
      return await repositorio.crear(datosValidos);
    } catch (error) {
      if (error.code === '23505') {
        throw new ErrorConflicto('El nombre de la membresía ya existe');
      }
      throw error;
    }
  },

  async listar() {
    return await repositorio.listar();
  },

  async obtenerPorId(id) {
    return await repositorio.buscarPorId(id);
  },

  async actualizar(id, datos) {
    const datosValidos = validarMembresia(datos);
    const existe = await this.obtenerPorId(id);
    if (!existe) throw new ErrorNoEncontrado(`No existe la membresía ${id}`);
    
    try {
      return await repositorio.actualizar(id, datosValidos);
    } catch (error) {
      if (error.code === '23505') throw new ErrorConflicto('El nombre de la membresía ya existe');
      throw error;
    }
  },

  async eliminar(id) {
    const existe = await this.obtenerPorId(id);
    if (!existe) throw new ErrorNoEncontrado(`No existe la membresía ${id}`);
    
    try {
      await repositorio.eliminar(id);
    } catch (error) {
      if (error.code === '23503') throw new ErrorConflicto('No se puede eliminar la membresía porque ya tiene pagos registrados');
      throw error;
    }
  }
});

module.exports = crearServicio;