const fs = require('fs');
const os = require('os');
const path = require('path');
const express = require('express');
const cargarModulos = require('../src/cargarModulos');

describe('cargarModulos', () => {
  test('registra los módulos válidos e ignora carpetas con _ o sin index.js', () => {
    const app = express();
    const cargados = cargarModulos(app, path.join(__dirname, 'fixtures', 'modulos'));
    expect(cargados).toEqual(['/api/ejemplo']);
  });

  test('ignora archivos sueltos que no son carpetas', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'modulos-'));
    fs.writeFileSync(path.join(dir, 'suelto.js'), '');
    expect(cargarModulos(express(), dir)).toEqual([]);
  });

  test('lanza error si el módulo no exporta basePath y router', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'modulos-'));
    fs.mkdirSync(path.join(dir, 'roto'));
    fs.writeFileSync(path.join(dir, 'roto', 'index.js'), 'module.exports = {};');
    expect(() => cargarModulos(express(), dir)).toThrow('debe exportar basePath y router');
  });
});
