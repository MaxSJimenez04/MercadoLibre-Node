const router = require('express').Router()
const carritos = require('../controllers/carritos.controller')
const Authorize = require('../middlewares/auth.middleware')

//GET api/carritos/historial/5
router.get('/historial/:email', Authorize('Usuario'), carritos.getAll);

//GET api/carritos/actual/5
router.get('/actual/:email', Authorize('Usuario'), carritos.get);

//GET api/carritos/detalle/5
router.get('/detalle/:idcarrito', Authorize('Usuario'), carritos.detalle);

//POST api/carritos/
router.post('/', Authorize('Usuario'), carritos.carritoValidator, carritos.create);

//PUT api/carritos/comprar/5
router.put('/comprar/:id', Authorize('Usuario'), carritos.carritoValidator, carritos.comprar);

//POST api/carritos/5/productos/
router.post('/:idcarrito/productos', Authorize('Usuario'), carritos.validaciones.agregarProducto, carritos.agregaProducto);

//PUT api/carritos/5/productos/5
router.put('/:idcarrito/productos/:idproducto', Authorize('Usuario'), carritos.validaciones.modificarCantidad, carritos.modificarCantidad);

//DELETE api/carritos/5/productos/5
router.delete('/:idcarrito/productos/:idproducto', Authorize('Usuario'), carritos.validaciones.eliminarProducto, carritos.quitarProducto);

module.exports = router