'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('orders', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT
      },
      shopId: {
        type: Sequelize.BIGINT
      },
      orderId: {
        type: Sequelize.BIGINT
      },
      orderNumber: {
        type: Sequelize.STRING
      },
      active: {
        type: Sequelize.BOOLEAN
      },
      subtotalPrice: {
        type: Sequelize.STRING
      },
      totalPrice: {
        type: Sequelize.STRING
      },
      totalPriceUsd: {
        type: Sequelize.STRING
      },
      totalWeight: {
        type: Sequelize.STRING
      },
      totalTax: {
        type: Sequelize.FLOAT
      },
      currency: {
        type: Sequelize.STRING
      },
      financialStatus: {
        type: Sequelize.STRING
      },
      fulfillmentStatus: {
        type: Sequelize.STRING
      },
      totalDiscounts: {
        type: Sequelize.FLOAT
      },
      totalLineItemsPrice: {
        type: Sequelize.FLOAT
      },
      note: {
        type: Sequelize.STRING
      },
      processingMethod: {
        type: Sequelize.STRING
      },
      checkoutId: {
        type: Sequelize.BIGINT
      },
      sourceName: {
        type: Sequelize.STRING
      },
      contactEmail: {
        type: Sequelize.STRING
      },
      reference: {
        type: Sequelize.STRING
      },
      confirmed: {
        type: Sequelize.STRING
      },
      orderJson: {
        type: Sequelize.TEXT
      },
      cancelReason: {
        type: Sequelize.STRING
      },
      orderCreatedAt: {
        type: Sequelize.STRING
      },
      orderUpdatedAt: {
        type: Sequelize.STRING
      },
      orderCancelledAt: {
        type: Sequelize.STRING
      },
      orderClosedAt: {
        type: Sequelize.STRING
      },
      orderProcessedAt: {
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
    await queryInterface.dropTable('orders');
  }
};