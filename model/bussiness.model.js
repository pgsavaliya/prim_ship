const { Schema, model } = require("mongoose");
const { string, boolean, array } = require("joi");

let businessAddress = new Schema({
    addressName: {
        type: String,
    },
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
    addressDescrption: {
        type: String,
        min: [1, "atleast have something"],
    },
});

const bussinessSchema = new Schema(
    {
        bussinessName: {
            type: String,
        },
        logo: {
            type: String,
        },
        firstName: {
            type: String,
            trim: true,
            required: true,
        },
        lastName: {
            type: String,
            trim: true,
            required: true,
        },
        mobile: {
            type: Number,
            trim: true,
            match: [/^(\+\d{1,3}[- ]?)?\d{10}$/],
        },
        email: {
            type: String,
            match: [
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                "Please fill a valid email address",
            ],
            required: true,
        },
        mobileOptional: {
            type: Number,
            trim: true,
            match: [/^(\+\d{1,3}[- ]?)?\d{10}$/],
        },
        bussinessWebsite: {
            type: String,
        },
        gstNo: {
            type: String,
        },
        businessAddress: {
            type: businessAddress,
        },
        superAdminId: {
            type: Schema.Types.ObjectId,
            ref: "admins",
        }
    },
    { timestamps: true }
);

module.exports = model("bussiness", bussinessSchema);
