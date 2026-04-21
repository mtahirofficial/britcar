'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('orderitem', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      shopId: {
        type: Sequelize.BIGINT
      },
      orderId: {
        type: Sequelize.BIGINT
      },
      lineItemId: {
        type: Sequelize.BIGINT
      },
      productId: {
        type: Sequelize.BIGINT
      },
      variantId: {
        type: Sequelize.BIGINT
      },
      name: {
        type: Sequelize.STRING
      },
      quantity: {
        type: Sequelize.INTEGER
      },
      sku: {
        type: Sequelize.STRING
      },
      image: {
        type: Sequelize.STRING
      },
      productType: {
        type: Sequelize.STRING
      },
      barcode: {
        type: Sequelize.STRING
      },
      vendor: {
        type: Sequelize.STRING
      },
      fulfillmentService: {
        type: Sequelize.STRING
      },
      requiresShipping: {
        type: Sequelize.BOOLEAN
      },
      taxable: {
        type: Sequelize.BOOLEAN
      },
      tax: {
        type: Sequelize.FLOAT
      },
      status: {
        type: Sequelize.STRING
      },
      grams: {
        type: Sequelize.INTEGER
      },
      price: {
        type: Sequelize.FLOAT
      },
      dimensions: {
        type: Sequelize.STRING
      },
      productJson: {
        type: Sequelize.TEXT
      },
      totalDiscount: {
        type: Sequelize.FLOAT
      },
      fulfillmentStatus: {
        type: Sequelize.STRING
      },
      fulfillableQuantity: {
        type: Sequelize.INTEGER
      },
      productExists: {
        type: Sequelize.BOOLEAN
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
    await queryInterface.dropTable('orderitem');
  }
};