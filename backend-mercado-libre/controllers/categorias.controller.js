const { categoria } = require ('../models')
const { body, validationResult } = require('express-validator');

let self = {}

self.categoriaValidator = [
    body('nombre', 'El campo {0} es obligatorio').not().isEmpty()
]

//GET: api/categorias
self.getAll = async function (req, res, next) {
    try {
        let data = await categoria.findAll({ attributes: [['id', 'categoriaid'], 'nombre', 'protegida'] })
        res.status(200).json(data)
    } catch (error) {
        next(error)
    }
}

//GET: api/categorias/5
self.get = async function (req, res, next) {
    try {
        let id = req.params.id
        let data = await categoria.findByPk(id, {attributes:[['id', 'categoriaId'], 'nombre', 'protegida']})
        if (data) {
            res.status(200).json(data)
        } else {
            res.status(404).send()
        }
    } catch (error) {
        next(error)
    }
}

//POST: api/categorias
self.create = async function (req, res, next) {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) throw new Error(JSON.stringify(errors));

        let data = await categoria.create({
            nombre: req.body.nombre
        })
        //Bitácora
        req.bitacora("categoria.crear", data.id)
        res.status(201).json(data)
    } catch (error) {
        next(error)
    }
}

//PUT: api/categorias/5
self.update = async function (req, res, next) {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) throw new Error(JSON.stringify(errors))

            let id = req.params.id
            let body = req.body

            if (id == null) {
                return res.status(404).send()
            }
            let data = await categoria.update(body, {where: {id: id} })
            if(data[0] == 0)
                return res.status(404).send()

            //Bitácora
            req.bitacora("categoria.editar", id)
            res.status(204).send()
    } catch (error) {
        console.log(error)
        next(error)
    }
}

//DELETE: api/categorias
    self.delete = async function (req, res, next) {
        try {

            if(req.params.id == null){
                return res.status(404).send()
            }
            const id = req.params.id
            

            let data = await categoria.findByPk(id)
            if (!data) {
                return res.status(404).send()
            }

            if(data.protegida){
                return res.status(400).send()
            }

            data = await categoria.destroy({where: { id: id} })
            if (data === 1) {
                req.bitacora("categoria.eliminar", id)
                return res.status(204).send()
            }
            res.status(404).send
        } catch (error) {
            next(error)
        }
    }

module.exports = self