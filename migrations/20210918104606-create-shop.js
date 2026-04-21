'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('shops', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      shopId: { type: Sequelize.BIGINT },
      domain: { type: Sequelize.STRING },
      shopDomain: { type: Sequelize.STRING },
      shopName: { type: Sequelize.STRING },
      accessToken: { type: Sequelize.STRING },
      shopOwner: { type: Sequelize.STRING },
      phone: { type: Sequelize.STRING },
      email: { type: Sequelize.STRING },
      customerEmail: { type: Sequelize.STRING },
      address1: { type: Sequelize.TEXT },
      address2: { type: Sequelize.TEXT },
      zip: { type: Sequelize.STRING },
      city: { type: Sequelize.STRING },
      province: { type: Sequelize.STRING },
      provinceCode: { type: Sequelize.STRING },
      country: { type: Sequelize.STRING },
      countryCode: { type: Sequelize.STRING },
      latitude: { type: Sequelize.STRING },
      longitude: { type: Sequelize.STRING },
      currency: { type: Sequelize.STRING },
      moneyFormat: { type: Sequelize.STRING },
      planDisplayName: { type: Sequelize.STRING },
      planName: { type: Sequelize.STRING },
      locationId: { type: Sequelize.BIGINT },
      enabledCurrencies: { type: Sequelize.STRING },
      timezone: { type: Sequelize.STRING },
      primaryLocale: { type: Sequelize.STRING },
      storeCreatedAt: { type: Sequelize.STRING },
      active: { type: Sequelize.BOOLEAN },
      shopifyHost: { type: Sequelize.STRING },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('shops');
  }
};