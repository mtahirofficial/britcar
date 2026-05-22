const nonce = require("nonce")();
const dotenv = require("dotenv").config();
const querystring = require("querystring");
const crypto = require("crypto");
const cookie = require("cookie");
const { db } = require("./dbActions");
const { cda } = require("./customDefinedActions");
const { webhooks } = require("./webhooksController");

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
    if (shop) {
      const result = await db.findOneShop(shop);
      isInstalled = result ? true : false;
      isActive = isInstalled ? result.active : false;

      if (isInstalled && isActive) {
        isActive = await cda.checkAccessTokenExpiry(result);
      }

      if (isInstalled && isActive) {
        // if (req.header("sec-fetch-dest") === "iframe") {
        //   res.redirect(`orders?host=${result.shopifyHost}&shop=${shop}`);
        // } else {
        //   res.redirect(
        //     `https://${shop}/admin/apps/${APP_PATH}/orders?host=${result.shopifyHost}&shop=${shop}`,
        //   );
        // }

        const app_url = `https://admin.shopify.com/store/${shop.replace(".myshopify.com", "")}/apps/${APP_PATH}/orders?host=${result.shopifyHost}&shop=${shop}`;

        res.send(`
          <script>
            const appUrl = ${JSON.stringify(app_url)};

            window.addEventListener('DOMContentLoaded', function () {
              console.log('/', appUrl);
              window.parent.location.href = appUrl;
            });
          </script>
          `);
      } else {
        const state = nonce();
        const redirectUri = `${hostLink}/callback`;
        const installUrl = `https://${shop}/admin/oauth/authorize?client_id=${apiKey}&scope=${scopes}&state=${state}&redirect_uri=${redirectUri}`;
        res.cookie("state", state);
        // res.redirect(installUrl);

        res.send(`
          <script>
            const installUrl = ${JSON.stringify(installUrl)};

            window.addEventListener('DOMContentLoaded', function () {
              console.log("installUrl", installUrl);
              window.parent.location.href = installUrl;
            });
          </script>
          `);
      }
    } else {
      res.send(
        'Missing shop parameter. Please add "?shop=your-shop-name.myshopify.com" to your request',
      );
    }
  },
  installApp: async (req, res) => {
    const { shop, hmac, code, state, host, originalUrl } = req.query;

    if (shop && hmac && code) {
      const msgQuery = Object.assign({}, req.query);
      delete msgQuery["signature"];
      delete msgQuery["hmac"];
      const message = querystring.stringify(msgQuery);
      const providedHmac = Buffer.from(hmac, "utf-8");
      const generatedHash = Buffer.from(
        crypto.createHmac("sha256", apiSecret).update(message).digest("hex"),
        "utf-8",
      );
      let hashEquals = false;
      try {
        hashEquals = crypto.timingSafeEqual(generatedHash, providedHmac);
      } catch (e) {
        hashEquals = false;
      }

      if (!hashEquals) {
        res.status(400).send("HMAC validation failed");
      }
      const accessResponse = await cda.generateAccessToken(
        shop,
        apiKey,
        apiSecret,
        code,
      );
      if (accessResponse.access_token) {
        const accessToken = accessResponse.access_token;

        const shopDataSaved = await cda.updateOrCreateShop(
          shop,
          accessToken,
          host,
        );

        for (const webhook of webhookList) {
          const webhookResponse = await webhooks.CreateWebhook(
            accessToken,
            shop,
            webhook,
            hostLink,
          );
          if (webhookResponse.webhook) {
            const { id, address, topic } = webhookResponse.webhook;
            const data = {
              shopId: shopDataSaved.shopId,
              webhookName: topic,
              webhookId: id,
              callbackUrl: address,
            };
            db.saveWebhook(data);
          } else {
            console.log(`Failed to create webhook ${webhook} for shop ${shop}`);
          }
        }
        // res.redirect(
        //   `https://${shop}/admin/apps/${APP_PATH}/orders?host=${host}&shop=${shop}`,
        // );
        const app_url = `https://admin.shopify.com/store/${shop.replace(".myshopify.com", "")}/apps/${APP_PATH}/orders?host=${host}&shop=${shop}`;

        res.send(`
<script>
  const app_url = ${JSON.stringify(app_url)};

  window.addEventListener('DOMContentLoaded', function () {
    console.log("install app_url", app_url);
    window.parent.location.href = app_url;
  });
</script>
`);
      } else {
        const { status, statusText, headers, config, request, data } =
          accessResponse;
        res.status(status).send(statusText);
      }
    } else {
      res.status(400).send("Required Parameters missing");
    }
  },
};
module.exports = { installation };
