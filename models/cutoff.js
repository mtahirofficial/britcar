'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class cutoff extends Model {
    static associate({ vendor }) {
      this.belongsTo(vendor);
    }
  };
  cutoff.init({
    vendorId: DataTypes.BIGINT,
    fri1stActive: DataTypes.BOOLEAN,
    fri1stTime: DataTypes.STRING,
    fri2ndActive: DataTypes.BOOLEAN,
    fri2ndTime: DataTypes.STRING,
    mon1stActive: DataTypes.BOOLEAN,
    mon1stTime: DataTypes.STRING,
    mon2ndActive: DataTypes.BOOLEAN,
    mon2ndTime: DataTypes.STRING,
    sat1stActive: DataTypes.BOOLEAN,
    sat1stTime: DataTypes.STRING,
    sat2ndActive: DataTypes.BOOLEAN,
    sat2ndTime: DataTypes.STRING,
    sun1stActive: DataTypes.BOOLEAN,
    sun1stTime: DataTypes.STRING,
    sun2ndActive: DataTypes.BOOLEAN,
    sun2ndTime: DataTypes.STRING,
    thu1stActive: DataTypes.BOOLEAN,
    thu1stTime: DataTypes.STRING,
    thu2ndActive: DataTypes.BOOLEAN,
    thu2ndTime: DataTypes.STRING,
    tue1stActive: DataTypes.BOOLEAN,
    tue1stTime: DataTypes.STRING,
    tue2ndActive: DataTypes.BOOLEAN,
    tue2ndTime: DataTypes.STRING,
    wed1stActive: DataTypes.BOOLEAN,
    wed1stTime: DataTypes.STRING,
    wed2ndActive: DataTypes.BOOLEAN,
    wed2ndTime: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'cutoff',
  });
  return cutoff;
};