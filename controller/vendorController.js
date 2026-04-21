const { cda } = require("../controller/customDefinedActions");
const { db } = require('./dbActions')
const dbModels = require('../models')
const { shop, cutoff } = dbModels;

const vendorController = {
    test: (req, res) => { return ("Called from vendor controller!") },
    getVendors: async (req, res) => {
        const { shopId } = req.params
        const vendors = await db.getVendors({ shopId })
        res.send(vendors)
    },
    extractVendors: async (req, res) => {
        const { domain } = req.params
        const accessToken = await db.getSingleField(shop, 'accessToken', { domain });
        const shopId = await db.getSingleField(shop, 'shopId', { domain });

        const options = {
            method: 'GET',
            url: `https://${domain}/admin/api/2021-01/products.json?fields=vendor&limit=250`,
            'headers': {
                'content-type': 'application/json',
                'X-Shopify-Access-Token': accessToken,
            },
        }
        const response = await cda.sendAxiosRequest(options);
        const vendors = await db.getVendors({ shopId })

        if (response.products) {
            const vendorNames = vendors.map(({ dataValues }) => { return dataValues.name })
            for (const product of response.products) {
                const { vendor } = product
                if (vendorNames.indexOf(vendor) === -1) {
                    const newVendor = { name: vendor, shopId }
                    const savedVendor = await db.saveVendor(newVendor)
                    vendors.push({
                        ...newVendor,
                        id: savedVendor.dataValues.id, accountNumber: null,
                        address: null,
                        autoSubmit: null,
                        phone: null,
                        website: null,
                        email: null,
                        replyEmail: null,
                        enabled: null,
                        sendEmail: null,
                        stockMessage: null,
                    })
                    vendorNames.push(vendor)
                }
            }
        }
        res.send(vendors)
    },
    saveVendor: async (req, res) => {
        const data = req.body
        const cutoff = data.cutoff
        delete data.cutoff
        const savedVendor = await db.saveVendor(data)
        cutoff.vendorId = savedVendor.dataValues.id
        const savedCutoff = await db.saveCuttoff(cutoff)
        savedVendor.dataValues.cutoff = savedCutoff.dataValues
        res.send({ status: 'saved', res: savedVendor })
    },
    updateVendor: async (req, res) => {
        const data = req.body
        const cutoff = data.cutoff
        cutoff.vendorId = data.id
        delete data.cutoff
        const vendorUpdated = await db.updateVendor(data)
        if (cutoff.id === undefined) {
            const savedCutoff = await db.saveCuttoff(cutoff)
            if (vendorUpdated[0] && savedCutoff.dataValues.id) {
                data.cutoff = savedCutoff.dataValues
            }
        } else {
            const cutoffUpdated = await db.updateCutoff(cutoff)
            if (vendorUpdated[0] && cutoffUpdated[0]) {
                data.cutoff = cutoff
            }
        }
        res.send({ status: 'updated', res: data })
    }

}
module.exports = { vendorController }