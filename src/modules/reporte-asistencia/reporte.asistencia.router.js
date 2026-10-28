const express = require('express');
const asyncHandler = require('../../shared/asyncHandler');

const crearRouter = (servicio) => {
  const router = express.Router();

  router.get(
    '/',
    asyncHandler(async (req, res) => {
      res.json(await servicio.asistencia({ desde: req.query.desde, hasta: req.query.hasta }));
    })
  );

  return router;
};

module.exports = crearRouter;
