const router = require('express').Router()
const bitacora = require('../controllers/bitacora.controller')
const Authorize = require('../middlewares/auth.middleware')
const { route } = require('./categorias.routes')

//GET: api/bitacora
router.get('/', Authorize('Administrador'), bitacora.getAll)

module.exports = router