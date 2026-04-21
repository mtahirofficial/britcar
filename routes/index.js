const rootRouter = require('express').Router();
const installationRouter = require('./installationRoutes')
const staticRouter = require('./staticRoutes')
const ordersRouter = require('./orderRoutes')
const productRouter = require('./productRoutes')
const webhookRouter = require('./webhookRoutes')
const fileRouter = require('./fileRoutes')
const mailRouter = require('./mailRoutes')
const vendorRouter = require('./vendorRoutes')
const shopRouter = require('./shopRoutes')
const fs = require("fs");

rootRouter.get('/test', (req, res) => {
    const dt = new Date()
    const d = new Date()
    // dt.setHours(dt.getHours() + 7)
    fs.writeFile('log.txt', JSON.stringify({ dt: dt.toString(), dtl: d.toUTCString() }), function (err) {
        if (err) throw err;
        console.log('Saved!');
    });
    res.send({ dt: dt.toString(), dtl: d.toUTCString() })
})
rootRouter.use('/', installationRouter)
rootRouter.use('/order', ordersRouter)
rootRouter.use('/product', productRouter)
rootRouter.use('/webhook', webhookRouter)
rootRouter.use('/files', fileRouter)
rootRouter.use('/suppliers', vendorRouter)
rootRouter.use('/shop', shopRouter)
rootRouter.use('/mail', mailRouter)
rootRouter.use('/', staticRouter)

// server.js (near the top, after requires)
process.on('unhandledRejection', (reason, promise) => {
    console.error('UNHANDLED REJECTION at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION:', err);
});

module.exports = rootRouter