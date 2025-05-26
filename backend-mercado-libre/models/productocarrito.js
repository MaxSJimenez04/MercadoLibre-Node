const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class productocarrito extends Model {
    static associate(models) {
      productocarrito.belongsTo(models.carrito, { foreignKey: 'idcarrito' });
      productocarrito.belongsTo(models.producto, { foreignKey: 'idproducto', as: 'producto' });
    }
  }

  productocarrito.init({
    idcarrito: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      references: { model: 'carritos', key: 'id' }
    },
    idproducto: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: { model: 'productos', key: 'id' }
    },
    cantidad: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    subtotal: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'productocarrito',
    freezeTableName: true,
    timestamps: true
  });

  return productocarrito;
};
