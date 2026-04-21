'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class vendor extends Model {
    static associate({ purchaseorder, cutoff }) {
      this.hasMany(purchaseorder, { foreignKey: 'vendorId' });
      this.hasOne(cutoff);

    }
  };
  vendor.init({
    shopId: DataTypes.BIGINT,
    name: DataTypes.STRING,
    website: DataTypes.STRING,
    phone: DataTypes.STRING,
    stockMessage: DataTypes.STRING,
    sendEmail: DataTypes.STRING,
    email: DataTypes.STRING,
    accountNumber: DataTypes.STRING,
    enabled: DataTypes.BOOLEAN,
    autoSubmit: DataTypes.BOOLEAN,
    address: DataTypes.TEXT,
    replyEmail: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'vendor',
  });
  return vendor;
};