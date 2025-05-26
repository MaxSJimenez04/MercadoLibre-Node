const router = require('express').Router()
const categorias = require('../controllers/categorias.controller')
const Authorize = require('../middlewares/auth.middleware')

//GET: api/categorias
router.get('/', Authorize('Usuario,Administrador,Empleado'), categorias.getAll)

//GET: api/categorias/5
router.get('/:id', Authorize('Usuario,Administrador,Empleado'), categorias.get)

//POST: api/categorias
router.post('/', Authorize('Empleado'), categorias.categoriaValidator, categorias.create)

//PUT: api/categorias/5
router.put('/:id', Authorize('Empleado'), categorias.categoriaValidator, categorias.update)

//DELETE: api/categorias/5
router.delete('/:id', Authorize('Empleado'), categorias.delete)

module.exports = router