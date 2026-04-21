'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('vendors', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      shopId: {
        type: Sequelize.BIGINT
      },
      name: {
        type: Sequelize.STRING
      },
      website: {
        type: Sequelize.STRING
      },
      phone: {
        type: Sequelize.STRING
      },
      stockMessage: {
        type: Sequelize.STRING
      },
      sendEmail: {
        type: Sequelize.STRING
      },
      email: {
        type: Sequelize.STRING
      },
      accountNumber: {
        type: Sequelize.STRING
      },
      enabled: {
        type: Sequelize.BOOLEAN
      },
      autoSubmit: {
        type: Sequelize.BOOLEAN
      },
      address: {
        type: Sequelize.TEXT
      },
      replyEmail: {
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
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('vendors');
  }
};