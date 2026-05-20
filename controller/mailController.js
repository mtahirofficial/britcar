const { cda } = require("../controller/customDefinedActions");
const { db } = require("./dbActions");
const { purchaseorder, purchaseorderitem, vendor } = require("../models");
const fs = require("fs");
var pdf = require("html-pdf");

const mailController = {
  test: (req, res) => {
    return "Called from mail controller!";
  },
  sendMail: async (req, res) => {
    const { orderId } = req.params;
    try {
      const response = await cda.submitOrder(orderId);
      console.log("sendMail", response);
      res.send(response);
    } catch (error) {
      console.log("error.message", error.message);
      res.status(500).send(error.message);
    }
  },
};
module.exports = { mailController };
