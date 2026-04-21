const router = require('express').Router()
const { webhooks, ordersController } = require('../controller');

router
    .route("/app/uninstalled")
    .post(webhooks.appUninstalled)

router
    .route("/orders/create")
    .post(ordersController.saveOrderToDatabase)

router
    .route("/orders/delete")
    .post(ordersController.deleteOrder)

router
    .route("/orders/updated")
    .post(ordersController.updateOrder)

router
    .route("/orders/edited")
    .post(ordersController.editOrder)

router
    .route("/customers/data_request")
    .post(webhooks.shopDataRedact)

router
    .route("/customers/redact")
    .post(webhooks.customerRedact)

router
    .route("/shop/redact")
    .post(webhooks.shopDataRedact)

module.exports = router