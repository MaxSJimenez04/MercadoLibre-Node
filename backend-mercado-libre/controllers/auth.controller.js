const bcrypt = require('bcrypt')
const { usuario, rol, Sequelize } = require('../models')
const { GeneraToken, TiempoRestanteToken } = require('../services/jwttoken.service')

let self = {}

self.login = async function (req, res, next) {
    const { email, password } = req.body

    try {
        let data = await usuario.findOne({
            where: { email: email },
            raw: true,
            attributes: ['id', 'email', 'nombre', 'passwordHash', [Sequelize.col('rol.nombre'), 'rol']],
            include: {model: rol, attributes:[]}
        })

        if(data === null)
            return res.status(401).json({mensaje: 'Usuario o contraseña incorrectos.' })

        const passwordMatch = await bcrypt.compare(password, data.passwordHash)
        if(!passwordMatch)
            return res.status(401).json({mensaje: 'Usuario o contraseña incorrecto. '})

        token = GeneraToken(data.email, data.nombre, data.rol)

        req.bitacora("usuario.login", data.email)

        res.status(200).json({
            email: data.email,
            nombre: data.nombre,
            rol: data.rol,
            jwt: token
        })
    } catch (error) {
        console.log("Error: ", error);
        next(error)
    }
}

self.tiempo = async function(req, res) {
    const tiempo = TiempoRestanteToken(req)

    if(tiempo == null) {
        return res.status(401).send({ mensaje: 'Token inválido o expirado' });
    }

    return res.status(200).send({ tiempo });
}

module.exports = self