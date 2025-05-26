const router = require('express').Router()
const productos = require('../controllers/productos.controller')
const Authorize = require('../middlewares/auth.middleware')
const { route } = require('./categorias.routes')

//GET: api/productos
router.get('/', Authorize('Usuario,Administrador,Empleado'), productos.getAll)

//GET: api/productos/5
router.get('/:id', Authorize('Usuario,Administrador,Empleado'), productos.get)

//POST: api/productos
router.post('/', Authorize('Empleado'), productos.productoValidator, productos.create)

//PUT: api/productos/5
router.put('/:id', Authorize('Empleado'), productos.productoValidator, productos.update)

//DELETE: api/productos/5
router.delete('/:id', Authorize('Empleado'), productos.delete)

//POST: api/productos/5/categoria
router.post('/:id/categoria', Authorize('Empleado'), productos.asignaCategoria);

//DELETE: api/productos/5/categoria
router.delete('/:id/categoria/:categoriaid', Authorize('Empleado'), productos.eliminaCategoria);

module.exports = router
