const router = require('express').Router()
const { vendorController } = require('../controller');

router
    .route("/extract/:domain")
    .get(vendorController.extractVendors)

router
    .route("/:shopId")
    .get(vendorController.getVendors)

router
    .route("/")
    .post(vendorController.saveVendor)
    .put(vendorController.updateVendor)

module.exports = router