'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('purchaseorders', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT
      },
      shopId: {
        type: Sequelize.BIGINT
      },
      vendorId: {
        type: Sequelize.INTEGER
      },
      submittedAt: {
        type: Sequelize.STRING
      },
      costValue: {
        type: Sequelize.FLOAT
      },
      costValuePlusVat: {
        type: Sequelize.FLOAT
      },
      timeUntilCutoff: {
        type: Sequelize.DATE
      },
      notes: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    },
      {
        initialAutoIncrement: 10000,
      });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('purchaseorders');
  }
};