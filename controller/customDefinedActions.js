const axios = require("axios");
const { Op } = require("sequelize");
const { db } = require("./dbActions.js");
const dbModels = require("../models");
const nodemailer = require("nodemailer");
const fs = require("fs");
var pdf = require("html-pdf");
const { ShopifyController } = require("./shopifyController.js");
const {
  shop,
  webhook,
  order,
  vendor,
  cutoff,
  orderitem,
  purchaseorder,
  purchaseorderitem,
  sequelize,
} = dbModels;

const cda = {
  checkAccessTokenExpiry: async (shop) => {
    const { domain, accessToken } = shop;
    const options = {
      method: "GET",
      url: `https://${domain}/admin/api/2021-04/shop.json`,
      headers: {
        "content-type": "application/json",
        "X-Shopify-Access-Token": accessToken,
      },
    };
    const response = await cda.sendAxiosRequest(options);
    const errorText =
      "[API] Invalid API key or access token (unrecognized login or wrong password)";
    if (response.shop) {
      return true;
    } else {
      return false;
    }
  },
  generateAccessToken: async (shop, apiKey, apiSecret, code) => {
    const accessTokenRequestUrl = `https://${shop}/admin/oauth/access_token`;
    const accessTokenPayload = {
      client_id: apiKey,
      client_secret: apiSecret,
      code,
    };
    const options = {
      method: "POST",
      url: accessTokenRequestUrl,
      data: accessTokenPayload,
    };

    return await cda.sendAxiosRequest(options);
  },
  getShop: async (domain, accessToken) => {
    const url = `https://${domain}/admin/api/2021-01/shop.json`;
    const header = {
      "X-Shopify-Access-Token": accessToken,
    };

    const options = {
      method: "GET",
      url: url,
      headers: header,
    };
    const shopData = await cda.sendAxiosRequest(options);
    if (shopData.shop) {
      return shopData.shop;
    } else {
      return shopData;
    }
  },
  updateOrCreateShop: async (shop, accessToken, shopifyHost) => {
    const shopData = await cda.getShop(shop, accessToken);
    const data = {
      shopId: shopData.id,
      domain: shopData.myshopify_domain,
      shopDomain: shopData.domain,
      shopName: shopData.name,
      accessToken: accessToken,
      shopOwner: shopData.shop_owner,
      phone: shopData.phone,
      email: shopData.email,
      customerEmail: shopData.customer_email,
      address1: shopData.address1,
      address2: shopData.address2,
      zip: shopData.zip,
      city: shopData.city,
      province: shopData.province,
      // provinceCode: ,
      country: shopData.country_name,
      countryCode: shopData.country_code,
      latitude: shopData.latitude,
      longitude: shopData.longitude,
      currency: shopData.currency,
      moneyFormat: shopData.money_format,
      planDisplayName: shopData.plan_display_name,
      planName: shopData.plan_name,
      locationId: shopData.primary_location_id,
      enabledCurrencies: shopData.enabled_presentment_currencies.join(","),
      timezone: shopData.iana_timezone,
      primaryLocale: shopData.primary_locale,
      storeCreatedAt: shopData.created_at,
      active: true,
      shopifyHost,
    };
    if (isInstalled && !isActive) {
      const dbRes = await db.updateShop(data, shop);
      return { status: "updated", shopId: shopData.id };
    } else if (!isInstalled) {
      const dbRes = await db.saveShop(data);
      return { status: "created", shopId: shopData.id };
    }
  },
  getVariant: async (domain, variantId, accessToken) => {
    const options = {
      method: "GET",
      url: `https://${domain}/admin/api/2021-07/variants/${variantId}.json`,
      headers: {
        "content-type": "application/json",
        "X-Shopify-Access-Token": accessToken,
      },
    };
    const response = await cda.sendAxiosRequest(options);
    return response;
  },
  getProduct: async (domain, productId, accessToken) => {
    const options = {
      method: "GET",
      url: `https://${domain}/admin/api/2021-07/products/${productId}.json`,
      headers: {
        "content-type": "application/json",
        "X-Shopify-Access-Token": accessToken,
      },
    };
    try {
      const { product } = await cda.sendAxiosRequest(options);
      const variants = {};
      product.variants.map((variant) => {
        variants[variant.id] = variant;
      });
      product.variants = variants;

      const images = {};
      if (product.images.length) {
        product.images.map((image) => {
          images[image.id] = image.src;
        });
      }
      product.images = images;
      return product;
    } catch (error) {
      console.log("getProduct Error: ", error.message);
    }
  },
  generateId: () => {
    return Math.random().toString(10).substr(2, 5);
  },
  generatePos: async (activeOrders, accessToken, shopId, domain) => {
    let createdOrders = [];
    const fileObj = {};
    if (activeOrders.length > 0) {
      const vendors = {};
      // const quantity = {}
      const metafieldValues = {};
      for (const activeOrder of activeOrders) {
        for (const item of activeOrder.items) {
          if (vendors[item.vendor] === undefined) {
            vendors[item.vendor] = { items: [] };
          }
          // if (quantity[item.variantId] === undefined) {
          const product = await ShopifyController.getProduct(
            item.productId,
            domain,
            accessToken,
          );

          const metafields = product?.metafields?.nodes?.reduce((acc, item) => {
            if (item.namespace === "custom") {
              if (item.key === "part_number") {
                acc.part_number = item.value;
              }

              if (item.key === "dimensions_cm") {
                acc.dimensions_cm = item.value;
              }
            }
            return acc;
          }, {});
          metafieldValues[item.productId] = metafields;
          console.log("metafields", metafields);

          const variantResponse = await cda.getVariant(
            domain,
            item.variantId,
            accessToken,
          );

          if (variantResponse.variant) {
            const variant = variantResponse.variant;
            // quantity[item.variantId] = variant.inventory_quantity;
            if (variant.inventory_quantity < 0) {
              vendors[item.vendor][item.variantId] = item.quantity;
              vendors[item.vendor].items.push(item.dataValues);
            }
            // } else if (vendors[item.vendor][item.variantId]) {
            //   vendors[item.vendor][item.variantId] += item.quantity;
            // }
            item.barcode = variant.barcode;
          }
        }
      }
      const poItems = {};
      const cutoffs = {};
      const poItemsAdded = [];
      fileObj.metafieldValues = metafieldValues;
      console.log("metafieldValues", metafieldValues);
      for (const vendorName in vendors) {
        let createdProducts = [];
        poItems[vendorName] = [];
        let poCost = 0;
        let poCostPlusTax = 0;
        for (const item of vendors[vendorName].items) {
          const variant = await ShopifyController.getVariant(
            item.variantId,
            domain,
            accessToken,
          );
          fileObj[`variant-${item.variantId}`] = variant?.metafields?.nodes;
          console.log("variant?.metafields?.nodes", variant?.metafields?.nodes);
          const metafields = variant?.metafields?.nodes?.reduce((acc, item) => {
            if (item.namespace === "custom" && item.key === "bin_location") {
              acc.bin_location = item.value;
            }
            return acc;
          }, {});
          metafieldValues[item.variantId] = metafields;
          const orderNumber = await db.getSingleField(order, "orderNumber", {
            orderId: item.orderId,
          });

          let unitCost =
            Number(variant.inventoryItem?.unitCost?.amount) * item.quantity;
          poCost = poCost + unitCost;
          // poCost = poCost + Number(item.price) * item.quantity;
          poCostPlusTax =
            poCostPlusTax +
            (Number(variant.inventoryItem?.unitCost?.amount) + item.tax) *
              item.quantity;
          const product = {
            shopId,
            barcode: item.barcode,
            patNum: "",
            productId: metafieldValues[item.productId]?.part_number || "",
            variantId: item.variantId,
            orderId: item.orderId,
            orderNumber: orderNumber,
            sku: metafieldValues[item.variantId]?.bin_location || "",
            status: "stand",
            image: item.image,
            qty: vendors[vendorName][item.variantId],
            description: item.name,
            internalRef: "",
            costPerUnit: variant.inventoryItem?.unitCost?.amount || 0,
            costPlusTax: item.tax,
            grams:
              (metafieldValues[item.productId]?.weight * 1000).toString() || "",
            dimensions: metafieldValues[item.productId]?.dimensions_cm || "",
            part_number: metafieldValues[item.productId]?.part_number || "",
            notes: "-",
          };
          fileObj[`po-item-${item.productId}`] = product;
          console.log(item.productId, product);
          poItems[vendorName].push(product);
        }
        try {
          const ct = new Date();
          const vendorData = await db.getSingleRecord(vendor, {
            name: vendorName,
            shopId,
          });
          const openOrder = await db.getSinglePurchaseOrders({
            shopId,
            vendorId: vendorData.id,
            status: "null",
            timeUntilCutoff: { [Op.gt]: ct },
          });

          if (openOrder.id) {
            for (const item of poItems[vendorName]) {
              item.purchaseorderId = openOrder.id;
              const data = item;
              poItemsAdded.push(await db.addData(purchaseorderitem, data));
              const updated = db.updateData(
                order,
                { active: false },
                { orderId: item.orderId },
              );
            }
            const fields = {
              costValue: openOrder.costValue + poCost,
              costValuePlusVat: openOrder.costValuePlusVat + poCostPlusTax,
            };
            const where = { id: openOrder.id };
            const incremented = await db.updateData(
              purchaseorder,
              fields,
              where,
            );
          } else {
            cutoffs[vendorName] = await db.getVendorCutoffs(cutoff, {
              vendorId: vendorData.id,
            });

            const cutoffTime = await cda.calculateCutOff(cutoffs, vendorName);
            const po = {
              shopId,
              vendorId: vendorData.id,
              costValue: Number(poCost.toFixed(2)),
              timeUntilCutoff: cutoffTime,
              notes: "-",
              status: "null",
              costValuePlusVat: Number(poCostPlusTax.toFixed(2)),
              submittedAt: null,
            };
            const createdOrder = await db.addData(purchaseorder, po);
            for (const item of poItems[vendorName]) {
              item.purchaseorderId = createdOrder.id;
              const data = item;
              const createdProduct = await db.addData(purchaseorderitem, data);
              createdProducts.push(createdProduct);
              const updated = db.updateData(
                order,
                { active: false },
                { orderId: item.orderId },
              );
            }
            createdOrder.purchaseorderitems = createdProducts;
            createdOrder.vendor = vendorData;
            createdOrders.unshift(createdOrder);
          }
        } catch (error) {
          return { error };
        }
      }

      // fs.writeFile("po-generated.txt", JSON.stringify(fileObj), function (err) {
      //   if (err) throw err;
      //   console.log("Saved!");
      // });

      if (createdOrders.length > 0) {
        return { createdOrders };
      } else {
        return { noOrder: "No New Purchase Order generated!" };
      }
    } else {
      return { noOrder: "No Active order!" };
    }
  },
  getDimensions: async (domain, accessToken, productId) => {
    const metafieldOptions = {
      method: "GET",
      url: `https://${domain}/admin/api/2021-10/metafields.json?metafield[owner_id]=${productId}&metafield[owner_resource]=product`,
      headers: {
        "content-type": "application/json",
        "X-Shopify-Access-Token": accessToken,
      },
    };
    const { metafields } = await cda.sendAxiosRequest(metafieldOptions);
    const dimensions = {};
    if (metafields.length > 0) {
      for (const metafield of metafields) {
        if (
          metafield.key === "width" ||
          metafield.key === "height" ||
          metafield.key === "length"
        ) {
          dimensions[metafield.key] = metafield.value;
        }
      }
    }
    return `${dimensions.width}x${dimensions.height}x${dimensions.length}`;
  },
  getDispatchBay: async (orderId, shopData) => {
    // const options = {
    //   method: "GET",
    //   url: `https://${shopData.domain}/admin/api/2025-07/orders/${orderId}.json`,
    //   headers: {
    //     "content-type": "application/json",
    //     "X-Shopify-Access-Token": shopData.accessToken,
    //   },
    // };
    // const axoisResponse = await cda.sendAxiosRequest(options);
    // if (axoisResponse.order) {
    //   const { note_attributes, customer } = axoisResponse.order;
    //   if (note_attributes.length > 0) {
    //     for (const attribute of note_attributes) {
    //       if (attribute.name === "Despatch Bay:") {
    //         return { data: { dispatchBay: attribute.value, customer } };
    //       }
    //     }
    //   } else {
    //     return { data: { dispatchBay: "", customer } };
    //   }
    // } else {
    //   return axoisResponse;
    // }
    const order = await ShopifyController.getorder(
      orderId,
      shopData.domain,
      shopData.accessToken,
    );
    if (order) {
      const {
        metafields: { nodes },
        customer,
      } = order;
      const dispatchBayMetafield = nodes.find(
        (metafield) => metafield.key === "dispatch_bay",
      );
      const dispatchBay = dispatchBayMetafield
        ? dispatchBayMetafield.value
        : "";
      return { dispatchBay, customer };
    }
  },
  sendMail: async (options) => {
    const transporter = nodemailer.createTransport({
      host: "shopify.britcar.com",
      port: 465,
      secure: true,
      auth: {
        user: "info@shopify.britcar.com",
        pass: "rg=zcz-@Wdy@d&jA",
      },
    });

    return await transporter
      .sendMail(options)
      .then(async (info) => {
        console.log("info", info);
        return true;
      })
      .catch((error) => {
        console.log("mail error", error);
        return false;
      });
  },
  submitOrder: async (orderId) => {
    // return new Promise(async (resolve, reject) => {
    //     try {
    //         const pos = await db.getDataWithWhereAndInclude(purchaseorder, [{ model: purchaseorderitem }, { model: vendor }], { id: orderId })
    //         const order = pos[0]
    //         const seller = order.vendor.dataValues
    //         const createdDate = new Date(order.createdAt)
    //         order.createdAt = `${createdDate.toDateString()} ${createdDate.getHours().toString().padStart(2, '0')}:${createdDate.getMinutes().toString().padStart(2, '0')}`

    //         var html = fs.readFileSync(__dirname + "/pdf.html", "utf8");

    //         html = html
    //             .replace("{{poOrderNum}}", orderId)
    //             .replace("{{date}}", order.createdAt)
    //             .replace("{{marchantName}}", 'Britcar (UK) Ltd')
    //             .replace("{{marchantAddress}}", "Unit 2 Riverside Industrial Park,\nRapier Street,\nIpswich,\nSuffolk,\nIP2 8JX")
    //             .replace("{{marchantVatNumber}}", 'Vat Number: GB 877 7180 73')
    //             .replace("{{marchantPhone}}", 'TelePhone: +44 (0) 1473 907444')
    //             .replace("{{marchantEmail}}", 'Email: sales@britcar.com')

    //             .replace("{{sellerName}}", seller.name)
    //             .replace("{{sellerAddress}}", seller.address)
    //             .replace("{{sellerVatNumber}}", '')
    //             .replace("{{sellerPhone}}", 'TelePhone: ' + seller.phone)
    //             .replace("{{sellerEmail}}", "Email: " + seller.email)

    //         const rows = order.purchaseorderitems.map(product => {
    //             return `<tr key={i}>
    //             <td>${product.barcode}</td>
    //             <td>${product.qty}</td>
    //             <td style="text-align: left;">${product.description}</td>
    //             <td>${product.internalRef}</td>
    //             <td>${product.costPerUnit}</td>
    //             </tr>`
    //         })
    //         html = html.replace("{{rows}}", rows.join(''))

    //         pdf
    //             .create(html)
    //             .toBuffer(async (err, buffer) => {
    //                 if (err) return reject(err); // **important**
    //                 const mailOptions = {
    //                     from: 'Britcar UK <wp@logiceverest.com>',
    //                     to: seller.email,
    //                     subject: `Purchase Order #${orderId}`,
    //                     replyTo: seller.replyEmail,
    //                     html: "<p>Check attachment!</p>",
    //                     attachments: [{
    //                         filename: `PO-${orderId}.pdf`,
    //                         content: buffer,
    //                         contentType: 'application/pdf'
    //                     }]
    //                 };
    //                 const aknowledge = await cda.sendMail(mailOptions)

    //                 let isSubmitted = null;
    //                 if (aknowledge) {
    //                     let isSub = await db.getSingleField(purchaseorder, 'submittedAt', { id: orderId });
    //                     if (isSub === null || isSub === '') {
    //                         const submittedAt = new Date()
    //                         const submitted = await db.updateData(purchaseorder, { submittedAt, status: 'sub' }, { id: orderId })
    //                         if (submitted[0]) {
    //                             isSubmitted = submittedAt
    //                         }
    //                     } else {
    //                         isSubmitted = null
    //                     }
    //                     resolve({ aknowledge, submittedAt: isSubmitted });
    //                 }
    //                 reject({ aknowledge, submittedAt: isSubmitted });
    //             });
    //     } catch (error) {
    //         return reject(error)
    //     }
    // })
    return new Promise(async (resolve, reject) => {
      try {
        const pos = await db.getDataWithWhereAndInclude(
          purchaseorder,
          [{ model: purchaseorderitem }, { model: vendor }],
          { id: orderId },
        );
        const order = pos[0];
        const seller = order.vendor;
        if (!seller.email) {
          return reject(new Error("Supplier email is missing"));
        }
        const createdDate = new Date(order.createdAt);
        order.createdAt = `${createdDate.toDateString()} ${createdDate.getHours().toString().padStart(2, "0")}:${createdDate.getMinutes().toString().padStart(2, "0")}`;

        var html = fs.readFileSync(__dirname + "/pdf.html", "utf8");

        html = html
          .replace("{{poOrderNum}}", orderId)
          .replace("{{date}}", order.createdAt)
          .replace("{{marchantName}}", "Britcar (UK) Ltd")
          .replace(
            "{{marchantAddress}}",
            "Unit 2 Riverside Industrial Park,\nRapier Street,\nIpswich,\nSuffolk,\nIP2 8JX",
          )
          .replace("{{marchantVatNumber}}", "Vat Number: GB 877 7180 73")
          .replace("{{marchantPhone}}", "TelePhone: +44 (0) 1473 907444")
          .replace("{{marchantEmail}}", "Email: sales@britcar.com")

          .replace("{{sellerName}}", seller.name)
          .replace("{{sellerAddress}}", seller.address)
          .replace("{{sellerVatNumber}}", "")
          .replace("{{sellerPhone}}", "TelePhone: " + seller.phone)
          .replace("{{sellerEmail}}", "Email: " + seller.email);

        const rows = order.purchaseorderitems.map((product) => {
          return `<tr key={i}>
            <td>${product.part_number}</td>
            <td>${product.qty}</td>
            <td style="text-align: left;">${product.description}</td>
            <td>${product.orderNumber}</td>
            <td>${product.costPerUnit}</td>
          </tr>`;
        });
        html = html.replace("{{rows}}", rows.join(""));

        pdf.create(html).toBuffer(async (err, buffer) => {
          if (err) return reject(err);
          const mailOptions = {
            from: "Britcar UK <info@shopify.britcar.com>",
            to: seller.email,
            subject: `Purchase Order #${orderId}`,
            replyTo: seller.replyEmail,
            html: "<p>Check attachment!</p>",
            attachments: [
              {
                filename: `PO-${orderId}.pdf`,
                content: buffer,
                contentType: "application/pdf",
              },
            ],
          };

          const aknowledge = await cda.sendMail(mailOptions);

          let isSubmitted;
          if (aknowledge) {
            let isSub = await db.getSingleField(purchaseorder, "submittedAt", {
              id: orderId,
            });
            if (isSub === null || isSub === "") {
              const submittedAt = new Date();
              const submitted = await db.updateData(
                purchaseorder,
                { submittedAt, status: "sub" },
                { id: orderId },
              );
              if (submitted[0]) {
                isSubmitted = submittedAt;
              }
            } else {
              isSubmitted = null;
            }
            console.log("isSubmitted", isSubmitted);

            resolve({ aknowledge, submittedAt: isSubmitted });
          } else {
            reject({ aknowledge, submittedAt: isSubmitted });
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  },
  adjustQty: async (itemId, qty, shopData) => {
    const options = {
      method: "POST",
      url: `https://${shopData.domain}/admin/api/2021-10/inventory_levels/adjust.json`,
      json: true,
      headers: {
        "content-type": "application/json",
        "X-Shopify-Access-Token": shopData.accessToken,
      },
      data: {
        location_id: shopData.locationId,
        inventory_item_id: itemId,
        available_adjustment: qty,
      },
    };
    const qtyUpdated = await cda.sendAxiosRequest(options);
    return qtyUpdated;
  },
  calculateCutOff: async (cutoffs, vendorName) => {
    const current = new Date();
    let i = 1;

    let diff = 0;
    do {
      const cDay = current
        .toLocaleDateString("en-US", { weekday: "short" })
        .toLowerCase();
      const cDate =
        Number(current.getMonth()) +
        1 +
        "/" +
        current.getDate() +
        "/" +
        current.getFullYear();
      const cDateForDb =
        current.getFullYear() +
        "-" +
        (Number(current.getMonth()) + 1) +
        "-" +
        current.getDate();

      let cutoff;
      let now = new Date();
      now = now.getTime();
      if (cutoffs[vendorName].hasOwnProperty(cDay)) {
        if (
          cutoffs[vendorName][cDay].hasOwnProperty("first") &&
          cutoffs[vendorName][cDay].first
        ) {
          cutoff = Date.parse(cDate + " " + cutoffs[vendorName][cDay].first);
          if (cutoff > now) {
            console.log("first if");
            diff = cutoff - now;
            cutoffs[vendorName].time =
              cDateForDb + " " + cutoffs[vendorName][cDay].first;
          }
        }
        if (
          cutoffs[vendorName][cDay].hasOwnProperty("last") &&
          cutoffs[vendorName][cDay].last &&
          diff <= 0
        ) {
          cutoff = Date.parse(cDate + " " + cutoffs[vendorName][cDay].last);
          if (cutoff > now) {
            console.log("last if");
            diff = cutoff - now;
            cutoffs[vendorName].time =
              cDateForDb + " " + cutoffs[vendorName][cDay].last;
          }
        }
      }
      current.setDate(current.getDate() + 1);
      i++;
    } while (diff <= 0 && i <= 7);
    console.log({ cutoffs });
    const cutoffTime = new Date(cutoffs[vendorName].time);
    cutoffTime.setHours(cutoffTime.getHours() - 7); // timechange from 7 to 1 for britcar server
    console.log("in", { cutoffTime });
    return cutoffTime;
  },
  sleep: (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  },
  sendAxiosRequest: async (options) => {
    return await axios(options)
      .then((response) => {
        return response.data;
      })
      .catch((error) => {
        return error;
      });
  },
};

module.exports = { cda };
