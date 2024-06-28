const mongoose = require('mongoose');
const { dbName } = require('../constants');

const connectDatabase = async () => {
    try {
        const instance = await mongoose.connect(`${process.env.MONGODB_URI}/${dbName}`)
        console.log("DB connected to host: ", instance.host)
    } catch (error) {
        console.log("Error while connecting db through mongoose: ", error)
        process.exit(1)
    }
}

module.exports = connectDatabase