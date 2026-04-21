'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('cutoffs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      vendorId: { type: Sequelize.BIGINT },
      fri1stActive: { type: Sequelize.BOOLEAN },
      fri1stTime: { type: Sequelize.STRING },
      fri2ndActive: { type: Sequelize.BOOLEAN },
      fri2ndTime: { type: Sequelize.STRING },
      mon1stActive: { type: Sequelize.BOOLEAN },
      mon1stTime: { type: Sequelize.STRING },
      mon2ndActive: { type: Sequelize.BOOLEAN },
      mon2ndTime: { type: Sequelize.STRING },
      sat1stActive: { type: Sequelize.BOOLEAN },
      sat1stTime: { type: Sequelize.STRING },
      sat2ndActive: { type: Sequelize.BOOLEAN },
      sat2ndTime: { type: Sequelize.STRING },
      sun1stActive: { type: Sequelize.BOOLEAN },
      sun1stTime: { type: Sequelize.STRING },
      sun2ndActive: { type: Sequelize.BOOLEAN },
      sun2ndTime: { type: Sequelize.STRING },
      thu1stActive: { type: Sequelize.BOOLEAN },
      thu1stTime: { type: Sequelize.STRING },
      thu2ndActive: { type: Sequelize.BOOLEAN },
      thu2ndTime: { type: Sequelize.STRING },
      tue1stActive: { type: Sequelize.BOOLEAN },
      tue1stTime: { type: Sequelize.STRING },
      tue2ndActive: { type: Sequelize.BOOLEAN },
      tue2ndTime: { type: Sequelize.STRING },
      wed1stActive: { type: Sequelize.BOOLEAN },
      wed1stTime: { type: Sequelize.STRING },
      wed2ndActive: { type: Sequelize.BOOLEAN },
      wed2ndTime: { type: Sequelize.STRING },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('cutoffs');
  }
};