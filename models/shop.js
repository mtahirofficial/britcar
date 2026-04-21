'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class shop extends Model {
    static associate({ order }) {
      this.hasMany(order, { foreignKey: 'shopId' });
    }

  };
  shop.init({
    shopId: DataTypes.BIGINT,
    domain: DataTypes.STRING,
    shopDomain: DataTypes.STRING,
    shopName: DataTypes.STRING,
    accessToken: DataTypes.STRING,
    shopOwner: DataTypes.STRING,
    phone: DataTypes.STRING,
    email: DataTypes.STRING,
    customerEmail: DataTypes.STRING,
    address1: DataTypes.TEXT,
    address2: DataTypes.TEXT,
    zip: DataTypes.STRING,
    city: DataTypes.STRING,
    province: DataTypes.STRING,
    provinceCode: DataTypes.STRING,
    country: DataTypes.STRING,
    countryCode: DataTypes.STRING,
    latitude: DataTypes.STRING,
    longitude: DataTypes.STRING,
    currency: DataTypes.STRING,
    moneyFormat: DataTypes.STRING,
    planDisplayName: DataTypes.STRING,
    planName: DataTypes.STRING,
    locationId: DataTypes.BIGINT,
    enabledCurrencies: DataTypes.STRING,
    timezone: DataTypes.STRING,
    primaryLocale: DataTypes.STRING,
    storeCreatedAt: DataTypes.STRING,
    active: DataTypes.BOOLEAN,
    shopifyHost: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'shop',
  });
  return shop;
};