const { Schema, model } = require("mongoose");

let address = new Schema({
  country: {
    type: String,
    required: [true, "country is required"],
  },
  state: {
    type: String,
    required: [true, "state is required"],
  },
  city: {
    type: String,
    required: [true, "city is required"],
  },
  pincode: {
    type: String,
    required: [true, "pincode is necessary for deliver the prodcut"],
  },
  addressDescrption1: {
    type: String,
    required: [true, "atleast have something"],
    min: 1,
  },
  addressDescrption2: {
    type: String,
    min: [1, "atleast have something"],
  },
});

const orderSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "users",
    },
    adminId: {
      type: Schema.Types.ObjectId,
      ref: "admins",
    },
    userName: {
      type: String,
      ref: "users",
    },
    orderTrackingStatus: {
      type: String,
      trim: true,
      enum: ["pending", "complete", "cancel", "parcelDispatch"],
      default: "pending",
    },
    trackingNo: {
      type: String,
      trim: true,
    },
    trackingURL: {
      type: "String",
    },
    courierServiceId: {
      type: Schema.Types.ObjectId,
    },
    serviceName: {
      type: String,
      trim: true,
      required: true,
    },
    amount: {
      type: Number,
      trim: true,
    },
    address: {
      type: address,
    },
    product: {
      content: {
        type: String,
        trime: true,
        required: true,
      },
      height: {
        type: Number,
      },
      weight: {
        type: Number,
      },
      length: {
        type: Number,
      },
      width: {
        type: Number,
      },
      qty: {
        type: Number,
        require: true,
      },
      itemValue: {
        type: Number,
        require: true,
      },
    },
    consignName: {
      type: String,
      require: true,
    },
    mobile: {
      type: Number,
      require: true,
    },
    insurance: {
      type: Boolean,
      default: false,
    },
    refund: {
      type: Number,
    },
    isRefund: {
      type: Boolean,
      default: false,
    },
    grandTotal: {
      type: Number,
    },
    extraCharge: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = model("orderModel", orderSchema);
