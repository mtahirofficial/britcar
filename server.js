const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser')
const dotenv = require('dotenv').config();

const port = process.env.PORT;

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }))
app.use(bodyParser.urlencoded({
    limit: '50mb',
    extended: false,
}));

app.use('/', require('./routes'))

app.listen(port, () => console.log(`Listening on port: ${port}`))