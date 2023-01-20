const { model, Schema } = require("mongoose");

const setUpSchema = new Schema({
  isSetup: {
    type: Boolean,
    default: false,
  }
}, { timestamps: true })

module.exports = model("setup", setUpSchema);
