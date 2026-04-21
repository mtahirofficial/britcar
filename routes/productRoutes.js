const router = require('express').Router()
const { productController } = require('../controller');

router
    .route("/sku/:id/:shopId")
    .put(productController.updateProductSku)

router
    .route("/metafileds/:key/:variantId/:shopId")
    .post(productController.addMetafields)

router
    .route("/delete")
    .delete(productController.deleteItem)

module.exports = router