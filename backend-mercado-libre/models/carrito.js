'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class carrito extends Model {
    static associate(models) {
      carrito.belongsTo(models.usuario, {foreignKey: 'usuarioid'});
      carrito.belongsToMany(models.producto, {through: 'productocarrito', foreignKey: 'idcarrito'});
      carrito.hasMany(models.productocarrito, { foreignKey: 'idcarrito', as: 'itemsCarrito' });
    }
  }
  carrito.init({
    id: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    usuarioid:{
      type: DataTypes.STRING,
      allowNull: false
    },
    actual:{
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    total: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false,
      defaultValue: 0.00
    },
    fechacompra:{
      type: DataTypes.DATE
    }
  }, {
    sequelize,
    freezeTableName: true,
    modelName: 'carrito',
  });
  return carrito;
};