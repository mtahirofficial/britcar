const nonce = require('nonce')();
const dotenv = require('dotenv').config();
const querystring = require('querystring');
const crypto = require('crypto');
const cookie = require('cookie');
const { db } = require('./dbActions')
const { cda } = require('./customDefinedActions')
const { webhooks } = require('./webhooksController')

const apiKey = process.env.SHOPIFY_API_KEY;
const apiSecret = process.env.SHOPIFY_API_SECRET;
const scopes = process.env.SCOPES;
const hostLink = process.env.HOST;
const APP_PATH = process.env.APP_PATH;
const webhookList = process.env.WEBHOOKS.split(",");

isActive = false;
isInstalled = false;

const installation = {
    createUrl: async (req, res) => {
        const { shop } = req.query;
        console.log("shop", shop);

        if (shop) {
            const result = await db.findShop(shop)
            isInstalled = result.length ? true : false;
            isActive = isInstalled ? result[0].dataValues.active : false;

            if (isInstalled && isActive) {
                isActive = await cda.checkAccessTokenExpiry(result[0].dataValues);
            }

            if (isInstalled && isActive) {
                if (req.header('sec-fetch-dest') === 'iframe') {
                    res.redirect(`orders?host=${result[0].dataValues.shopifyHost}&shop=${shop}`)
                } else {
                    res.redirect(`https://${shop}/admin/apps/${APP_PATH}/orders?host=${result[0].dataValues.shopifyHost}&shop=${shop}`)
                }
            } else {
                const state = nonce();
                const redirectUri = `${hostLink}/callback`
                const installUrl = `https://${shop}/admin/oauth/authorize?client_id=${apiKey}&scope=${scopes}&state=${state}&redirect_uri=${redirectUri}`;
                res.cookie('state', state)
                // res.redirect(installUrl);
                console.log("installUrl", installUrl);

                res.send(`<script>
                    // This runs when the content is loaded
                    window.addEventListener('DOMContentLoaded', function () {
                    // Your function here
                    console.log('Page rendered. Run your function here.');
                    window.parent.location.href = "${installUrl}";
                    // window?.open("${installUrl}", "_parent")
                    });
                // </script>`);
            }
        } else {
            res.send('Missing shop parameter. Please add "?shop=your-shop-name.myshopify.com" to your request');
        }
    },
    installApp: async (req, res) => {
        const { shop, hmac, code, state, host, originalUrl } = req.query;

        if (shop && hmac && code) {
            const msgQuery = Object.assign({}, req.query)
            delete msgQuery['signature']
            delete msgQuery['hmac']
            const message = querystring.stringify(msgQuery);
            const providedHmac = Buffer.from(hmac, 'utf-8');
            const generatedHash = Buffer.from(
                crypto
                    .createHmac('sha256', apiSecret)
                    .update(message)
                    .digest('hex'),
                'utf-8'
            );
            let hashEquals = false;
            try {
                hashEquals = crypto.timingSafeEqual(generatedHash, providedHmac)
            } catch (e) {
                hashEquals = false;
            };

            if (!hashEquals) {
                res.status(400).send('HMAC validation failed')
            }
            const accessResponse = await cda.generateAccessToken(shop, apiKey, apiSecret, code);
            if (accessResponse.access_token) {
                const accessToken = accessResponse.access_token;

                const shopDataSaved = await cda.updateOrCreateShop(shop, accessToken, host)

                for (const webhook of webhookList) {
                    const webhookResponse = await webhooks.CreateWebhook(accessToken, shop, webhook, hostLink)
                    const { id, address, topic } = webhookResponse.webhook
                    const data = { shopId: shopDataSaved.shopId, webhookName: topic, webhookId: id, callbackUrl: address }
                    db.saveWebhook(data)
                }
                res.redirect(`https://${shop}/admin/apps/${APP_PATH}/orders?host=${host}&shop=${shop}`)
            } else {
                const { status, statusText, headers, config, request, data } = accessResponse
                res.status(status).send(statusText);
            }
        } else {
            res.status(400).send('Required Parameters missing')
        }
    },
}
module.exports = { installation }