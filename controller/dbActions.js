const dbModels = require("../models");
const { Op } = require("sequelize");

const { shop, webhook, order, vendor, cutoff, orderitem, purchaseorder } =
  dbModels;

const db = {
  getSingleField: async (model, field, where) => {
    const result = await model.findOne({
      attributes: [field],
      where,
      logging: false,
    });
    return result ? result.dataValues[field] : "";
  },
  getSingleRecord: async (model, where) => {
    const result = await model.findOne({ where, logging: false });
    return result ? result.dataValues : {};
  },
  getVendorCutoffs: async (model, where) => {
    const result = await model.findOne({ where, logging: false });

    const days = {};
    if (result) {
      const vendor = result.dataValues;
      if (vendor.mon1stActive) {
        days.mon = { ...days.mon, first: vendor.mon1stTime };
      }
      if (vendor.mon2ndActive) {
        days.mon = { ...days.mon, last: vendor.mon2ndTime };
      }
      if (vendor.tue1stActive) {
        days.tue = { ...days.tue, first: vendor.tue1stTime };
      }
      if (vendor.tue2ndActive) {
        days.tue = { ...days.tue, last: vendor.tue2ndTime };
      }
      if (vendor.wed1stActive) {
        days.wed = { ...days.wed, first: vendor.wed1stTime };
      }
      if (vendor.wed2ndActive) {
        days.wed = { ...days.wed, last: vendor.wed2ndTime };
      }
      if (vendor.thu1stActive) {
        days.thu = { ...days.thu, first: vendor.thu1stTime };
      }
      if (vendor.thu2ndActive) {
        days.thu = { ...days.thu, last: vendor.thu2ndTime };
      }
      if (vendor.fri1stActive) {
        days.fri = { ...days.fri, first: vendor.fri1stTime };
      }
      if (vendor.fri2ndActive) {
        days.fri = { ...days.fri, last: vendor.fri2ndTime };
      }
      if (vendor.sat1stActive) {
        days.sat = { ...days.sat, first: vendor.sat1stTime };
      }
      if (vendor.sat2ndActive) {
        days.sat = { ...days.sat, last: vendor.sat2ndTime };
      }
      if (vendor.sun1stActive) {
        days.sun = { ...days.sun, first: vendor.sun1stTime };
      }
      if (vendor.sun2ndActive) {
        days.sun = { ...days.sun, last: vendor.sun2ndTime };
      }
    }

    return days;
  },
  getWholeSingleColumn: async (model, field, where) => {
    const result = await model.findAll({
      attributes: [field],
      where,
      logging: false,
    });
    const list = result.map(({ dataValues }) => {
      return dataValues[field];
    });
    return list ? list : "";
  },
  addData: async (model, data) => {
    const created = await model.create(data);
    return created.dataValues;
  },
  getData: async (model, where) => {
    const data = await model.findAll({ where, logging: false });
    const list = data.map(({ dataValues }) => {
      return dataValues;
    });
    return list;
  },
  updateData: async (model, data, where) => {
    const created = await model.update(data, { where, logging: false });
    return created;
  },
  deleteData: async (model, where) => {
    const deleted = await model.destroy({ where, logging: false });
    return deleted;
  },
  getDataWithWhereAndInclude: async (model, include, where, dataOrder) => {
    const result = await model.findAll({
      where,
      include,
      order: dataOrder,
      logging: console.log,
    });
    const data = result.map(({ dataValues }) => {
      return dataValues;
    });
    return data;
  },
  incrementValue: async (model, data, where) => {
    const result = await model.increment(data, { where, logging: false });
    return result;
  },
  // shop
  findShop: async (domain) => {
    const result = await shop.findAll({ where: { domain }, logging: false });
    return result;
  },
  findOneShop: async (domain) => {
    const result = await shop.findOne({
      where: { [Op.or]: [{ domain }, { shopDomain: domain }] },
      logging: false,
    });
    return result;
  },
  saveShop: async (data) => {
    const dataSavedResponse = await shop.create(data);
    return dataSavedResponse;
  },
  updateShop: async (data, domain) => {
    const dataSavedResponse = await shop.update(data, {
      where: { domain },
      logging: false,
    });
    return dataSavedResponse;
  },
  getShopData: async (shopName) => {
    const data = await shop.findAll({
      attributes: ["shop_currency", "service_id"],
      where: { shop_name: shopName },
      logging: false,
    });
    return data.length ? data[0].dataValues : null;
  },

  // orders
  saveOrder: async (data) => {
    const dataSavedResponse = await order.create(data);
    return dataSavedResponse;
  },
  getOrders: async (where) => {
    const orders = await order.findAll({
      // attributes: ['id'],
      where,
      include: {
        model: orderitem,
        as: "items",
      },
      logging: false,
    });
    return orders;
  },

  // orderitem
  saveOrderItems: async (data) => {
    const dataSavedResponse = await orderitem.create(data);
    return dataSavedResponse;
  },
  getSinglePurchaseOrders: async (where) => {
    const purchaseOrders = await purchaseorder.findOne({
      where,
      logging: false,
    });
    return purchaseOrders ?? {};
  },
  getPurchaseOrders: async (where, dataOrder, include) => {
    const purchaseOrders = await purchaseorder.findAll({
      where,
      order: dataOrder,
      include,
      logging: false,
    });
    return purchaseOrders;
  },

  // vendors
  getVendors: async (where) => {
    const dataSavedResponse = await vendor.findAll({
      where,
      include: { model: cutoff },
      logging: false,
    });
    return dataSavedResponse;
  },
  saveVendor: async (data) => {
    const dataSavedResponse = await vendor.create(data);
    return dataSavedResponse;
  },
  updateVendor: async (data) => {
    const dbResponse = await vendor.update(data, {
      where: { id: data.id },
      logging: false,
    });
    return dbResponse;
  },

  // cutoff
  saveCuttoff: async (data) => {
    const dataSavedResponse = await cutoff.create(data);
    return dataSavedResponse;
  },
  updateCutoff: async (data) => {
    const dbResponse = await cutoff.update(data, {
      where: { id: data.id },
      logging: false,
    });
    return dbResponse;
  },
  // webhooks
  saveWebhook: async (data) => {
    const webhookResponse = await webhook.create(data);
    return webhookResponse;
  },
  deleteWebhooks: async (id) => {
    const webhookResponse = await webhook.destroy({
      where: { shopId: id },
      logging: false,
    });
    return webhookResponse;
  },
};
module.exports = { db };
