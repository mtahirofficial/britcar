const router = require('express').Router()
const { mailController } = require('../controller');

router
    .route("/send/:orderId")
    .get(mailController.sendMail)

module.exports = router