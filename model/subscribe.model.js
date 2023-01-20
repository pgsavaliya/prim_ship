const { Schema, model } = require("mongoose")

let subscribeSchema = new Schema({
    email: {
        type: String,
    }
}, { timestamps: true })

module.exports = model("subscribe", subscribeSchema)
