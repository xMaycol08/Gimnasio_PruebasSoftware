
const express = require('express');
const asyncHandler = require('../../shared/asyncHandler');
const { crearServicio } = require('./cliente.servicio');

const router = express.Router();
const servicio = crearServicio();

router.get('/', asyncHandler(async (req, res) => {
  const clientes = await servicio.listar();
  res.status(200).json(clientes);
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const cliente = await servicio.obtenerPorId(req.params.id);
  res.status(200).json(cliente);
}));

router.post('/', asyncHandler(async (req, res) => {
  const cliente = await servicio.crear(req.body);
  res.status(201).json(cliente);
}));

router.put('/:id', asyncHandler(async (req, res) => {
  const cliente = await servicio.actualizar(req.params.id, req.body);
  res.status(200).json(cliente);
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  await servicio.eliminar(req.params.id);
  res.status(204).end();
}));

module.exports = router;
