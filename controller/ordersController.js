const { cda } = require("../controller/customDefinedActions");
const { db } = require("./dbActions");
const dbModels = require("../models");
const {
  shop,
  order,
  orderitem,
  vendor,
  purchaseorder,
  purchaseorderitem,
  cutoff,
  sequelize,
} = dbModels;
const { Op } = require("sequelize");
var cron = require("node-cron");
const fs = require("fs");

cron.schedule("0 9,15 * * *", () => {
  console.log("task will run on 09:00am and 03:00pm");
});

const ordersController = {
  getAlternateProducts: async (req, res) => {
    const { domain, searchQuery, id } = req.params;
    const accessToken = await db.getSingleField(shop, "accessToken", {
      domain,
    });
    const moneyFormat = await db.getSingleField(shop, "moneyFormat", {
      domain,
    });
    const currencySymbol = moneyFormat.replace("{{amount}}", "");
    const options = {
      method: "POST",
      url: `https://${domain}/admin/api/2025-07/graphql.json`,
      data: JSON.stringify({
        query: `{productVariants(first: 10, query: "barcode:${searchQuery}* OR title:${searchQuery}* OR sku:${searchQuery}*") {
          edges {
            node {
              barcode
              displayName
              id
              price
              sku
              title
              product {
                id
                productType
                title
                vendor
                featuredImage {
                  src
                }
              }
              inventoryItem {
                unitCost {
                  amount
                  currencyCode
                }
              }
              image {
                src
              }
            }
          }
        }
      }`,
      }),
      headers: {
        "content-type": "application/json",
        "X-Shopify-Access-Token": accessToken,
      },
    };

    const response = await cda.sendAxiosRequest(options);
    await fs.writeFile(
      "replace.txt",
      JSON.stringify(response.data),
      function (err) {
        if (err) throw err;
        console.log("Saved!");
      },
    );
    if (response.data && response.data.productVariants) {
      const { edges } = response.data.productVariants;
      let productList = [];
      if (edges.length > 0) {
        for (const { node } of edges) {
          const variant = node;
          const variantId = variant.id.replace(
            "gid://shopify/ProductVariant/",
            "",
          );
          variant.id = variantId;
          const productId = variant.product.id.replace(
            "gid://shopify/Product/",
            "",
          );
          variant.product.id = productId;
          if (variantId !== id) {
            let title = variant.displayName.replace(" - Default Title", "");
            productList.push({
              label: `${currencySymbol}${variant.price} | ${variant.barcode} | ${variant.product.productType} | ${variant.product.vendor} | ${title}`,
              value: variant,
            });
          }
        }
        res.send(productList);
      } else {
        res.send(edges);
      }
    } else {
      res.send(response.data);
    }
  },
  saveOrderToDatabase: async (req, res) => {
    try {
      const domain = req.headers["x-shopify-shop-domain"];
      if (!domain) {
        return res
          .status(400)
          .send({ status: 400, message: "Missing shop domain header" });
      }
      const mailOptions = {
        from: "Britcar UK <info@shopify.britcar.com>",
        to: "hmtahirs1@gmail.com",
        subject: `Purchase Order`,
        html: `<p>Order Create Webhook on ${domain}</p>`,
      };
      // console.log(mailOptions);

      // const aknowledge = await cda.sendMail(mailOptions)
      // console.log("aknowledge", aknowledge);

      const shopId = await db.getSingleField(shop, "shopId", { domain });
      const accessToken = await db.getSingleField(shop, "accessToken", {
        domain,
      });
      if (!shopId || !accessToken) {
        return res.status(404).send({
          status: 404,
          message: "Shop not found or missing access token",
        });
      }
      const orderId = await db.getSingleField(order, "orderId", {
        orderId: req.body.id,
      });
      if (!orderId) {
        const orders = [];
        const data = {
          shopId,
          orderId: req.body.id,
          orderNumber: req.body.order_number,
          subtotalPrice: req.body.subtotal_price,
          totalPrice: req.body.total_price,
          totalPriceUsd: req.body.total_price_usd,
          totalWeight: req.body.total_weight,
          totalTax: req.body.total_tax,
          currency: req.body.currency,
          financialStatus: req.body.financial_status,
          fulfillmentStatus: req.body.fulfillment_status,
          totalDiscounts: req.body.total_discounts,
          totalLineItemsPrice: req.body.total_line_items_price,
          note: req.body.note,
          processingMethod: req.body.processing_method,
          checkoutId: req.body.checkout_id,
          sourceName: req.body.source_name,
          contactEmail: req.body.contact_email,
          reference: req.body.reference,
          confirmed: req.body.confirmed,
          orderJson: JSON.stringify(req.body),
          cancelReason: req.body.cancel_reason,
          orderCreatedAt: req.body.created_at,
          orderUpdatedAt: req.body.updated_at,
          orderCancelledAt: req.body.cancelled_at,
          orderClosedAt: req.body.closed_at,
          orderProcessedAt: req.body.processed_at,
        };
        const savedOrder = await db.addData(order, data);
        savedOrder.items = [];
        if (savedOrder.orderId) {
          const products = {};
          fs.writeFile(
            "lineItems.txt",
            JSON.stringify(req.body.line_items),
            function (err) {
              if (err) throw err;
              console.log("Saved!");
            },
          );
          for (const lineItem of req.body.line_items) {
            let product;
            if (products[lineItem.product_id] === undefined) {
              product = await cda.getProduct(
                domain,
                lineItem.product_id,
                accessToken,
              );
              products[lineItem.product_id] = product;
            } else {
              product = products[lineItem.product_id];
            }
            let image;
            if (product.variants[lineItem.variant_id].image_id > 0) {
              image =
                product.images[product.variants[lineItem.variant_id].image_id];
            } else if (Object.keys(product.images).length) {
              image = product.images[Object.keys(product.images)[0]];
            }
            let tax = 0;
            for (const taxLine of lineItem.tax_lines) {
              tax = tax + Number(taxLine.price);
            }

            const dimensions = await cda.getDimensions(
              domain,
              accessToken,
              lineItem.product_id,
            );
            const orderitem = {
              shopId: shopId,
              orderId: req.body.id,
              lineItemId: lineItem.id,
              productId: lineItem.product_id,
              variantId: lineItem.variant_id,
              name:
                lineItem.variant_title && lineItem.variant_title !== ""
                  ? "Pack of " + lineItem.variant_title + " - " + lineItem.title
                  : lineItem.title,
              // name: lineItem.name,
              quantity: lineItem.quantity,
              sku: lineItem.sku,
              barcode: product.variants[lineItem.variant_id].barcode,
              image,
              productType: product.product_type,
              vendor: lineItem.vendor,
              fulfillmentService: lineItem.fulfillment_service,
              requiresShipping: lineItem.requires_shipping,
              taxable: lineItem.taxable,
              tax,
              grams: lineItem.grams,
              price: Number(lineItem.price).toFixed(2),
              productJson: JSON.stringify(lineItem),
              totalDiscount: lineItem.total_discount,
              fulfillmentStatus: lineItem.fulfillment_status,
              fulfillableQuantity: lineItem.fulfillable_quantity,
              productExists: lineItem.product_exists,
              dimensions,
            };
            const savedOrderItem = await db.saveOrderItems(orderitem);
            savedOrder.items.push(savedOrderItem);
          }
          orders.push(savedOrder);
          const POS = await cda.generatePos(
            orders,
            accessToken,
            shopId,
            domain,
          );
        }
      }
      return res.status(200).send({ status: 200 });
    } catch (error) {
      console.log("error.message", error.message);
      return res.status(500).send({ status: 500, message: error.message });
    }
  },
  deleteOrder: async (req, res) => {
    res.send({ status: 200 });
  },
  updateOrder: async (req, res) => {
    res.send({ status: 200 });
  },
  editOrder: async (req, res) => {
    res.send({ status: 200 });
  },
  createPurchaseOrders: async (req, res) => {
    const { domain } = req.params;
    const shopId = await db.getSingleField(shop, "shopId", { domain });
    const accessToken = await db.getSingleField(shop, "accessToken", {
      domain,
    });
    const where = {
      [Op.and]: [{ active: true }, { shopId }, { financialStatus: "paid" }],
    };
    const activeOrders = await db.getOrders(where);
    console.log({ activeOrders });
    const POS = await cda.generatePos(
      activeOrders,
      accessToken,
      shopId,
      domain,
    );
    res.send(POS);
  },
  getPurchaseOrders: async (req, res) => {
    const { shopId } = req.params;
    const ct = new Date();

    const orderBy = sequelize.literal("id DESC");

    const vendorWhere = {
      enabled: true,
      autoSubmit: true,
      email: { [Op.ne]: null },
    };

    const includeForOpen = [{ model: vendor, where: vendorWhere }];
    const whereForOpen = {
      shopId,
      status: "null",
      submittedAt: null,
      timeUntilCutoff: { [Op.lt]: ct },
    };

    const openPos = await db.getPurchaseOrders(
      whereForOpen,
      orderBy,
      includeForOpen,
    );

    for (const order of openPos) {
      try {
        const response = await cda.submitOrder(order.id);
        console.log("response", response);
      } catch (error) {
        console.log("error.message", error.message);
      }
    }

    const where = { shopId };
    const include = [{ model: purchaseorderitem }, { model: vendor }];
    const purchaseOrders = await db.getPurchaseOrders(where, orderBy, include);

    res.send(purchaseOrders);
  },
  submitOrder: async (req, res) => {
    const { id } = req.params;
    let isSubmitted = await db.getSingleField(purchaseorder, "submittedAt", {
      id,
    });
    if (isSubmitted === null || isSubmitted === "") {
      const submittedAt = new Date();
      const submitted = await db.updateData(
        purchaseorder,
        { submittedAt, status: "sub" },
        { id },
      );
      if (submitted[0]) {
        res.send({ submittedAt });
      }
    } else {
      res.send({ submittedAt: null });
    }
  },
  fetchPoItems: async (req, res) => {
    const { vendorId, shopId } = req.params;
    const pos = await db.getDataWithWhereAndInclude(
      purchaseorder, //model
      {
        model: purchaseorderitem,
        where: {
          [Op.and]: [
            {
              [Op.or]: [
                { received: { [Op.lt]: sequelize.col("qty") } },
                { received: null },
              ],
            },
            {
              status: { [Op.ne]: "re" },
            },
          ],
        },
      }, //include
      { [Op.and]: { vendorId, status: "sub", shopId } }, //where
      [
        ["id", "DESC"],
        [purchaseorderitem, "id", "DESC"],
      ], //order
    );
    console.log("pos", pos);

    const vendorData = await db.getSingleRecord(vendor, {
      id: vendorId,
      shopId,
    });
    for (const po of pos) {
      po.vendor = vendorData;
    }
    res.send(pos);
  },
  receivedProduct: async (req, res) => {
    const { id, variantId, shopId } = req.params;
    const { qtyToShow, received, qty } = req.body;

    const shopData = await db.getSingleRecord(shop, { shopId });

    const response = await cda.getVariant(
      shopData.domain,
      variantId,
      shopData.accessToken,
    );
    if (response.hasOwnProperty("variant")) {
      const { variant } = response;
      const qtyUpdated = await cda.adjustQty(
        variant.inventory_item_id,
        qtyToShow,
        shopData,
      );

      const orderId = await db.getSingleField(purchaseorderitem, "orderId", {
        id: id,
      });
      const DispatchBay = await cda.getDispatchBay(orderId, shopData);

      let dispatchBay = "",
        customer = {};
      if (DispatchBay.data) {
        customer = DispatchBay.data.customer ?? {};
        dispatchBay = DispatchBay.data.dispatchBay;
      }
      let status = "stand";
      const receivedQty = qtyToShow + received;
      if (qty <= receivedQty) {
        status = "full";
      } else if (receivedQty < qty && receivedQty > 0) {
        status = "part";
      }
      const updated = await db.updateData(
        purchaseorderitem,
        { received: receivedQty, status },
        { id },
      );
      if (updated[0]) {
        res.send({
          updated: updated[0].toString(),
          status,
          receivedQty,
          dispatchBay,
          qtyUpdated,
          customer,
        });
      } else {
        res.send({
          updated: updated[0].toString(),
          dispatchBay,
          customer,
          qtyUpdated,
        });
      }
    } else {
      // res.send('Product not found!')
      res.send("Data updated in app but Product not found in stock!!");
    }
  },
  updateOrderStatus: async (req, res) => {
    const { id, shopId } = req.params;
    const data = await db.getData(purchaseorderitem, {
      purchaseorderId: Number(id),
      shopId,
    });
    let checker = (data) => data.every((item) => item.status === "full");
    console.log({ data, isTrue: checker(data) });
    let status = await db.getSingleField(purchaseorder, "status", {
      id,
      shopId,
    });
    if (checker(data)) {
      status = "comp";
    }
    const updated = await db.updateData(purchaseorder, { status }, { id });
    if (updated[0]) {
      res.send(status);
    }
  },
  updatePO: async (req, res) => {
    const { id, shopId } = req.params;
    const data = req.body;
    console.log(data);
    const updated = await db.updateData(purchaseorder, data, {
      [Op.and]: { id, shopId },
    });
    if (updated[0]) {
      data.notes = data.notes === "" ? "-" : data.notes;
      console.log(data);
      res.send(data);
    }
  },
  updatePoItem: async (req, res) => {
    const { id, shopId } = req.params;
    const data = req.body;
    if (data.hasOwnProperty("id")) {
      //#region update quantity in stock
      let qtys = [];
      const variantId = await db.getSingleField(
        purchaseorderitem,
        "variantId",
        { id },
      );
      const productIds = [
        { status: "new", id: data.variantId },
        { status: "old", id: variantId },
      ];
      for (const i in productIds) {
        const shopData = await db.getSingleRecord(shop, { shopId });
        const response = await cda.getVariant(
          shopData.domain,
          productIds[i].id,
          shopData.accessToken,
        );
        const qty =
          productIds[i].status === "new" ? -Number(data.qty) : Number(data.qty);
        if (response.variant) {
          const { variant } = response;
          const qtyUpdated = await cda.adjustQty(
            variant.inventory_item_id,
            qty,
            shopData,
          );
          qtys.push(qtyUpdated);
        }
      }
      //#endregion
    }
    const updated = await db.updateData(purchaseorderitem, data, {
      [Op.and]: { id, shopId },
    });
    if (updated[0]) {
      res.send({ updated: true });
    }
  },
  AddProductToOpenPo: async (req, res) => {
    const { vendorName, shopId } = req.params;
    const { prod, oldVariantId } = req.body;
    const cutoffs = {};
    //#region update quantity in stock
    const shopData = await db.getSingleRecord(shop, { shopId });
    const productIds = [
      { status: "new", id: prod.variantId },
      { status: "old", id: oldVariantId },
    ];
    let qtys = [];
    for (const i in productIds) {
      const response = await cda.getVariant(
        shopData.domain,
        productIds[i].id,
        shopData.accessToken,
      );
      const qty =
        productIds[i].status === "new" ? -Number(prod.qty) : Number(prod.qty);
      if (response.variant) {
        const qtyUpdated = await cda.adjustQty(
          response.variant.inventory_item_id,
          qty,
          shopData,
        );
        // await cda.sleep(1000)
        qtys.push(qtyUpdated);
      }
    }
    //#endregion

    const ct = new Date();
    const oldProductId = prod.id;
    const vendorId = await db.getSingleField(vendor, "id", {
      name: vendorName,
      shopId,
    });
    const openOrder = await db.getSinglePurchaseOrders({
      shopId,
      vendorId: vendorId,
      status: "null",
      timeUntilCutoff: { [Op.gt]: ct },
    });

    if (openOrder.id) {
      prod.purchaseorderId = openOrder.id;
      delete prod.id;
      const createdProduct = await db.addData(purchaseorderitem, prod);
      if (Object.keys(createdProduct).length > 0) {
        const statusUpdate = await db.updateData(
          purchaseorderitem,
          { status: "re" },
          { id: oldProductId },
        );

        const fields = {
          costValue: prod.costPerUnit * prod.qty,
          costValuePlusVat: (prod.costPerUnit + prod.costPlusTax) * prod.qty,
        };
        const where = { id: prod.purchaseorderId };
        const incrementedCost = await db.incrementValue(
          purchaseorder,
          fields,
          where,
        );
      }
      res.send({ createdProduct });
    } else {
      cutoffs[vendorName] = await db.getVendorCutoffs(cutoff, { vendorId });

      const cutoffTime = await cda.calculateCutOff(cutoffs, vendorName);
      console.log("out", { cutoffTime });

      const po = {
        shopId,
        vendorId: vendorId,
        costValue: Number((prod.costPerUnit * prod.qty).toFixed(2)),
        timeUntilCutoff: cutoffTime,
        notes: "",
        status: "null",
        costValuePlusVat: Number(
          ((prod.costPerUnit + prod.costPlusTax) * prod.qty).toFixed(2),
        ),
        submittedAt: null,
      };
      console.log({ po });
      const createdOrder = await db.addData(purchaseorder, po);
      createdOrder.purchaseorderitems = [];
      if (Object.keys(createdOrder).length > 0) {
        const statusUpdate = await db.updateData(
          purchaseorderitem,
          { status: "re" },
          { id: oldProductId },
        );
        prod.purchaseorderId = createdOrder.id;
        delete prod.id;
        const createdProduct = await db.addData(purchaseorderitem, prod);
        const vendorData = await db.getSingleRecord(vendor, {
          id: vendorId,
          shopId,
        });
        createdOrder.purchaseorderitems.push(createdProduct);
        createdOrder.vendor = vendorData;
      }
      res.send({ createdOrder, qtys });
    }
  },
  autoSubmit: async (req, res) => {
    const { orderId, shopId } = req.params;
    const orderBy = sequelize.literal("id DESC");

    const vendorWhere = {
      enabled: true,
      autoSubmit: true,
      email: { [Op.ne]: null },
    };

    const includeForOpen = [{ model: vendor, where: vendorWhere }];
    const whereForOpen = { id: orderId, status: "null", submittedAt: null };

    const data = await db.getDataWithWhereAndInclude(
      purchaseorder,
      includeForOpen,
      whereForOpen,
      orderBy,
    );
    console.log(data);
    if (data.length > 0) {
      for (const order of data) {
        const response = await cda.submitOrder(order.id);
        console.log("autoSubmit", response);

        res.send(response);
      }
    } else {
      res.send({ submittedAt: null });
    }
  },
};
module.exports = { ordersController };
