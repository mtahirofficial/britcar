const router = require('express').Router()
const { fileController } = require('../controller');

router
    .route("/generatePDF/:orderId")
    .get(fileController.generatePDF)

module.exports = router