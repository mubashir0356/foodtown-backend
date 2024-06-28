const express = require('express');
const cors = require('cors');

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({ limit: "50mb" }))

module.exports = app