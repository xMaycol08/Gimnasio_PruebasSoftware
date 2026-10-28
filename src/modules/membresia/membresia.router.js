const express = require('express');
const asyncHandler = require('../../shared/asyncHandler');

const crearRouter = (servicio) => {
  const router = express.Router();
  
  router.post('/', asyncHandler(async (req, res) => res.status(201).json(await servicio.crear(req.body))));
  router.get('/', asyncHandler(async (req, res) => res.json(await servicio.listar())));
  router.get('/:id', asyncHandler(async (req, res) => res.json(await servicio.obtenerPorId(Number(req.params.id)))));
  router.put('/:id', asyncHandler(async (req, res) => res.json(await servicio.actualizar(Number(req.params.id), req.body))));
  router.delete('/:id', asyncHandler(async (req, res) => {
    await servicio.eliminar(Number(req.params.id));
    res.status(204).end();
  }));
  
  return router;
};

module.exports = crearRouter;