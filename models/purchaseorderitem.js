"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class purchaseorderitem extends Model {
    static associate({ purchaseorder }) {
      this.belongsTo(purchaseorder, { foreignKey: "purchaseorderId" });
    }
  }
  purchaseorderitem.init(
    {
      shopId: DataTypes.BIGINT,
      barcode: DataTypes.STRING,
      variantId: DataTypes.STRING,
      purchaseorderId: DataTypes.BIGINT,
      patNum: DataTypes.STRING,
      orderId: DataTypes.BIGINT,
      orderNumber: DataTypes.BIGINT,
      qty: DataTypes.BIGINT,
      received: DataTypes.INTEGER,
      notes: DataTypes.STRING,
      sku: DataTypes.STRING,
      image: DataTypes.STRING,
      status: DataTypes.STRING,
      description: DataTypes.STRING,
      internalRef: DataTypes.STRING,
      costPerUnit: DataTypes.FLOAT,
      costPlusTax: DataTypes.FLOAT,
      grams: DataTypes.INTEGER,
      dimensions: DataTypes.STRING,
      part_number: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "purchaseorderitem",
    },
  );
  return purchaseorderitem;
};
