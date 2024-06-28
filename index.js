require('dotenv').config()

const app = require('./src/app');
const connectDatabase = require('./src/database/database');

const port = process.env.PORT || 8080

connectDatabase()
    .then(() => {
        app.listen(port, () => {
            console.log(`server is running at localhost://${port}`)
        })
    })
    .catch((error) => {
        console.log("Error while connecting to database ", error)
    });
