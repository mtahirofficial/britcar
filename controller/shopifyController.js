require("dotenv").config();
const { default: axios } = require("axios");

const ShopifyController = {
  getProduct: async (productId, domain, accessToken) => {
    let data = JSON.stringify({
      query: `{
        product(id: "gid://shopify/Product/${productId}") {
          # harmonizedSystemCode
          id
          title
          metafields(first: 10) {
            nodes {
              key
              jsonValue
              namespace
              ownerType
              value
            }
          }
          # inventoryItem {
          #   countryCodeOfOrigin
          #   unitCost {
          #     amount
          #   }
          # }
        }
      }`,
      variables: {},
    });
    const config = {
      method: "post",
      maxBodyLength: Infinity,
      url: `https://${domain}/admin/api/2025-07/graphql.json`,
      headers: {
        "x-shopify-access-token": accessToken,
        "Content-Type": "application/json",
      },
      data: data,
    };
    try {
      const response = await axios.request(config);
      return response.data.data.product;
    } catch (error) {
      console.log(error);
      return null;
    }
  },
  getVariant: async (variantId, domain, accessToken) => {
    let data = JSON.stringify({
      query: `{
        productVariant(id: "gid://shopify/ProductVariant/${variantId}") {
          # harmonizedSystemCode
          id
          title
          # metafields(first: 10) {
          #   nodes {
          #     key
          #     jsonValue
          #     namespace
          #     ownerType
          #     value
          #   }
          # }
           inventoryItem {
             countryCodeOfOrigin
             unitCost {
               amount
             }
           }
        }
      }`,
      variables: {},
    });
    const config = {
      method: "post",
      maxBodyLength: Infinity,
      url: `https://${domain}/admin/api/2025-07/graphql.json`,
      headers: {
        "x-shopify-access-token": accessToken,
        "Content-Type": "application/json",
      },
      data: data,
    };
    try {
      const response = await axios.request(config);
      return response.data.data.productVariant;
    } catch (error) {
      console.log(error);
      return null;
    }
  },

  getAppId: async (shop_data) => {
    var data = JSON.stringify({
      query: `#graphql
        query {
          currentAppInstallation {
            id
          }
        }
      `,
    });
    const options = {
      method: "POST",
      url: `https://${shop_data.domain}/${API_VER}/graphql.json`,
      headers: {
        "content-type": "application/json",
        "X-Shopify-Access-Token": shop_data.access_token,
      },
      json: true,
      data: data,
    };
    return await axios(options);
  },

  addMetaFields: async (shop_data, id, value = "true") => {
    try {
      const variables = {
        metafieldsSetInput: [
          {
            namespace: "shipping_rates",
            key: "active",
            type: "boolean",
            value: value,
            ownerId: id,
          },
        ],
      };
      const data = JSON.stringify({
        query: `#graphql
        mutation CreateAppDataMetafield($metafieldsSetInput: [MetafieldsSetInput!]!) {
          metafieldsSet(metafields: $metafieldsSetInput) {
            metafields {
              id
              namespace
              key
              type
              value
            }
            userErrors {
              field
              message
            }
          }
        }`,
        variables,
      });
      const options = {
        method: "POST",
        url: `https://${shop_data.domain}/${API_VER}/graphql.json`,
        headers: {
          "content-type": "application/json",
          "X-Shopify-Access-Token": shop_data.access_token,
        },
        json: true,
        data: data,
      };
      // console.log(options);
      return await axios(options);
    } catch (e) {
      res.json({ success: false, message: e.message });
    }
  },
};

module.exports = { ShopifyController };
