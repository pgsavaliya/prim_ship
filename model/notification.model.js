const { Schema, model } = require("mongoose");

let notificationSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "users",
    },
    message: {
      type: String,
    },
    reason: {
      type: String,
    },
    type: {
      type: String,
      enum: ["payment", "admin", "order", "user"],
    },
    toAll: {
      type: Boolean,
      default: false,
    },
    adminId: {
      type: Schema.Types.ObjectId,
      ref: "admins",
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "orders",
    },
  },
  { timestamps: true }
);

module.exports = model("notification", notificationSchema);
