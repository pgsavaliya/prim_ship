const countryModel = require("../model/country.model");
const adminModel = require("../model/admin.model");
const mongoose = require("mongoose");
const priceChartModel = require("../model/pricechart.model");
const userModel = require("../model/user.model");
const orderModel = require("../model/order.model");
const aboutUsModel = require("../model/about_us.model");
const paymentModel = require("../model/payment.model");
const notificationModel = require("../model/notification.model");
const orderHistoryModel = require("../model/orderhistory.model");
const otpModel = require("../model/otp.model");
const { notification } = require("../helper/notification");
const middleUpload = require("../middleware/imageUpload");
const multer = require("multer");
const { initializeApp, cert } = require("firebase-admin/app");
const { getStorage } = require("firebase-admin/storage");
const serviceAccount = require("../helper/firebase.json");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const orderModelnew = require("../model/orderModel");
const jwt = require("jsonwebtoken");
const bussinessModel = require("../model/bussiness.model");

initializeApp({
  credential: cert(serviceAccount),
});
const bucket = getStorage().bucket(
  "gs://image-upload-nodejs-f3674.appspot.com"
);

module.exports = {
  addToOrderHistory(
    userId,
    userName,
    paymentId,
    paymentDate,
    paymentStatus,
    orderId,
    status,
    trackingNo,
    trackingURL,
    amount,
    transactionType,
    address,
    adminId,
    adminData,
    serviceName,
    courierServiceId,
    serviceCharge,
    seq,
    extraCharge
  ) {
    let historyObj = {
      userId: userId,
      userName: userName,
      paymentId: paymentId,
      paymentDate: paymentDate,
      paymentStatus: paymentStatus,
      orderId: orderId,
      orderTrackingStatus: status,
      trackingNO: trackingNo,
      trackingURL: trackingURL,
      grandTotal: amount,
      transactionType: transactionType,
      address: address,
      adminid: adminId,
      adminName: adminData,
      serviceName: serviceName,
      courierServiceId: courierServiceId,
      serviceCharge: serviceCharge,
      seq: seq,
      extraCharge: extraCharge,
    };
    let newHistoryModel = new orderHistoryModel(historyObj);
    newHistoryModel.save();
  },

  getCountryList: (str) => {
    return new Promise(async (res, rej) => {
      try {
        let qry = {};
        if (str) {
          qry["name"] = { $regex: str, $options: "i" };
        }
        let getData = await countryModel.find(qry, { name: 1, _id: 1 });
        if (getData.length > 0) res({ status: 200, data: getData });
        else rej({ status: 404, error: {}, message: "No data found!!" });
      } catch (err) {
        console.log("err..", err);
        rej({ status: 500, error: err, message: "something went wrong!!" });
      }
    });
  },

  findService: (countryId, weight, length, width, height) => {
    return new Promise(async (res, rej) => {
      try {
        let totalGram = ((length * width * height) / 5000) * 100;
        let z = totalGram / 100;
        let floorVal = Math.floor(z);
        if (Number.isInteger(z)) {
          floorVal = floorVal * 100;
        } else {
          floorVal = floorVal * 100 + 100;
        }
        let resp = await priceChartModel.aggregate([
          {
            $match: {
              countryId: mongoose.Types.ObjectId(countryId),
              parcelGram: floorVal,
            },
          },
          {
            $lookup: {
              from: "courierservices",
              localField: "serviceId",
              foreignField: "_id",
              as: "serviceData",
            },
          },
          { $unwind: "$serviceData" },
          {
            $project: {
              courierServiceId: "$serviceData._id",
              serviceName: "$serviceData.name",
              trackingURL: "$serviceData.trackingURL",
              image: "$serviceData.image",
              price: 1,
              weight: { $literal: weight },
              length: { $literal: length },
              width: { $literal: width },
              height: { $literal: height },
            },
          },
        ]);
        if (resp.length > 0) res({ status: 200, data: resp });
        else rej({ status: 404, error: {}, message: "No data found!!" });
      } catch (err) {
        console.log("err..", err);
        rej({ status: 500, error: err, message: "something went wrong!!" });
      }
    });
  },

  placeOrder: (userId, data) => {
    // console.log("userid..", userId);

    return new Promise(async (res, rej) => {
      try {
        let adminData;
        // console.log("data.adminId....", data.adminId);
        if (data.adminId) {
          adminData = await adminModel.findById(
            { _id: data.adminId },
            { firstName: 1, lastName: 1 }
          );
          // console.log("adminData", adminData);
          if (adminData) {
            adminData = adminData.firstName + " " + adminData.lastName;
          }
        }
        let seq = await orderModel.find();
        data["seq"] = await (seq.length + 1);
        // console.log("data...", data);

        //check if user has enoght credit or not
        let creditData = await userModel.findById(
          { _id: userId },
          {
            credit: 1,
            _id: 0,
            firstName: 1,
            lastName: 1,
            verifiedStatus: 1,
            userStatus: 1,
          }
        );
        if (
          creditData.verifiedStatus != "approve" ||
          creditData.userStatus != "active"
        ) {
          rej({
            status: 500,
            error: {},
            message: `You can not place order because your verifiedStatus is {creditData.verifiedStatus} and userStatus is {creditData.userStatus}`,
          });
        } else {
          if (creditData.credit >= data.amount) {
            data["userId"] = userId;
            data["userName"] = creditData.firstName + " " + creditData.lastName;

            if (data.insurance == true) {
              let a = (4 * data.product.itemValue) / 100;
              let gst_a = (18 * a) / 100;
              a = a + gst_a;
              grandTotal = a + data.amount;
              data["grandTotal"] = grandTotal;
            } else {
              data["grandTotal"] = data.amount;
            }

            let newOrderModel = new orderModel(data);
            let savedata = await newOrderModel.save();
            if (data.userId) {
              let notify = await notification(
                userId,
                "Your order placed successfully!!",
                "Your order placed successfully!!",
                "order"
              );
            }
            if (savedata) {
              let updatedData = await userModel.findByIdAndUpdate(
                { _id: userId },
                { credit: creditData.credit - data.grandTotal },
                { new: true }
              );

              //add to record payment model
              let paymentObj = {
                userId: userId,
                paymentDate: new Date(),
                orderId: savedata._id,
                paymentStatus: "complete",
                orderTrackingStatus: "pending",
                transactionAmount: savedata.grandTotal,
                transactionType: "debit",
                adminId: userId,
              };

              let newPaymentData = new paymentModel(paymentObj);
              let savPaymentHis = await newPaymentData.save();

              //add entry to order history

              let historyObj = {
                userId: savedata.userId,
                userName: savedata.userName,
                paymentId: savPaymentHis._id,
                paymentDate: savPaymentHis.paymentDate,
                paymentStatus: savPaymentHis.paymentStatus,
                orderId: savedata._id,
                orderTrackingStatus: savedata.orderTrackingStatus,
                trackingNO: savedata.trackingNo || "",
                trackingURL: savedata.trackingURL,
                grandTotal: savedata.grandTotal,
                transactionType: savPaymentHis.transactionType,
                address: savedata.address,
                adminid: data.adminId,
                adminName: adminData,
                serviceName: savedata.serviceName,
                courierServiceId: savedata.courierServiceId,
                serviceCharge: savedata.amount,
                seq: savedata.seq,
                extraCharge: savedata.extraCharge,
              };
              let newHistoryModel = new orderHistoryModel(historyObj);
              let newhis = await newHistoryModel.save();

              // notification
              let notify = await notification(
                userId,
                "Amount debited successfully!!",
                "Amount debited successfully!!",
                "payment"
              );

              if (updatedData) {
                res({ status: 200, data: "order placed successfully!!" });
              } else
                rej({
                  status: 500,
                  error: {},
                  message: "amount is not deducted from user account!!",
                });
            } else {
              rej({
                status: 500,
                error: {},
                message: "something went wrong!!11",
              });
            }
          } else {
            rej({
              status: 500,
              error: {},
              message: "You have not enough credit amount to place an order!!",
            });
          }
        }
      } catch (err) {
        console.log("err..", err);
        rej({ status: 500, error: {}, message: "something went wrong!!22" });
      }
    });
  },

  byId: (_id) => {
    return new Promise(async (res, rej) => {
      try {
        let getData = await orderModel.aggregate([
          {
            $match: { _id: mongoose.Types.ObjectId(_id) },
          },
          {
            $project: {
              _id: 0,
              orderId: "$_id",
              serviceName: 1,
              orderTrackingStatus: 1,
              trackingURL: 1,
              courierId: 1,
              amount: 1,
              trackingNo: 1,
              address: 1,
              product: 1,
              consignName: 1,
              mobile: 1,
              insurance: 1,
              userId: 1,
              userName: 1,
              refund: 1,
              isRefund: 1,
              grandTotal: 1,
              extraCharge: 1,
              courierServiceId: 1,
              seq: 1,
            },
          },
        ]);
        if (getData) {
          res({ status: 200, data: getData[0] });
        } else {
          rej({ status: 404, message: "Invalid user id!!" });
        }
      } catch (err) {
        console.log(err);
        rej({ status: 500, error: err, message: "something went wrong!!" });
      }
    });
  },

  getAboutUs: () => {
    return new Promise(async (res, rej) => {
      try {
        let getData = await aboutUsModel.find({});
        if (getData) {
          res({ status: 200, data: getData });
        } else {
          rej({ status: 500, message: "something went wrong!!" });
        }
      } catch (err) {
        console.log(err);
        rej({ status: 500, error: err, message: "something went wrong!!" });
      }
    });
  },

  upload: (image) => {
    return new Promise(async (res, rej) => {
      try {
        let uploaded = bucket.upload(image.path, {
          public: true,
          destination: `images/${Math.random() * 10000 + image.filename}`,
          metadata: {
            firebaseStorageDownloadTokens: uuidv4(),
          },
        });
        let data = await uploaded;
        if (data) {
          fs.unlinkSync(image.path);
          res({
            status: 200,
            data: {
              mediaLink: data[0].metadata.mediaLink,
              name: data[0].metadata.name,
            },
          });
        }
      } catch (err) {
        console.log("error..", err);
        rej({ status: 500, error: err });
      }
    });
  },

  delete: (image) => {
    return new Promise(async (res, rej) => {
      try {
        const deleted = await bucket.file(image).delete();
        if (deleted) {
          res({ status: 200, data: "image deleted Successfully !!" });
        } else {
          rej({ status: 500, error: err });
        }
      } catch (err) {
        console.log("err/...", err);
        rej({ status: 500, error: err });
      }
    });
  },

  sendOtp: (mobile, email, otp) => {
    return new Promise(async (res, rej) => {
      try {
        var newOtpModel;
        // let otp = Math.floor(100000 + Math.random() * 900000);
        if (email && mobile) {
          var newOtpModel = new otpModel({ mobile, email, otp });
        } else if (mobile) {
          var newOtpModel = new otpModel({ mobile, otp });
        } else {
          var newOtpModel = new otpModel({ email, otp });
        }
        let savedata = await newOtpModel.save();
        setTimeout(async () => {
          let deletedotp = await otpModel.findOneAndDelete({ otp: otp });
        }, 5 * 60 * 1000);
        if (savedata) {
          res({ status: 200, data: otp });
        } else {
          rej({ status: 500, message: "something went wrong!!" });
        }
      } catch (err) {
        rej({ status: 500, error: err, message: "something went wrong!!" });
      }
    });
  },

  verifyOtp: (mobile, email, otp) => {
    return new Promise(async (res, rej) => {
      try {
        let getData;
        if (mobile && email && otp) {
          getData = await otpModel.findOneAndDelete({ mobile, email, otp });
        } else if (mobile && otp && !email) {
          getData = await otpModel.findOneAndDelete({ mobile, otp });
        } else if (email && otp && !mobile) {
          getData = await otpModel.findOneAndDelete({ email, otp });
        }
        if (getData) {
          let token = jwt.sign({ mobile, email }, process.env.USER_OTP_TOKEN, {
            expiresIn: process.env.USER_OTP_ACCESS_TIME,
          });
          res({ status: 200, token: token });
        } else {
          rej({ status: 404, message: "Invalid mobile  or email!!" });
        }
      } catch (err) {
        console.log(err);
        rej({ status: 500, error: err, message: "something went wrong!!" });
      }
    });
  },

  getLogo: () => {
    return new Promise(async (res, rej) => {
      try {
        let getData = await bussinessModel.find({}, { logo: 1 });
        if (getData.length > 0) {
          res({ status: 200, data: getData[0].logo });
        } else {
          rej({ status: 404, message: "No data found!!" });
        }
      } catch (err) {
        console.log(err);
        rej({ status: 500, error: err, message: "something went wrong!!" });
      }
    });
  },
};
