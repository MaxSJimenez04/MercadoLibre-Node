const router = require('express').Router()
const archivos = require('../controllers/archivos.controller')
const Authorize = require('../middlewares/auth.middleware')
const upload = require("../middlewares/upload.middleware")
const { route } = require('./categorias.routes')

//GET: api/archivos
router.get('/', Authorize('Empleado, Administrador'), archivos.getAll)

//GET: api/archivos/5
router.get('/:id', archivos.get)

//GET: api/archivos/5/detalle
router.get('/:id/detalle', Authorize('Empleado, Administrador'), archivos.getDetalle)

//POST: api/archivos
router.post('/',  upload.single("file"), Authorize('Empleado'), archivos.create)

//PUT: api/archivos/5
router.put('/:id',  upload.single("file"), Authorize('Empleado'), archivos.update)

//DELETE: api/archivos/5
router.delete('/:id', Authorize('Empleado'), archivos.delete)

module.exports = router
