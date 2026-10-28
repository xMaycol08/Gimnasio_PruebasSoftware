const express = require('express');
const asyncHandler = require('../../shared/asyncHandler');
const { ErrorValidacion, ErrorNoEncontrado } = require('../../shared/errores');

const validarId = (idParam) => {
  const id = Number(idParam);
  if (!Number.isInteger(id) || id <= 0) {
    throw new ErrorValidacion('El id de la membresía debe ser un número entero positivo');
  }
  return id;
};

const crearRouter = (servicio) => {
  const router = express.Router();
  
  router.post('/', asyncHandler(async (req, res) => res.status(201).json(await servicio.crear(req.body))));
  
  router.get('/', asyncHandler(async (req, res) => res.json(await servicio.listar())));
  
  router.get('/:id', asyncHandler(async (req, res) => {
    const id = validarId(req.params.id);
    const membresia = await servicio.obtenerPorId(id);
    if (!membresia) throw new ErrorNoEncontrado(`No existe la membresía ${id}`);
    res.json(membresia);
  }));
  
  router.put('/:id', asyncHandler(async (req, res) => {
    const id = validarId(req.params.id);
    res.json(await servicio.actualizar(id, req.body));
  }));
  
  router.delete('/:id', asyncHandler(async (req, res) => {
    const id = validarId(req.params.id);
    await servicio.eliminar(id);
    res.status(204).end();
  }));
  
  return router;
};

module.exports = crearRouter;