const { usuario, rol, Sequelize } = require('../models')
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const { raw } = require('mysql2')

let self = {}

//GET: api/usuarios
self.getAll = async function (req, res, next) {
    try {
        const data = await usuario.findAll({
            raw: true,
            attributes: ['id', 'email','nombre', [Sequelize.col('rol.nombre'), 'rol']],
            include: {model: rol, attribute: []}
        })
        res.status(200).json(data)
    } catch (error) {
        next(error)
    }
}

//get: api/usuarios/email
self.get = async function (req, res, next) {
    try {
        const email = req.params.email
        const data = await usuario.findOne({
            where: {email: email},
            raw: true,
            attributes: [ 'id', 'email', 'nombre', [Sequelize.col('rol.nombre'), 'rol']],
            include: {model: rol, attribute: []}
        })

        if(data)
            return res.status(200).json(data)
        res.status(404).send()
    } catch (error) {
        next(error)
    }
}

//POST: api/usuarios
self.create = async function (req, res, next) {
    try {
        const rolusuario = await rol.findOne({where: { nombre: req.body.rol} })
        
        const data = await usuario.create({
            id: crypto.randomUUID(),
            email: req.body.email,
            passwordHash: await bcrypt.hash(req.body.password, 10),
            nombre: req.body.nombre,
            rolid: rolusuario.id
        })
        console.log("contraseña:" + req.body.password);

        req.bitacora("usuarios.crear", data.email)
        res.status(201).json({
            id: data.id,
            email: data.email,
            nombre: data.nombre,
            rolid: rolusuario.nombre
        })
    } catch (error) {
        next(error)
    }
}

//PUT: api/usuarios/email
self.update = async function (req, res, next) {
    try {
        const email = req.params.email
        const rolusuario = await rol.findOne({ where: {nombre: req.body.rol} })
        req.body.rolid = rolusuario.id

        const data = await usuario.update(req.body, {
            where: {email: email},
        })

        if(data[0] === 0)
            return res.status(404).send()

        req.bitacora("usuarios.editar", email)
        res.status(204).send()
    } catch (error) {
        next(error)
    }
}

//DELETE: api/usuarios/email
self.delete = async function (req, res, next) {
    try {
        const email = req.params.email;

    const usuarioEncontrado = await usuario.findOne({ where: { email } });

    if (!usuarioEncontrado) {
      return res.status(404);
    }

    if (usuarioEncontrado.protegido) {
      return res.status(403);
    }

    await usuario.destroy({ where: { email } });

    req.bitacora("usuarios.eliminar", email);
    res.status(204).send();
    } catch (error) {
        next(error)
    }
}

module.exports = self