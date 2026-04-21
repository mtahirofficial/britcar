const router = require('express').Router()
const { installation } = require('../controller');

router
    .route("/")
    .get(installation.createUrl)

router
    .route("/callback")
    .get(installation.installApp)


module.exports = router