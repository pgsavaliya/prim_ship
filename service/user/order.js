const countryModel = require("../../model/country.model");
const priceChartModel = require("../../model/pricechart.model");
const serviceModel = require("../../model/courierService.model");
const orderModel = require("../../model/order.model");
const orderHistoryModel = require("../../model/orderhistory.model");
const userModel = require("../../model/user.model");
const mongoose = require("mongoose");
const paymentModel = require("../../model/payment.model");
const { date, object } = require("joi");
const { create } = require("../../model/country.model");
const { promise } = require("bcrypt/promises");
const { extraCharge } = require("../admin/order");
const adminModel = require("../../model/admin.model");
const businessModel = require("../../model/bussiness.model");

module.exports = {
  getCountry: (str) => {
    return new Promise(async (res, rej) => {
      try {
        let qry = {};
        if (str) {
          qry["name"] = { $regex: str, $options: "i" };
        }
        let getData = await countryModel.find(qry, { name: 1, _id: 1 });
        if (getData.length > 0) res({ status: 200, data: getData });
        else rej({ status: 404, error: err, message: "No data found!!" });
      } catch (err) {
        console.log("err..", err);
        rej({ status: 500, error: err, message: "something went wrong!!" });
      }
    });
  },

  get: (userId, str, status, startDate, endDate, page, limit) => {
    return new Promise(async (res, rej) => {
      try {
        page = parseInt(page);
        limit = parseInt(limit);
        let qry = { userId: mongoose.Types.ObjectId(userId) };
        if (str) {
          qry["$or"] = [
            { consignName: { $regex: str, $options: "i" } },
            { "address.pincode": { $regex: str, $options: "i" } },

            {
              $expr: {
                $regexMatch: {
                  input: { $toString: "$trackingNo" },
                  regex: str,
                },
              },
            },
          ];
        }
        if (status) {
          if (status == "all") {
          } else {
            qry["orderTrackingStatus"] = status;
          }
        }
        if (startDate && endDate) {
          startDate = new Date(startDate);
          endDate = new Date(endDate);
          endDate.setDate(endDate.getDate() + 1);
          qry["$and"] = [
            { createdAt: { $gt: startDate } },
            { createdAt: { $lt: endDate } },
          ];
        }
        let getData = await orderModel.aggregate([
          {
            $match: qry,
          },
          {
            $addFields: {
              date: {
                $dateToString: { format: "%d-%m-%Y", date: "$createdAt" },
              },
            },
          },
          {
            $lookup: {
              from: "payments",
              localField: "_id",
              foreignField: "orderId",
              as: "paymentOrderData",
            },
          },
          { $match: qry },
          {
            $facet: {
              total_count: [
                {
                  $group: {
                    _id: null,
                    count: { $sum: 1 },
                  },
                },
              ],
              result: [
                {
                  $project: {
                    _id: 1,
                    seq: 1,
                    orderId: "$_id",
                    serviceName: 1,
                    orderTrackingStatus: 1,
                    trackingURL: 1,
                    courierId: 1,
                    amount: 1,
                    trackingNo: 1,
                    address: 1,
                    product: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    date: 1,
                    consignName: 1,
                    message: "$paymentOrderData.message",
                    extraCharge: 1,
                    mobile: 1,
                  },
                },
                { $sort: { createdAt: -1 } },
                { $skip: (page - 1) * limit },
                { $limit: limit },
              ],
            },
          },
        ]);
        getData = getData[0];
        if (getData.result.length > 0) {
          res({
            status: 200,
            data: {
              total_count: getData.total_count[0].count,
              result: getData.result,
            },
          });
        } else {
          rej({ status: 404, message: "No Data found!!" });
        }
      } catch (err) {
        console.log("err..", err);
        rej({ status: 500, error: err, message: "something went wrong!!" });
      }
    });
  },

  inVoice: (userId, page, limit, startDate, endDate) => {
    return new Promise(async (res, rej) => {
      page = parseInt(page);
      limit = parseInt(limit);
      let qry = {};
      if (startDate && endDate) {
        startDate = new Date(startDate);
        endDate = new Date(endDate);
        endDate.setDate(endDate.getDate() + 1);
        qry["$and"] = [
          { "orderData.updatedAt": { $gt: startDate } },
          { "orderData.updatedAt": { $lt: endDate } },
        ];
      }
      try {
        let getData = await paymentModel.aggregate([
          {
            $match: { userId: mongoose.Types.ObjectId(userId) },
          },
          {
            $lookup: {
              from: "orders",
              localField: "orderId",
              foreignField: "_id",
              as: "orderData",
            },
          },
          { $unwind: "$orderData" },
          { $match: qry },
          {
            $lookup: {
              from: "courierservices",
              localField: "orderData.courierServiceId",
              foreignField: "_id",
              as: "serviceData",
            },
          },
          { $unwind: "$serviceData" },
          {
            $facet: {
              total_count: [
                {
                  $group: {
                    _id: null,
                    count: { $sum: 1 },
                  },
                },
              ],
              result: [
                {
                  $project: {
                    orderId: 1,
                    logo: "$serviceData.image",
                    postCode: "$orderData.address1.pincode",
                    item: "$orderData.product.content",
                    serviceName: "$orderData.serviceName",
                    courierServiceId: "$orderData.courierServiceId",
                    createdAt: "$orderData.createdAt",
                    updatedAt: "$orderData.updatedAt",
                    paymentId: "$_id",
                    paymentDate: 1,
                    paymentStatus: 1,
                    orderTrackingStatus: 1,
                    trackingNO: "$orderData.trackingNo",
                    transactionAmount: 1,
                    transactionType: 1,
                    consignName: "$orderData.consignName",
                  },
                },
                { $sort: { createdAt: 1 } },
                { $skip: (page - 1) * limit },
                { $limit: limit },
              ],
            },
          },
        ]);
        if (getData) {
          getData = getData[0];
          if (getData.result.length > 0) {
            res({
              status: 200,
              data: {
                total_count: getData.total_count[0].count,
                result: getData.result,
                amount: getData.total_count[0].amount,
              },
            });
          } else rej({ status: 404, message: "No data found!!" });
        } else rej({ status: 404, message: "something went wrong!!" });
      } catch (err) {
        console.log("error", err);
        rej({ status: 500, error: err, message: "something went wrong!!" });
      }
    });
  },

  printInVoice: (userId, startDate, endDate) => {
    return new Promise(async (res, rej) => {
      let qry = {};
      if (startDate && endDate) {
        startDate = new Date(startDate);
        endDate = new Date(endDate);
        endDate.setDate(endDate.getDate() + 1);
        qry["$and"] = [
          { "orderData.updatedAt": { $gt: startDate } },
          { "orderData.updatedAt": { $lt: endDate } },
        ];
      }
      try {
        let businessData = await businessModel.find(
          {},
          { bussinessName: 1, logo: 1, businessAddress: 1, gstNo: 1 }
        );
        businessData = businessData[0];
        let userData = await userModel.findById(
          { _id: userId },
          {
            firstName: 1,
            lastName: 1,
            mobile: 1,
            email: 1,
            address: 1,
            credit: 1,
          }
        );

        let getData = await paymentModel.aggregate([
          {
            $match: { userId: mongoose.Types.ObjectId(userId) },
          },
          {
            $lookup: {
              from: "orders",
              localField: "orderId",
              foreignField: "_id",
              as: "orderData",
            },
          },
          { $unwind: "$orderData" },
          { $match: qry },
          {
            $lookup: {
              from: "courierservices",
              localField: "orderData.courierServiceId",
              foreignField: "_id",
              as: "serviceData",
            },
          },
          { $unwind: "$serviceData" },
          {
            $facet: {
              total_count: [
                {
                  $group: {
                    _id: null,
                    count: { $sum: 1 },
                  },
                },
              ],
              result: [
                {
                  $project: {
                    orderId: 1,
                    logo: "$serviceData.image",
                    postCode: "$orderData.address1.pincode",
                    item: "$orderData.product.content",
                    serviceName: "$orderData.serviceName",
                    courierServiceId: "$orderData.courierServiceId",
                    createdAt: "$orderData.createdAt",
                    updatedAt: "$orderData.updatedAt",
                    paymentId: "$_id",
                    paymentDate: 1,
                    paymentStatus: 1,
                    orderTrackingStatus: 1,
                    trackingNO: "$orderData.trackingNo",
                    transactionAmount: 1,
                    transactionType: 1,
                    consignName: "$orderData.consignName",
                  },
                },
                { $sort: { createdAt: 1 } },
              ],
            },
          },
        ]);
        if (getData) {
          getData = getData[0];
          if (getData.result.length > 0) {
            res({
              status: 200,
              data: {
                total_count: getData.total_count[0].count,
                result: getData.result,
                amount: getData.total_count[0].amount,
                businessData,
                userData,
              },
            });
          } else rej({ status: 404, message: "No data found!!" });
        } else rej({ status: 404, message: "something went wrong!!" });
      } catch (err) {
        console.log("error", err);
        rej({ status: 500, error: err, message: "something went wrong!!" });
      }
    });
  },

  billObj: async (userId, startDate, endDate) => {
    return new Promise(async (res, rej) => {
      try {
        let qry = {};
        if (startDate && endDate) {
          startDate = new Date(startDate);
          endDate = new Date(endDate);
          endDate.setDate(endDate.getDate() + 1);
          qry["$and"] = [
            { updatedAt: { $gt: startDate } },
            { updatedAt: { $lt: endDate } },
          ];
        }

        let getData = await orderHistoryModel.aggregate([
          {
            $match: { userId: mongoose.Types.ObjectId(userId) },
          },
          {
            $project: {
              orderTrackingStatus: 1,
              transactionAmount: 1,
              isRefund: 1,
              serviceCharge: 1,
              refund: 1,
              transactionType: 1,
              extraCharge: 1,
              grandTotal: 1,
              updatedAt: 1,
            },
          },
          { $match: qry },
        ]);
        if (getData.length > 0) {
          let cancelOrderCnt = 0;
          let completeOrderCnt = 0;
          let refundOrderCnt = 0;
          let refundOrderAmount = 0;
          let completeOrderAmount = 0;
          let cancelOrderAmount = 0;
          let totalOrderCnt = getData.length;
          let i;

          for (i = 0; i < getData.length; i++) {
            let status = getData[i].orderTrackingStatus;
            if (status == "parcelDispatch") {
              completeOrderCnt++;
              completeOrderAmount += getData[i].grandTotal;
            } else if (status == "cancel") {
              if (getData[i].isRefund) {
                refundOrderCnt++;
                refundOrderAmount =
                  refundOrderAmount +
                  (getData[i].refund - getData[i].grandTotal);
              }
              cancelOrderCnt++, (cancelOrderAmount += getData[i].grandTotal);
            }
          }
          if (i == getData.length) {
            res({
              status: 200,
              data: {
                cancelOrderCnt,
                cancelOrderAmount,
                completeOrderCnt,
                completeOrderAmount,
                refundOrderCnt,
                refundOrderAmount,
              },
            });
          }
        } else {
          res({ status: 404, message: "No data found!" });
        }
      } catch (err) {
        console.log("err..", err);
        rej({ status: 500, error: err, message: "something went wrong!!" });
      }
    });
  },

  trackOrder: (userId, trackingNo) => {
    return new Promise(async (res, rej) => {
      try {
        let url = await orderModel.findOne(
          { userId: userId, trackingNo: trackingNo },
          { trackingURL: 1 }
        );
        if (url) {
          url = url.trackingURL;
        } else {
          ({
            status: 500,
            error: err,
            message: "tracking number is wrong!!",
          });
        }
        let pos = url.indexOf("{{traking_number}}", 0);
        let newUrl;
        if (pos != -1) {
          newUrl = url.slice(0, pos) + trackingNo;
        } else {
          newUrl = url;
        }
        if (newUrl) {
          res({ status: 200, data: newUrl });
        }
      } catch (err) {
        console.log("error", err);
        rej({ status: 500, error: err, message: "something went wrong!!" });
      }
    });
  },

  orderCount: (userId) => {
    return new Promise(async (res, rej) => {
      try {
        let getData = await orderModel.aggregate([
          {
            $match: {
              userId: mongoose.Types.ObjectId(userId),
            },
          },
          {
            $group: {
              _id: "$orderTrackingStatus",
              result: { $push: "$$ROOT" },
              count: { $sum: 1 },
            },
          },
        ]);
        if (getData) {
          let pendingCnt = 0;
          getData.map((item) => {
            if (item._id == "pending") {
              pendingCnt += item.count;
            }
          });
          res({ status: 200, data: { pendingCnt } });
        } else rej({ status: 500, message: "something went wrong!!" });
      } catch (err) {
        console.log("error", err);
        rej({ status: 500, error: err, message: "something went wrong!!" });
      }
    });
  },

  print: (orderId) => {
    return new Promise(async (res, rej) => {
      try {
        let businessData = await businessModel.find(
          {},
          {
            logo: 1,
            mobileOptional: 1,
            bussinessWebsite: 1,
            gstNo: 1,
            bussinessName: 1,
            email: 1,
            businessAddress: 1,
            mobile: 1,
          }
        );

        let printObj = await orderModel.aggregate([
          {
            $match: { _id: mongoose.Types.ObjectId(orderId) },
          },
          {
            $lookup: {
              from: "users",
              localField: "userId",
              foreignField: "_id",
              as: "userData",
            },
          },
          { $unwind: "$userData" },
          {
            $project: {
              _id: 1,
              seq: 1,
              date: "$craetedAt",
              userName: 1,
              userAddress: "$userData.address",
              userMobile: "$userData.mobile",
              gstNo: "$userData.gstNo",
              consignName: 1,
              deliveryAddress: "$address",
              destination: "$address.country",
              pieces: "$product.qty",
              weight: "$product.weight",
              ratePerKg: "$amount",
              extraCharge: 1,
              grandTotal: 1,
              mobile: 1,
              itemvalue: "$product.itemValue",
              serviceName: 1,
              content: "$product.content",
              createdAt: 1,
              updatedAt: 1,
            },
          },
        ]);
        if (printObj) {
          if (printObj.length > 0) {
            printObj = printObj[0];
            let userObj = {};
            userObj["userName"] = printObj.userName;
            userObj["userAddress"] = printObj.userAddress;
            userObj["userMobile"] = printObj.userMobile;
            userObj["gstNo"] = printObj.gstNo;
            delete printObj.userName;
            delete printObj.userAddress;
            delete printObj.userMobile;
            delete printObj.gstNo;
            let insurance = (printObj.grandTotal - printObj.ratePerKg) / 1.18;
            printObj["insurance"] = insurance;
            printObj.ratePerKg = printObj.ratePerKg / 1.18;
            printObj.extraCharge = printObj.extraCharge / 1.18;
            printObj["totalAmount"] =
              printObj.ratePerKg + printObj.extraCharge + insurance;
            let IGST = (printObj.totalAmount * 18) / 100;
            printObj["IGST"] = IGST;
            let roundOff = printObj.totalAmount + IGST;
            printObj["roundOff"] = roundOff;
            printObj.grandTotal = printObj.grandTotal + printObj.extraCharge;
            res({ status: 200, data: { printObj, userObj, businessData } });
          } else {
            rej({ status: 500, message: "something went wrong!!" });
          }
        }
      } catch (err) {
        console.log("err...", err);
        rej({ status: 500, error: err, message: err.message });
      }
    });
  },

};
