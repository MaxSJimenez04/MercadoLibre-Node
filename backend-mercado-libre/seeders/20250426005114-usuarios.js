'use strict';

const bcrypt = require('bcrypt')
const crypto = require('crypto')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    

    const AdministradorUUID = crypto.randomUUID()
    const UsuarioUUID = crypto.randomUUID()
    const EmpleadoUUID = crypto.randomUUID()

    await queryInterface.bulkInsert('rol', [
      {id: AdministradorUUID, nombre: 'Administrador', createdAt: new Date(), updatedAt: new Date()},
      {id: EmpleadoUUID, nombre: 'Empleado', createdAt: new Date(), updatedAt: new Date()},
      {id: UsuarioUUID, nombre: 'Usuario', createdAt: new Date(), updatedAt: new Date()}
    ]);

    await queryInterface.bulkInsert('usuario', [
      { id: crypto.randomUUID(), email: 'MLAgvera@mercadolibre.com', passwordHash: await bcrypt.hash('P@ssw0rd', 10), nombre: 'Guillermo Vera', rolid: AdministradorUUID, protegido: true, createdAt: new Date(), updatedAt: new Date()},
      {id: crypto.randomUUID(), email: 'MLEmax@mercadolibre.com', passwordHash: await bcrypt.hash('p@sswordSegur0', 10), nombre: 'Maximiliano Soto', rolid: EmpleadoUUID, protegido: true, createdAt: new Date(), updatedAt: new Date()},
      { id: crypto.randomUUID(), email: 'patito@uv.mx', passwordHash: await bcrypt.hash('Pr0gr4S3gur4', 10), nombre: 'Anas platyrhynchos domesticus', rolid: UsuarioUUID, protegido: false, createdAt: new Date(), updatedAt: new Date()}
    ]);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('rol', null, {})
    await queryInterface.bulkDelete('usuario', null, {})
  }
};
