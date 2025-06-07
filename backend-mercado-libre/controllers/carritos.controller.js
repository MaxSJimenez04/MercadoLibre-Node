const { Model, where } = require('sequelize');
const { producto, usuario, carrito, productocarrito } = require('../models');
const { body, param, validationResult } = require('express-validator');

let self = {}

async function calcularTotalCarrito(idcarrito) {
  const items = await productocarrito.findAll({ where: { idcarrito } });
  const total = items.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);
  return parseFloat(total.toFixed(2));
}

self.carritoValidator = [
    body('id', 'Carrito no encontrado').not().isEmpty(),
    body('cantidad', 'Cantidad debe ser número positivo').optional().isInt({ min: 0 }),
    body('email', 'Email requerido').notEmpty().isEmail()
]

self.validaciones = {
  crearCarrito: [
    body('idusuario', 'El ID de usuario es obligatorio y debe ser un UUID válido').isUUID()
  ],

  agregarProducto: [
    param('idcarrito', 'El ID del carrito debe ser UUID válido').isUUID(),
    body('idproducto', 'El ID del producto debe ser un número entero positivo').isInt({ min: 1 }),
    body('cantidad', 'La cantidad debe ser un entero positivo mayor que 0').isInt({ min: 1 })
  ],

  modificarCantidad: [
    param('idcarrito', 'El ID del carrito debe ser UUID válido').isUUID(),
    param('idproducto', 'El ID del producto debe ser un número entero positivo').isInt({ min: 1 }),
    body('cantidad', 'La cantidad debe ser un entero positivo mayor que 0').isInt({ min: 1 })
  ],

  eliminarProducto: [
    param('idcarrito', 'El ID del carrito debe ser UUID válido').isUUID(),
    param('idproducto', 'El ID del producto debe ser un número entero positivo').isInt({ min: 1 })
  ]
}

//GET api/carritos/historial/:email
self.getAll = async function(req, res, next) {
    try {
        const { email } = req.params;
        const user = await usuario.findOne({ where: { email } });
        if (!user) return res.status(404).send();

        const data = await carrito.findAll({
          where: { usuarioid: user.id, actual: false },
          include: {
            model: productocarrito,
            as: 'itemsCarrito',
            include: { model: producto, as: 'producto' }
          },
          order: [['createdAt', 'DESC']]
        });

        res.status(200).json(data);
    } catch (error) {
        next(error);
    }
}

//GET api/carritos/actual
self.get = async function(req, res, next) {
     try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json(errors.array());

        const { email } = req.params;
        const user = await usuario.findOne({ where: { email } });
        if (!user) return res.status(404).send();

        let data = await carrito.findOne({
            where: { usuarioid: user.id, actual: true },
            include: [{
                model: productocarrito,
                as: 'itemsCarrito',
                include: [{
                    model: producto,
                    as: 'producto'
                }]
            }],
            order: [['createdAt', 'DESC']]
        });

        if (!data) {
            data = await carrito.create({
                id: require('crypto').randomUUID(),
                usuarioid: user.id,
                actual: true
            });
            req.bitacora('carrito.crear', data.id);
        }


        res.status(data._options.isNewRecord ? 201 : 200).json(data);
    } catch (error) {
        console.error("Error: ", error);
        next(error);
    }
}

//GET api/carritos/detalle/5
self.detalle = async function(req, res, next) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json(errors.array());

        const { idcarrito: id } = req.params;

        const data = await carrito.findOne({
            where: {id: id },
            include: [{
                model: productocarrito,
                as: 'itemsCarrito',
                include: [{
                    model: producto,
                    as: 'producto'
                }]
            }],
            order: [['createdAt', 'DESC']]
        });

        if (!data) return res.status(404).send();

        res.status(200).json(data);
    } catch (error) {
        console.error("Error: ", error);
        next(error);
    }
}


//POST api/carritos
self.create = async function(req, res, next) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json(errors.array());

        const { idusuario } = req.body;

        // Finalizar otros carritos activos, si hubiera
        await carrito.update({ actual: false }, { where: { idusuario, actual: true } });

        let data = await carrito.create({
            id: require('crypto').randomUUID(),
            idusuario,
            actual: true
        });

        req.bitacora('carrito.crear', data.id);
        res.status(201).json(data);
    } catch (error) {
        next(error);
    }
}

