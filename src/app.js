const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const userRouter = require('./routes/user.routes');

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({ limit: "50mb" }))
app.use(express.urlencoded({ limit: "500mb", extended: true }))
app.use(express.static("public"))
app.use(cookieParser())

app.get("/", (req, res) => res.send("Food town server running"))

app.use("/foodtown/api/users", userRouter)

module.exports = app