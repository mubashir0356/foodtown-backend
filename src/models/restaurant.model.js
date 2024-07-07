const mongoose = require("mongoose")

const restaurantSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        index: true
    },
})

const Restaurant = mongoose.model("Restaurant", restaurantSchema)

module.exports = Restaurant