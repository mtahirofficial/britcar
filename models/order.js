'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class order extends Model {
    static associate({ shop, orderitem }) {
      this.belongsTo(shop);
      this.hasMany(orderitem, { foreignKey: 'orderId', as: 'items' });
    }
  };
  order.init({
    shopId: DataTypes.BIGINT,
    orderId: {
      type: DataTypes.BIGINT,
      primaryKey: true
    },
    orderNumber: DataTypes.STRING,
    active: DataTypes.BOOLEAN,
    subtotalPrice: DataTypes.STRING,
    totalPrice: DataTypes.STRING,
    totalPriceUsd: DataTypes.STRING,
    totalWeight: DataTypes.STRING,
    totalTax: DataTypes.FLOAT,
    currency: DataTypes.STRING,
    financialStatus: DataTypes.STRING,
    fulfillmentStatus: DataTypes.STRING,
    totalDiscounts: DataTypes.FLOAT,
    totalLineItemsPrice: DataTypes.FLOAT,
    note: DataTypes.STRING,
    processingMethod: DataTypes.STRING,
    checkoutId: DataTypes.BIGINT,
    sourceName: DataTypes.STRING,
    contactEmail: DataTypes.STRING,
    reference: DataTypes.STRING,
    confirmed: DataTypes.STRING,
    orderJson: DataTypes.TEXT,
    cancelReason: DataTypes.STRING,
    orderCreatedAt: DataTypes.STRING,
    orderUpdatedAt: DataTypes.STRING,
    orderCancelledAt: DataTypes.STRING,
    orderClosedAt: DataTypes.STRING,
    orderProcessedAt: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'order',
  });
  return order;
};