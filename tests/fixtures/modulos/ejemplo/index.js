const express = require('express');
const asyncHandler = require('../../../../src/shared/asyncHandler');
const { ErrorConflicto } = require('../../../../src/shared/errores');

const router = express.Router();
router.get('/', (_req, res) => res.json({ modulo: 'ejemplo' }));
router.post('/', (_req, res) => res.status(201).json({}));
router.get(
  '/conflicto',
  asyncHandler(async () => {
    throw new ErrorConflicto('ya existe');
  })
);

module.exports = { basePath: '/api/ejemplo', router };
