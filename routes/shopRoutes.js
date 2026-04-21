const router = require('express').Router()
const { shopController } = require('../controller');

router
    .route("/currency/:shopId")
    .get(shopController.getCurrency)

module.exports = router