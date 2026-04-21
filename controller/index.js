const { installation } = require('./installationController');
const { webhooks } = require('./webhooksController');
const { cda } = require('./customDefinedActions');
const { db } = require('./dbActions');
const { ordersController } = require('./ordersController');
const { productController } = require('./productController');
const { fileController } = require('./fileController');
const { mailController } = require('./mailController');
const { vendorController } = require('./vendorController');
const { shopController } = require('./shopController');


module.exports = {
    installation,
    webhooks,
    cda,
    db,
    ordersController,
    fileController,
    mailController,
    vendorController,
    shopController,
    productController
}