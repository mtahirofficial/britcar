"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("purchaseorderitems", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT,
      },
      shopId: {
        type: Sequelize.BIGINT,
      },
      barcode: {
        type: Sequelize.STRING,
      },
      variantId: {
        type: Sequelize.STRING,
      },
      purchaseorderId: {
        type: Sequelize.BIGINT,
      },
      patNum: {
        type: Sequelize.STRING,
      },
      orderId: {
        type: Sequelize.BIGINT,
      },
      orderNumber: {
        type: Sequelize.BIGINT,
      },
      qty: {
        type: Sequelize.STRING,
      },
      received: {
        type: Sequelize.INTEGER,
      },
      notes: {
        type: Sequelize.STRING,
      },
      sku: {
        type: Sequelize.STRING,
      },
      image: {
        type: Sequelize.STRING,
      },
      status: {
        type: Sequelize.STRING,
      },
      description: {
        type: Sequelize.STRING,
      },
      internalRef: {
        type: Sequelize.STRING,
      },
      costPerUnit: {
        type: Sequelize.FLOAT,
      },
      costPlusTax: {
        type: Sequelize.FLOAT,
      },
      grams: {
        type: Sequelize.INTEGER,
      },
      dimensions: {
        type: Sequelize.STRING,
      },
      part_number: {
        type: Sequelize.STRING,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("purchaseorderitems");
  },
};
