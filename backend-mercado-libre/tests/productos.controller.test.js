jest.mock('express-validator', () => {
  const actual = jest.requireActual('express-validator');
  return {
    ...actual,
    validationResult: jest.fn(() => ({
      isEmpty: () => true,
      array  : () => [],
    })),
  };
});

jest.mock('../models', () => ({
  producto: {
    create: jest.fn(),
    update: jest.fn(),
  },
}));

const { validationResult } = require('express-validator');
const controller = require('../controllers/productos.controller');
const { producto } = require('../models');

// -----------------------------------------------------------------------------
describe('Productos Controller', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      params : {},
      body   : {},
      bitacora: jest.fn(),
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json  : jest.fn(),
      send  : jest.fn(),
    };
    next = jest.fn();

    validationResult.mockReturnValue({
      isEmpty: () => true,
      array  : () => [],
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ---------------------------------------------------------------------------
  describe('create', () => {
    it('crea un producto y devuelve 201', async () => {
      req.body = {
        titulo      : 'Pastel Tres Leches',
        descripcion : 'Delicioso pastel tradicional',
        precio      : 250.00,
        archivoid   : 7,
      };

      producto.create.mockResolvedValue({
        id          : 15,
        ...req.body,
      });

      await controller.create(req, res, next);

      expect(producto.create).toHaveBeenCalledWith({
        titulo      : 'Pastel Tres Leches',
        descripcion : 'Delicioso pastel tradicional',
        precio      : 250.00,
        archivoid   : 7,
      });

      expect(req.bitacora).toHaveBeenCalledWith('producto.crear', 15);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ id: 15, titulo: 'Pastel Tres Leches' })
      );
      expect(next).not.toHaveBeenCalled();
    });
  });

  // ---------------------------------------------------------------------------
  describe('update', () => {
    beforeEach(() => {
      req.params = { id: 15 };
      req.body   = { precio: 275.00 };
    });

    it('actualiza un producto existente y devuelve 204', async () => {
      producto.update.mockResolvedValue([1]);

      await controller.update(req, res, next);

      expect(producto.update).toHaveBeenCalledWith(
        { precio: 275.00 },
        { where: { id: 15 } }
      );

      expect(req.bitacora).toHaveBeenCalledWith('producto.editar', 15);
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });
  });
});
