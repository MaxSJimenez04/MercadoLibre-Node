jest.mock('express-validator', () => {
  const actual = jest.requireActual('express-validator');
  return {
    ...actual,
    validationResult: jest.fn(() => ({
      isEmpty: () => true,
      array: () => [],
    })),
    body: jest.fn(() => ({
      not     : () => ({ isEmpty: () => true, isUUID: () => true }),
      isUUID  : () => true,
      isEmpty : () => true,
      notEmpty: () => ({ isEmail: () => true }),
      optional: () => ({ isInt: () => true }),
      isEmail : () => true,
      isInt   : () => true,
    })),
  };
});

jest.mock('../models', () => ({
  producto: {
    findByPk:   jest.fn(),
  },
  productocarrito: {
    findOne : jest.fn(),
    create  : jest.fn(),
    update  : jest.fn(),
    destroy : jest.fn(),
    findAll : jest.fn(),
  },
  carrito: {
    update   : jest.fn(),
    create   : jest.fn(),
    findByPk : jest.fn(),
  },
}));

const { validationResult } = require('express-validator');
const controller = require('../controllers/carritos.controller');   // <-- usa los mocks
const { producto, productocarrito, carrito } = require('../models');

// -----------------------------------------------------------------------------

describe('Carrito Controller', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      params  : { idcarrito: 'carrito-123', idproducto: 10 },
      body    : { idproducto: 10, cantidad: 2 },
      bitacora: jest.fn(),
    };
    res = {
      status: jest.fn().mockReturnThis(),
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
  describe('agregaProducto', () => {
    it('crea un nuevo registro y actualiza el total', async () => {
      producto.findByPk.mockResolvedValue({ id: 10, precio: 15.5 });
      productocarrito.findOne.mockResolvedValue(null);
      productocarrito.create.mockResolvedValue({});
      productocarrito.findAll.mockResolvedValue([
        { subtotal: '50' }, { subtotal: '50' },
      ]);
      carrito.update.mockResolvedValue([1]);

      await controller.agregaProducto(req, res, next);

      expect(productocarrito.create).toHaveBeenCalledWith({
        idcarrito : 'carrito-123',
        idproducto: 10,
        cantidad  : 2,
        subtotal  : 31,
      });

      expect(carrito.update).toHaveBeenCalledWith(
        { total: 100 },
        { where: { id: 'carrito-123' } },
      );

      expect(req.bitacora).toHaveBeenCalledWith(
        'carrito.agregarProducto',
        'carrito-123:10',
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.send).toHaveBeenCalled();
    });
  });

  // ---------------------------------------------------------------------------
  describe('modificarCantidad', () => {
    beforeEach(() => {
      req.params = { idcarrito: 'carrito-123', idproducto: 10 };
      req.body   = { cantidad: 5 };
    });

    it('actualiza la cantidad y el total', async () => {
      producto.findByPk.mockResolvedValue({ precio: 20 });
      productocarrito.update.mockResolvedValue([1]);
      productocarrito.findAll.mockResolvedValue([
        { subtotal: '50' }, { subtotal: '50' }, { subtotal: '50' }, { subtotal: '50' },
      ]);
      carrito.update.mockResolvedValue([1]);

      await controller.modificarCantidad(req, res, next);

      expect(productocarrito.update).toHaveBeenCalledWith(
        { cantidad: 5, subtotal: 100 },      // 20 × 5
        { where: { idcarrito: 'carrito-123', idproducto: 10 } },
      );

      expect(carrito.update).toHaveBeenCalledWith(
        { total: 200 },
        { where: { id: 'carrito-123' } },
      );

      expect(req.bitacora).toHaveBeenCalledWith(
        'carrito.modificarProducto',
        'carrito-123:10',
      );
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });
  });

  // ---------------------------------------------------------------------------
  describe('quitarProducto', () => {
    beforeEach(() => {
      req.params = { idcarrito: 'carrito-123', idproducto: 10 };
      delete req.body;
    });

    it('elimina un producto y recalcula el total', async () => {
      productocarrito.destroy.mockResolvedValue(1);
      // 2 ítems → 120
      productocarrito.findAll.mockResolvedValue([
        { subtotal: '60' }, { subtotal: '60' },
      ]);
      carrito.update.mockResolvedValue([1]);

      await controller.quitarProducto(req, res, next);

      expect(productocarrito.destroy).toHaveBeenCalledWith({
        where: { idcarrito: 'carrito-123', idproducto: 10 },
      });

      expect(carrito.update).toHaveBeenCalledWith(
        { total: 120 },
        { where: { id: 'carrito-123' } },
      );

      expect(req.bitacora).toHaveBeenCalledWith(
        'carrito.eliminarProducto',
        'carrito-123:10',
      );
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });
  });
});
