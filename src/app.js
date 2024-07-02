const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const userRouter = require('./routes/user.routes');

const app = express()

app.use(cookieParser())

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

// const whitelist = ['http://localhost:5173', 'http://example2.com']
// const corsOptions = {
//     origin: function (origin, callback) {
//         if (whitelist.indexOf(origin) !== -1 || !origin) {
//             callback(null, true)
//         } else {
//             callback(new Error('Not allowed by CORS'))
//         }
//     }
// }

// app.use(cors(corsOptions))

app.use(express.json({ limit: "50mb" }))
app.use(express.urlencoded({ limit: "500mb", extended: true }))
app.use(express.static("public"))

app.get("/", (req, res) => res.send("Food town server running"))

app.use("/foodtown/api/users", userRouter)

module.exports = app