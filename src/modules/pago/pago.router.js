const express = require('express');
const asyncHandler = require('../../shared/asyncHandler');

const crearRouter = (servicio) => {
  const router = express.Router();

  router.post(
    '/',
    asyncHandler(async (req, res) => {
      res.status(201).json(await servicio.registrar(req.body));
    })
  );

  router.get(
    '/',
    asyncHandler(async (req, res) => {
      res.json(await servicio.listar(req.query.id_cliente));
    })
  );

  // Debe ir antes de '/:id' para que "vigencia" no se tome como un id.
  router.get(
    '/vigencia/:idCliente',
    asyncHandler(async (req, res) => {
      res.json(await servicio.consultarVigencia(req.params.idCliente, req.query.fecha));
    })
  );

  router.get(
    '/:id',
    asyncHandler(async (req, res) => {
      res.json(await servicio.obtenerPorId(req.params.id));
    })
  );

  router.patch(
    '/:id/estado',
    asyncHandler(async (req, res) => {
      res.json(await servicio.cambiarEstado(req.params.id, (req.body || {}).estado));
    })
  );

  return router;
};

module.exports = crearRouter;
