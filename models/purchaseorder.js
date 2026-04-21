'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class purchaseorder extends Model {
    static associate({ purchaseorderitem, vendor }) {
      this.hasMany(purchaseorderitem, { foreignKey: 'purchaseorderId' });
      this.belongsTo(vendor, { foreignKey: 'vendorId' });
    }
  };
  purchaseorder.init({
    shopId: DataTypes.BIGINT,
    vendorId: DataTypes.INTEGER,
    costValue: DataTypes.FLOAT,
    costValuePlusVat: DataTypes.FLOAT,
    notes: DataTypes.STRING,
    status: DataTypes.STRING,
    timeUntilCutoff: DataTypes.DATE,
    submittedAt: DataTypes.DATE,
  }, {
    sequelize,
    modelName: 'purchaseorder',
  });
  return purchaseorder;
};