//PUT api/carritos/comprar/:id
self.comprar = async function(req, res, next) {
    try {
        const errors = validationResult(req);
        console.log(errors);
        if (!errors.isEmpty()) return res.status(400).json(errors.array());

        const email = req.body.email;
        const fechacompra = req.body.fechacompra;
        console.log(fechacompra);
        const user = await usuario.findOne({ where: { email } });
        if (!user) return res.status(404).send();

        const { id } = req.params;

        if (!user.id || !id) {
            return res.status(400).json({ message: "Faltan datos requeridos (idusuario o id del carrito)." });
        }

        const carritoActual = await carrito.findByPk(id);

        if (!carritoActual || !carritoActual.actual) {
            return res.status(400).json({ message: 'Carrito no válido o ya comprado.' });
        }

        const items = await productocarrito.findAll({ where: { idcarrito: id } });
        const total = items.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);


        await carrito.update({ actual: false, fechacompra: fechacompra }, { where: {usuarioid: user.id, actual: true } });

            const data = await carrito.create({
                id: require('crypto').randomUUID(),
                usuarioid: user.id,
                actual: true
            });

            req.bitacora('carrito.crear', data.id);
            res.status(201).json(data);
    } catch (error) {
        console.error(error);
        next(error);
  }
}

//POST api/carritos/:idcarrito/productos
self.agregaProducto = async function(req, res, next) {
    try {
        const errors = validationResult(req);
        console.log('Errores de validación:', errors.array());
        if (!errors.isEmpty()) return res.status(400).json(errors.array());

        const { idcarrito } = req.params;
        const { idproducto, cantidad } = req.body;

        const prod = await producto.findByPk(idproducto);
        if (!prod) return res.status(404).send();

        const existente = await productocarrito.findOne({
            where: { idcarrito, idproducto }
        });

        if (existente) {
            
            const nuevaCantidad = existente.cantidad + cantidad;
            const nuevoSubtotal = parseFloat((prod.precio * nuevaCantidad).toFixed(2));

            await existente.update({
                cantidad: nuevaCantidad,
                subtotal: nuevoSubtotal
            });
        } else {
            const subtotal = parseFloat((prod.precio * cantidad).toFixed(2));

            await productocarrito.create({
                idcarrito,
                idproducto,
                cantidad,
                subtotal
            });
        }

        const total = await calcularTotalCarrito(idcarrito);
        await carrito.update({ total }, { where: { id: idcarrito } });

        req.bitacora('carrito.agregarProducto', `${idcarrito}:${idproducto}`);
        res.status(201).send();
    } catch (error) {
        next(error);
    }
}

//PUT api/carritos/:idcarrito/productos/:idproducto
self.modificarCantidad = async function(req, res, next) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json(errors.array());

        const { idcarrito, idproducto } = req.params;
        const { cantidad } = req.body;

        const prod = await producto.findByPk(idproducto);
        if (!prod) return res.status(404).send();

        const subtotal = parseFloat((prod.precio * cantidad).toFixed(2));

        let result = await productocarrito.update(
            { cantidad, subtotal },
            { where: { idcarrito, idproducto } }
        );

        if (result[0] === 0) return res.status(404).send();

        const total = await calcularTotalCarrito(idcarrito);
        await carrito.update({ total }, { where: { id: idcarrito } });

        req.bitacora('carrito.modificarProducto', `${idcarrito}:${idproducto}`);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
}

//DELETE api/carritos/:idcarrito/productos/:idproducto
self.quitarProducto = async function(req, res, next) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json(errors.array());

        const { idcarrito, idproducto } = req.params;

        let result = await productocarrito.destroy({
            where: { idcarrito, idproducto }
        });

        if (result === 0) return res.status(404).send();

        const total = await calcularTotalCarrito(idcarrito);
        await carrito.update({ total }, { where: { id: idcarrito } });

        req.bitacora('carrito.eliminarProducto', `${idcarrito}:${idproducto}`);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
}

self.calcularTotalCarrito = calcularTotalCarrito;
module.exports = self;
