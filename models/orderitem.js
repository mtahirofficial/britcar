'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class orderitem extends Model {
    static associate({ order }) {
      this.belongsTo(order, { foreignKey: 'orderId' });
    }
  };
  orderitem.init({
    shopId: DataTypes.BIGINT,
    orderId: DataTypes.BIGINT,
    lineItemId: DataTypes.BIGINT,
    productId: DataTypes.BIGINT,
    variantId: DataTypes.BIGINT,
    name: DataTypes.STRING,
    quantity: DataTypes.INTEGER,
    sku: DataTypes.STRING,
    image: DataTypes.STRING,
    productType: DataTypes.STRING,
    barcode: DataTypes.STRING,
    vendor: DataTypes.STRING,
    fulfillmentService: DataTypes.STRING,
    requiresShipping: DataTypes.BOOLEAN,
    taxable: DataTypes.BOOLEAN,
    tax: DataTypes.FLOAT,
    status: DataTypes.STRING,
    grams: DataTypes.INTEGER,
    price: DataTypes.FLOAT,
    dimensions: DataTypes.STRING,
    productJson: DataTypes.TEXT,
    totalDiscount: DataTypes.FLOAT,
    fulfillmentStatus: DataTypes.STRING,
    fulfillableQuantity: DataTypes.INTEGER,
    productExists: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'orderitem',
  });
  return orderitem;
};