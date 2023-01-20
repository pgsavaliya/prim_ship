const orderModel = require("../../model/order.model");
const paymentModel = require("../../model/payment.model");
const userModel = require("../../model/user.model");
const adminModel = require("../../model/admin.model");
const orderHistoryModel = require("../../model/orderhistory.model");
const notificationModel = require("../../model/notification.model");
const historymodel = require("../../model/orderhistory.model");
const refund = require("../user/refund");
const { addToOrderHistory } = require("../common");
let { notification } = require("../../helper/notification");
const mongoose = require("mongoose");
const businessModel = require("../../model/bussiness.model");

module.exports = {
  addForwardingNo: (userId, orderId, trackingNo) => {
    return new Promise(async (res, rej) => {
      try {
        let getData = await orderModel.findByIdAndUpdate(
          { _id: orderId },
          { trackingNo: trackingNo, orderTrackingStatus: "parcelDispatch" },
          { new: true }
        );
        let paymentData = await paymentModel.findOneAndUpdate(
          { orderId },
          { orderTrackingStatus: "parcelDispatch" },
          { new: true }
        );
        let adminData = await adminModel.findById(
          { _id: userId },
          { firstName: 1, lastName: 1 }
        );
        adminData = adminData.firstName + " " + adminData.lastName;
        let hisData = await orderHistoryModel.findOne({ orderId: orderId });
        if (hisData) {
          await orderHistoryModel
            .findOneAndUpdate(
              { orderId: orderId },
              { trackingNo, orderTrackingStatus: "parcelDispatch" },
              { upsert: true }
            )
            .then((result) => {
              res({ status: 200, data: {} });
            })
            .catch((err) => {
              rej({
                status: 500,
                error: err,
                message: "something went wrong!!",
              });
            });
        } else {
          addToOrderHistory(
            getData.userId,
            getData.userName,
            paymentData._id,
            paymentData.paymentDate,
            paymentData.paymentStatus,
            orderId,
            "parcelDispatch",
            trackingNo,
            getData.trackingURL,
            getData.grandTotal,
            paymentData.transactionType,
            getData.address,
            userId,
            adminData,
            getData.serviceName,
            getData.courierServiceId
          );
          notification(
            getData.userId,
            `Your order is ready for dispatch and trackingNo is ${trackingNo}`,
            "parcelDispatch",
            "order",
            orderId
          )
            .then(() => {
              res({ status: 200, data: {} });
            })
            .catch((err) => {
              rej({ status: 500, error: err, message: "something went wrong" });
            });
        }
      } catch (err) {
        rej({ status: 500, error: err, message: "something went wrong!!" });
      }
    });
  },

  get: (str, status, startDate, endDate, page, limit) => {
    return new Promise(async (res, rej) => {
      try {
        let qry = {};
        page = parseInt(page);
        limit = parseInt(limit);
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
            $addFields: {
              date: {
                $dateToString: { format: "%d-%m-%Y", date: "$createdAt" },
              },
            },
          },
          {
            $match: qry,
          },
          {
            $lookup: {
              from: "courierservices",
              localField: "courierServiceId",
              foreignField: "_id",
              as: "courierOrderData",
            },
          },
          {
            $lookup: {
              from: "payments",
              localField: "_id",
              foreignField: "orderId",
              as: "PaymentOrderData",
            },
          },
          {
            $lookup: {
              from: "admins",
              localField: "adminId",
              foreignField: "_id",
              as: "adminData",
            },
          },
          // { $unwind: "$adminData" },
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
                    adminFname: { $first: "$adminData.firstName" },
                    adminLname: { $first: "$adminData.lastName" },
                    _id: 1,
                    orderId: "$_id",
                    serviceName: { $first: "$courierOrderData.name" },
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
                    refund: 1,
                    isRefund: 1,
                    grandTotal: 1,
                    message: "$PaymentOrderData.message",
                    extraCharge: 1,
                    insurance: 1,
                    seq: 1,
                    mobile: 1,
                    user: {
                      userId: "$userId",
                      userName: "$userName",
                    },
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
        rej({ status: 500, error: err, message: "something went wrong!!" });
      }
    });
  },

  edit: (userId, data) => {
    return new Promise(async (res, rej) => {
      try {
        let notify;
        let adminData = await adminModel.findById(userId);
        adminData = adminData.firstName + " " + adminData.lastName;
        let getorderData = await orderModel.findById(data.orderId);
        if (getorderData) {
          if (
            !(
              (!getorderData.insurance &&
                getorderData.orderTrackingStatus == "cancel") ||
              (getorderData.insurance &&
                getorderData.orderTrackingStatus == "cancel" &&
                getorderData.isRefund)
            )
          ) {
            if (data.trackingNo) {
              if (
                getorderData.trackingNo &&
                getorderData.trackingNo !== data.trackingNo
              ) {
                let a1 = await orderModel.findByIdAndUpdate(
                  {
                    _id: data.orderId,
                  },
                  {
                    orderTrackingStatus: "parcelDispatch",
                    trackingNo: data.trackingNo,
                  },
                  { new: true }
                );
                let a10 = await orderHistoryModel.findOneAndUpdate(
                  {
                    orderId: data.orderId,
                  },
                  {
                    trackingNo: data.trackingNo,
                    orderTrackingStatus: a1.orderTrackingStatus,
                  },
                  { upsert: true }
                );
                notify = await notification(
                  data.userId,
                  `Your tracking number is change and new tracking number is ${data.trackingNo}`,
                  "tracking number change",
                  "order",
                  data.orderId
                );
              }
              // tracking number is add else {
              let a2 = await orderModel.findByIdAndUpdate(
                {
                  _id: data.orderId,
                },
                {
                  orderTrackingStatus: "parcelDispatch",
                  trackingNo: data.trackingNo,
                },
                { new: true }
              );
              let paymentData = await paymentModel.findOneAndUpdate(
                {
                  orderId: data.orderId,
                },
                {
                  orderTrackingStatus: "parcelDispatch",
                },
                { new: true }
              );
              let hisData = await orderHistoryModel.findOneAndUpdate(
                {
                  orderId: data.orderId,
                },
                {
                  orderTrackingStatus: "parcelDispatch",
                  trackingNo: data.trackingNo,
                }
              );
              if (!hisData) {
                addToOrderHistory(
                  getorderData.userId,
                  getorderData.userName,
                  paymentData._id,
                  paymentData.paymentDate,
                  paymentData.paymentStatus,
                  data.orderId,
                  "parcelDispatch",
                  data.trackingNo,
                  getorderData.trackingURL,
                  getorderData.grandTotal,
                  paymentData.transactionType,
                  getorderData.address,
                  userId,
                  adminData.firstName + " " + adminData.lastName,
                  getorderData.serviceName,
                  getorderData.courierServiceId,
                  getorderData.amount,
                  getorderData.seq,
                  getorderData.extraCharge
                );
              }
              if (
                !(
                  getorderData.trackingNo &&
                  getorderData.trackingNo == data.trackingNo
                )
              ) {
                notify = await notification(
                  data.userId,
                  `Your order is ready to dispatch and tracking number is ${data.trackingNo}`,
                  "ready for dispatch",
                  "order",
                  data.orderId
                );
              }
            }
            if (data.orderTrackingStatus === "cancel") {
              let orderData = await orderModel.findByIdAndUpdate(
                { _id: getorderData._id },
                { orderTrackingStatus: "cancel" },
                { new: true }
              );
              let serviceCharge =
                orderData.grandTotal + (orderData.extraCharge || 0);
              if (getorderData.orderTrackingStatus !== "cancel") {
                let a4 = await userModel.findByIdAndUpdate(
                  { _id: data.userId },
                  { $inc: { credit: serviceCharge } },
                  { new: true }
                );
                let paymentObj = {
                  userId: orderData.userId,
                  paymentDate: new Date(),
                  orderId: orderData._id,
                  paymentStatus: "complete",
                  orderTrackingStatus: orderData.orderTrackingStatus,
                  transactionAmount: serviceCharge,
                  transactionType: "creditServiceCharge",
                };
                let newPaymentData = new paymentModel(paymentObj);
                let savPaymentHis = await newPaymentData.save();
                // notification
                notify = await notification(
                  data.userId,
                  "Your order is cancel and service charge or extra charge(if any) is refunded ",
                  "cancel",
                  "order",
                  data.orderId
                );
                let a5 = await orderHistoryModel.findOneAndUpdate(
                  {
                    orderId: data.orderId,
                  },
                  {
                    orderTrackingStatus: "cancel",
                    orderId: orderData.orderId,
                    trackingNo: orderData.trackingNo,
                    trackingURL: orderData.trackingURL,
                    address: orderData.address,
                    adminid: userId,
                    adminName: adminData,
                    serviceName: orderData.serviceName,
                    courierServiceId: orderData.courierServiceId,
                    serviceCharge: orderData.amount,
                    extraCharge: orderData.extraCharge || 0,
                    userId: orderData.userId,
                    userName: orderData.userName,
                    consignName: orderData.consignName,
                    transactionType: "noRefund",
                    grandTotal: orderData.grandTotal,
                    refund: serviceCharge,
                    isRefund: false,
                    paymentId: savPaymentHis._id,
                    paymentDate: savPaymentHis.paymentDate,
                    paymentStatus: "complete",
                    seq: orderData.seq,
                    extraCharge: orderData.extraCharge,
                    serviceCharge: orderData.amount,
                  },
                  { upsert: true }
                );
              }
              if (
                data.refund &&
                orderData.insurance == true &&
                !orderData.isRefund
              ) {
                if (orderData.product.itemValue < data.refund) {
                  rej({
                    status: 404,
                    message: "Refund should not more than itemValue!!",
                  });
                } else {
                  let a3 = await orderModel.findByIdAndUpdate(
                    {
                      _id: data.orderId,
                    },
                    {
                      refund: data.refund,
                      isRefund: true,
                    },
                    { new: true }
                  );
                  let a4 = await userModel.findByIdAndUpdate(
                    {
                      _id: data.userId,
                    },
                    {
                      $inc: {
                        credit: data.refund,
                      },
                    },
                    { new: true }
                  );
                  let paymentObj = {
                    userId: data.userId,
                    paymentDate: new Date(),
                    orderId: data.orderId,
                    paymentStatus: "complete",
                    orderTrackingStatus: data.orderTrackingStatus,
                    transactionAmount: data.refund,
                    transactionType: "refund",
                  };
                  let newPaymentData = new paymentModel(paymentObj);
                  let savPaymentHis = await newPaymentData.save();
                  let a5 = await orderHistoryModel.findOneAndUpdate(
                    {
                      orderId: data.orderId,
                    },
                    {
                      $inc: { refund: data.refund },
                      refundDate: new Date(),
                      isRefund: true,
                    },
                    { new: true }
                  );
                  if (!a5) {
                    addToOrderHistory(
                      data.userId,
                      data.userName,
                      savPaymentHis._id,
                      savPaymentHis.paymentDate,
                      savPaymentHis.paymentStatus,
                      data.orderId,
                      data.orderTrackingStatus,
                      data.trackingNo,
                      data.trackingURL,
                      data.grandTotal,
                      savPaymentHis.transactionType,
                      data.address,
                      userId,
                      adminData,
                      data.serviceName,
                      data.courierServiceId,
                      data.amount,
                      data.seq,
                      data.extraCharge
                    );
                  }
                  notify = await notification(
                    data.userId,
                    `You got refund ${data.refund}`,
                    "refund",
                    "payment",
                    data.orderId
                  );
                }
              } else if (getorderData.orderTrackingStatus == "cancel") {
                rej({
                  status: 404,
                  message: "this order is already cancelled!!",
                });
              }
            }
            res({ status: 200, data: {} });
          } else {
            rej({ status: 404, message: "You can not edit this order!!" });
          }
        } else {
          rej({ status: 404, message: "Invalid order Id!!" });
        }
      } catch (err) {
        console.log("err..", err);
        rej({ status: 500, error: err, message: "something went wrong!!" });
      }
    });
  },

  getUser: () => {
    return new Promise(async (res, rej) => {
      try {
        let getData = await userModel.aggregate([
          {
            $match: { userStatus: "active", verifiedStatus: "approve" },
          },
          {
            $project: {
              Name: { $concat: ["$firstName", " ", "$lastName"] },
            },
          },
        ]);
        if (getData) res({ status: 200, data: getData });
        else rej({ status: 500, message: "something went wrong!!" });
      } catch (err) {
        console.log("error", err);
        rej({ status: 500, error: err, message: "something went wrong!!" });
      }
    });
  },

  orderCount: () => {
    return new Promise(async (res, rej) => {
      try {
        let getData = await orderModel.aggregate([
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

  extraCharge: (userId, orderId, amount, message) => {
    return new Promise(async (res, rej) => {
      try {
        let adminData = await adminModel.findById(
          { _id: userId },
          { firstName: 1, lastName: 1 }
        );
        if (adminData) {
          adminData = adminData.firstName + " " + adminData.lastName;
        }
        let check = await orderModel.findById(orderId, {
          _id: 1,
          userId: 1,
          extraCharge: 1,
        });
        if (check.extraCharge) {
          amount += check.extraCharge;
        }
        let orderData = await orderModel.findByIdAndUpdate(
          orderId,
          { $inc: { extraCharge: amount } },
          { new: true }
        );
        let orderHisData = await orderHistoryModel.findOneAndUpdate(
          { orderId: orderId },
          {
            $inc: { extraCharge: amount, grandTotal: amount },
            adminid: mongoose.Types.ObjectId(userId),
          },
          { new: true }
        );
        let userData = await userModel.findByIdAndUpdate(
          orderData.userId,
          { $inc: { credit: -amount } },
          { new: true }
        );

        if (userData.credit < 0) {
          let updateUserData = await userModel.findByIdAndUpdate(
            orderData.userId,
            { $inc: { credit: amount } }
          );
          rej({ status: 404, message: "Not enough credit in user wallet!!" });
        } else {
          let paymentObj = {
            userId: userData._id,
            paymentDate: new Date(),
            orderId: orderId,
            paymentStatus: "complete",
            orderTrackingStatus: orderData.orderTrackingStatus,
            transactionAmount: amount,
            transactionType: "debitExtraCharge",
            adminId: userId,
            message: message,
          };
          let newPaymentData = new paymentModel(paymentObj);
          let savPaymentHis = await newPaymentData.save();
          let notify = await notification(
            userId,
            "Amount debited successfully!!",
            "extra charges!!",
            "payment"
          );
          if (savPaymentHis) {
            res({ status: 200, data: {} });
          } else {
            rej({ status: 500, message: "something went wrong!!" });
          }
        }
      } catch (err) {
        rej({ status: 500, error: err, message: "something went wrong!!" });
      }
    });
  },

  inVoice: (userId, page, limit, startDate, endDate) => {
    return new Promise(async (res, rej) => {
      try {
        page = parseInt(page);
        limit = parseInt(limit);
        let qry = {};
        if (startDate && endDate) {
          startDate = new Date(startDate);
          endDate = new Date(endDate);
          endDate.setDate(endDate.getDate() + 1);
          qry["$and"] = [
            { "paymentOrderData.updatedAt": { $gt: startDate } },
            { "paymentOrderData.updatedAt": { $lt: endDate } },
          ];
        }
        let order = await orderModel.findOne({ userId });
        if (qry && startDate && endDate) {
          let getData = await paymentModel.aggregate([
            { $match: { userId: mongoose.Types.ObjectId(userId) } },
            {
              $lookup: {
                from: "orders",
                localField: "orderId",
                foreignField: "_id",
                as: "paymentOrderData",
              },
            },
            { $unwind: "$paymentOrderData" },
            { $match: qry },
            {
              $lookup: {
                from: "courierservices",
                localField: "paymentOrderData.courierServiceId",
                foreignField: "_id",
                as: "OrderServiceData",
              },
            },
            { $unwind: "$OrderServiceData" },
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
                      consignName: "$paymentOrderData.consignName",
                      logo: "$OrderServiceData.image",
                      postCode: "$paymentOrderData.address1.pincode",
                      item: "$paymentOrderData.product.content",
                      serviceName: "$paymentOrderData.serviceName",
                      courierServiceId: "$paymentOrderData.courierServiceId",
                      createdAt: "$paymentOrderData.createdAt",
                      updatedAt: "$paymentOrderData.updatedAt",
                      paymentId: "$_id",
                      paymentDate: 1,
                      paymentStatus: 1,
                      orderTrackingStatus: 1,
                      trackingNo: "$paymentOrderData.trackingNo",
                      transactionAmount: 1,
                      transactionType: 1,
                    },
                  },
                  { $sort: { createdAt: 1 } },
                  { $skip: (page - 1) * limit },
                  { $limit: limit },
                ],
              },
            },
          ]);
          getData = getData[0];
          if (getData) {
            if (getData.result.length > 0) {
              res({
                status: 200,
                data: {
                  total_count: getData.total_count[0].count,
                  result: getData.result,
                },
              });
            } else {
              rej({ status: 404, message: "No data found!!" });
            }
          } else rej({ status: 404, message: "something went wrong!!" });
        } else {
          rej({ status: 500, message: "Please enter startDate & endDate" });
        }
      } catch (err) {
        rej({ status: 500, error: err, message: "something went wrong!!" });
      }
    });
  },

  printInVoice: (userId, startDate, endDate) => {
    return new Promise(async (res, rej) => {
      try {
        let qry = {};
        if (startDate && endDate) {
          startDate = new Date(startDate);
          endDate = new Date(endDate);
          endDate.setDate(endDate.getDate() + 1);
          qry["$and"] = [
            { "paymentOrderData.updatedAt": { $gt: startDate } },
            { "paymentOrderData.updatedAt": { $lt: endDate } },
          ];
        }
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
        let order = await orderModel.findOne({ userId });
        if (qry && startDate && endDate) {
          let getData = await paymentModel.aggregate([
            { $match: { userId: mongoose.Types.ObjectId(userId) } },
            {
              $lookup: {
                from: "orders",
                localField: "orderId",
                foreignField: "_id",
                as: "paymentOrderData",
              },
            },
            { $unwind: "$paymentOrderData" },
            { $match: qry },
            {
              $lookup: {
                from: "courierservices",
                localField: "paymentOrderData.courierServiceId",
                foreignField: "_id",
                as: "OrderServiceData",
              },
            },
            { $unwind: "$OrderServiceData" },
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
                      consignName: "$paymentOrderData.consignName",
                      logo: "$OrderServiceData.image",
                      postCode: "$paymentOrderData.address1.pincode",
                      item: "$paymentOrderData.product.content",
                      serviceName: "$paymentOrderData.serviceName",
                      courierServiceId: "$paymentOrderData.courierServiceId",
                      createdAt: "$paymentOrderData.createdAt",
                      updatedAt: "$paymentOrderData.updatedAt",
                      paymentId: "$_id",
                      paymentDate: 1,
                      paymentStatus: 1,
                      orderTrackingStatus: 1,
                      trackingNo: "$paymentOrderData.trackingNo",
                      transactionAmount: 1,
                      transactionType: 1,
                    },
                  },
                  { $sort: { createdAt: 1 } },
                ],
              },
            },
          ]);
          getData = getData[0];
          if (getData) {
            if (getData.result.length > 0) {
              res({
                status: 200,
                data: {
                  total_count: getData.total_count[0].count,
                  result: getData.result,
                  businessData,
                  userData,
                },
              });
            } else {
              rej({ status: 404, message: "No data found!!" });
            }
          } else rej({ status: 404, message: "something went wrong!!" });
        } else {
          rej({ status: 500, message: "Please enter startDate & endDate" });
        }
      } catch (err) {
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

};
