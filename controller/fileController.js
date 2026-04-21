const fs = require("fs");
var pdf = require('html-pdf');
const dbModels = require('../models')
const { db } = require('./dbActions')
const { shop, webhook, order, vendor, cutoff, orderitem, purchaseorder, purchaseorderitem } = dbModels;

const fileController = {
    test: (req, res) => { return ("Called from file controller!") },
    generatePDF: async (req, res) => {
        const { orderId } = req.params
        const pos = await db.getDataWithWhereAndInclude(purchaseorder, [{ model: purchaseorderitem }, { model: vendor }], { id: orderId })
        const order = pos[0]
        const seller = order.vendor.dataValues
        const createdDate = new Date(order.createdAt)
        order.createdAt = `${createdDate.toDateString()} ${createdDate.getHours().toString().padStart(2, '0')}:${createdDate.getMinutes().toString().padStart(2, '0')}`
        var html = fs.readFileSync(__dirname + "/pdf.html", "utf8");

        html = html
            .replace("{{poOrderNum}}", order.id)
            .replace("{{date}}", order.createdAt)
            .replace("{{marchantName}}", 'Britcar (UK) Ltd')
            .replace("{{marchantAddress}}", "Unit 2 Riverside Industrial Park,\nRapier Street,\nIpswich,\nSuffolk,\nIP2 8JX")
            .replace("{{marchantVatNumber}}", 'Vat Number: GB 877 7180 73')
            .replace("{{marchantPhone}}", 'TelePhone: +44 (0) 1473 907444')
            .replace("{{marchantEmail}}", 'Email: sales@britcar.com')

            .replace("{{sellerName}}", seller.name)
            .replace("{{sellerAddress}}", seller.address)
            .replace("{{sellerVatNumber}}", '')
            .replace("{{sellerPhone}}", 'TelePhone: ' + seller.phone)
            .replace("{{sellerEmail}}", "Email: " + seller.email)

        const rows = order.purchaseorderitems.map(({ dataValues }) => {
            const product = dataValues
            return `<tr key={i}>
                <td>${product.barcode}</td>
                <td>${product.qty}</td>
                <td style="text-align: left;">${product.description}</td>
                <td>${product.internalRef}</td>
                <td>${product.costPerUnit}</td>
            </tr>`
        })

        html = html.replace("{{rows}}", rows.join(''))

        pdf
            .create(html)
            .toStream((err, stream) => {
                if (err) {
                    console.error(err);
                    res.status(500);
                    res.end(JSON.stringify(err));
                    return;
                }

                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', `attachment; filename=PO-${order.id}.pdf;`);

                stream.pipe(res);
            });
    }
}
module.exports = { fileController }