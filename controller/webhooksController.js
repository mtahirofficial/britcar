const { db } = require('./dbActions')
const { cda } = require('./customDefinedActions')


const webhooks = {
    test: (req, res) => { return ("Called locations from controller!") },
    CreateWebhook: async (accessToken, shop, webhookType, hostLink) => {
        const requestBody = JSON.stringify({ "webhook": { "topic": webhookType, "address": `${hostLink}/webhook/${webhookType}`, "format": "json" } })

        const options = {
            'method': 'POST',
            'url': `https://${shop}/admin/api/2021-01/webhooks.json`,
            'headers': {
                'content-type': 'application/json',
                'X-Shopify-Access-Token': accessToken,
            },
            data: requestBody
        };
        return await cda.sendAxiosRequest(options)
    },
    appUninstalled: async (req, res) => {
        const { id, myshopify_domain, domain } = req.body;
        const data = { active: false }
        const updated = await db.updateShop(data, domain)
        const deleted = await db.deleteWebhooks(id)
        res.send({ message: "App Uninstalled!", updated, deleted });
    },
    customerDataRequst: (req, res) => res.statusCode(200),
    customerRedact: (req, res) => res.statusCode(200),
    shopDataRedact: (req, res) => res.statusCode(200),
}
module.exports = { webhooks }