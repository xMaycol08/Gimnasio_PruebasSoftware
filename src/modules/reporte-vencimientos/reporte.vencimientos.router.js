const express = require('express');
const asyncHandler = require('../../shared/asyncHandler');

const crearRouter = (servicio) => {
  const router = express.Router();

  router.get(
    '/por-vencer',
    asyncHandler(async (req, res) => {
      res.json(await servicio.porVencer({ dias: req.query.dias, fecha: req.query.fecha }));
    })
  );

  router.get(
    '/morosos',
    asyncHandler(async (req, res) => {
      res.json(await servicio.morosos({ fecha: req.query.fecha }));
    })
  );

  return router;
};

module.exports = crearRouter;
