const router = require('express').Router()
const { ordersController } = require('../controller');

router
    .route("/:domain")
    .get(ordersController.createPurchaseOrders)

router
    .route("/poItem/:id/:variantId/:shopId")
    .put(ordersController.receivedProduct)

router
    .route("/statusUpdate/:id/:shopId")
    .put(ordersController.updateOrderStatus)

router
    .route("/replaceProduct/:domain/:searchQuery/:id")
    .get(ordersController.getAlternateProducts)

router
    .route("/purchaseOrders/:shopId")
    .get(ordersController.getPurchaseOrders)

router
    .route("/submit/:id")
    .put(ordersController.submitOrder)

router
    .route("/poItems/:vendorId/:shopId")
    .get(ordersController.fetchPoItems)

router
    .route("/update/:id/:shopId")
    .put(ordersController.updatePO)

router
    .route("/item/update/:id/:shopId")
    .put(ordersController.updatePoItem)

router
    .route("/purchaseOrders/:vendorName/:shopId")
    .post(ordersController.AddProductToOpenPo)

router
    .route("/auto-submit/:orderId/:shopId")
    .get(ordersController.autoSubmit)

module.exports = router