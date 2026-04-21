const { cda } = require("../controller/customDefinedActions");
const { db } = require('./dbActions')
const dbModels = require('../models')
const { shop, order, orderitem, vendor, purchaseorder, purchaseorderitem, cutoff, sequelize } = dbModels;
const { Op } = require("sequelize");

const productController = {
    test: async (req, res) => {
        const testRes = await db.addData(shop, { shopId: 123123123 })
        res.send("Called from product controller!")
    },
    addMetafields: async (req, res) => {
        const { key, variantId, shopId } = req.params
        const data = req.body
        let response = {};
        let fields = {};
        let dataForDb;
        let productFound = true

        const accessToken = await db.getSingleField(shop, 'accessToken', { shopId });
        const domain = await db.getSingleField(shop, 'domain', { shopId });
        const productId = await db.getSingleField(orderitem, 'productId', { variantId });

        const headers = {
            'content-type': 'application/json',
            'X-Shopify-Access-Token': accessToken,
        }
        const axiosResponse = await cda.sendAxiosRequest({
            method: 'GET',
            url: `https://${domain}/admin/api/2021-10/products/${productId}/metafields.json`,
            json: true,
            'headers': headers,
        })

        let metafield = { type: 'number_integer' }

        const metafieldPost = {
            namespace: "britcaruk",
            owner_id: productId,
            owner_resource: "product",
        }

        const options = {
            'url': `https://${domain}/admin/api/2021-10/metafields`,
            json: true,
            'headers': headers,
        };

        if (axiosResponse.metafields && axiosResponse.metafields.length > 0) {
            productFound = true
            for (const field of axiosResponse.metafields) {
                fields[field.key] = field.id;
            }
        } else if (axiosResponse.metafields && axiosResponse.metafields.length === 0) {
            productFound = true
        }
        else {
            productFound = false
        }

        const prepareOptions = key => {
            if (fields.hasOwnProperty(key)) {
                options.method = 'PUT';
                metafield.id = fields[key];
                options.url = options.url + '/' + fields[key] + '.json'
            } else {
                options.method = 'POST';
                metafield.key = key;
                metafield = { ...metafield, ...metafieldPost }
                options.url = options.url + '.json'
            }
        }

        if (productFound) {

            if (key === 'weight') {

                dataForDb = { [key]: data[key] }
                metafield.type = 'number_decimal';

                prepareOptions(key)
                metafield.value = data[key];
                response.weight = await cda.sendAxiosRequest({ ...options, data: { metafield } })

            } else {

                response = { dimensions: {} }
                dataForDb = { [key]: `${data[key].width}x${data[key].height}x${data[key].length}` }

                for (const dKey in data.dimensions) {
                    options.url = `https://${domain}/admin/api/2021-10/metafields`;
                    prepareOptions(dKey)
                    metafield.value = data.dimensions[dKey];
                    response.dimensions[dKey] = await cda.sendAxiosRequest({ ...options, data: { metafield } })
                }
                await db.updateData(purchaseorderitem, dataForDb, { id: data.itemId })
            }
            res.send({ response, dataForDb, isTrue: productFound })
        } else {
            if (key === 'dimensions') {
                dataForDb = { [key]: `${data[key].width}x${data[key].height}x${data[key].length}` }
                await db.updateData(purchaseorderitem, dataForDb, { id: data.itemId })
            }
            res.send({ response: "Data updated in app but Product not found in stock!", dataForDb, isTrue: productFound })
        }
    },
    updateProductSku: async (req, res) => {
        const { id, shopId } = req.params
        const data = req.body

        const accessToken = await db.getSingleField(shop, 'accessToken', { shopId });
        const domain = await db.getSingleField(shop, 'domain', { shopId });
        const variantResponse = await cda.getVariant(domain, id, accessToken)

        const response = {};
        if (variantResponse.variant) {
            response.isTrue = true
            const variant = variantResponse.variant
            if (variant.sku !== data.bin) {
                response.saved = false
                const requestData = {
                    variant: {
                        sku: data.bin,
                    }
                }

                const options = {
                    'method': 'PUT',
                    'url': `https://${domain}/admin/api/2021-10/variants/${id}.json`,
                    json: true,
                    'headers': {
                        'content-type': 'application/json',
                        'X-Shopify-Access-Token': accessToken,
                    },
                    data: requestData
                };

                const axiosResponse = await cda.sendAxiosRequest(options)
                if (axiosResponse.variant) {
                    response.variant = axiosResponse.variant
                }
                const b = await db.updateData(purchaseorderitem, { sku: data.bin }, { id: data.poItemId })
            } else {
                response.saved = true
                response.msg = 'Already saved!'
            }
        } else {
            const b = await db.updateData(purchaseorderitem, { sku: data.bin }, { id: data.poItemId })
            response.msg = 'Data updated in app but Product not found in stock!'
            response.isTrue = false
            response.saved = false
            response.bin = data.bin
        }
        res.send(response)
    },
    deleteItem: async (req, res) => {
        const { orderId, productId, shopId, qty } = req.body
        const variantId = await db.getSingleField(purchaseorderitem, 'variantId', { id: productId })

        //#region update quantity in stock
        const shopData = await db.getSingleRecord(shop, { shopId });
        const response = await cda.getVariant(shopData.domain, variantId, shopData.accessToken)
        const adjustableQty = Number(qty)
        let qtyUpdated
        if (response.variant) {
            qtyUpdated = await cda.adjustQty(response.variant.inventory_item_id, adjustableQty, shopData)
        }
        //#endregion

        const dbResponse = await db.deleteData(purchaseorderitem, { id: productId, purchaseorderId: orderId, shopId })
        res.send({ dbResponse });
    }
}
module.exports = { productController }