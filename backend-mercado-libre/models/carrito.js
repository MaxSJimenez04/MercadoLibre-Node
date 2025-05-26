'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class carrito extends Model {
    static associate(models) {
      carrito.hasMany(models.usuario, {foreignKey: 'usuarioid'});
      carrito.belongsToMany(models.producto, {through: 'productocarrito', foreignKey: 'idcarrito'});
    }
  }
  carrito.init({
    id: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    idusuario:{
      type: DataTypes.STRING,
      allowNull: false
    },
    actual:{
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    fechacompra:{
      type: DataTypes.DATE
    }
  }, {
    sequelize,
    modelName: 'carrito',
  });
  return carrito;
};