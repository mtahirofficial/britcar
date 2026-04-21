const { db } = require('./dbActions')
const dbModels = require('../models')

const { shop } = dbModels;

const shopController = {
    test: (req, res) => { return ("Called from shop controller!") },
    getCurrency: async (req, res) => {
        const { shopId } = req.params
        const currency = await db.getSingleField(shop, 'currency', { shopId });
        const moneyFormat = await db.getSingleField(shop, 'moneyFormat', { shopId });
        res.send({ currency, moneyFormat })
    }
}
module.exports = { shopController }