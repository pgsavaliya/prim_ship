const paymentModel = require("../../model/payment.model")
const userModel = require("../../model/user.model")
const orderModel = require("../../model/order.model")
const mongoose = require("mongoose")
const { promise } = require("bcrypt/promises")
const notificationModel = require("../../model/notification.model")

module.exports = {
    get: (str, page, limit, userId, paymentStatus) => {
        return new Promise(async (res, rej) => {
            try {
                page = parseInt(page);
                limit = parseInt(limit);
                let qry = { transactionType: "refund", userId: mongoose.Types.ObjectId(userId) };
                if (str) {
                    qry['$or'] = [
                        { 'paymentOrderData.serviceName': { $regex: str, $options: 'i' } },
                        { 'paymentOrderData.consignName': { $regex: str, $options: 'i' } },
                        {
                            "$expr": {
                                "$regexMatch": {
                                    "input": { "$toString": "$paymentOrderData.trackingNo" },
                                    "regex": str
                                }
                            }
                        }
                    ]
                };
                if (paymentStatus) {
                    qry['paymentStatus'] = paymentStatus
                }
                let getData = await paymentModel.aggregate([
                    {
                        $lookup: {
                            from: "orders",
                            localField: "orderId",
                            foreignField: "_id",
                            as: "paymentOrderData"
                        }
                    },
                    { $unwind: '$paymentOrderData' },
                    { $match: qry },
                    {
                        $facet: {
                            total_count: [
                                {
                                    $group: {
                                        _id: null,
                                        count: { $sum: 1 }
                                    }
                                }
                            ],
                            result: [
                                {
                                    $project: {
                                        _id: 1,
                                        orderId: 1,
                                        userId: 1,
                                        orderTrackingStatus: 1,
                                        paymentStatus: 1,
                                        transactionAmount: 1,
                                        transactionType: 1,
                                        paymentDate: 1,
                                        serviceName: '$paymentOrderData.serviceName',
                                        consignName: '$paymentOrderData.consignName',
                                        address: '$paymentOrderData.address',
                                        isRefund: '$paymentOrderData.isRefund',
                                        trackingNo: '$paymentOrderData.trackingNo'
                                    }
                                },
                                { $sort: { date: -1 } },
                                { $skip: (page - 1) * limit },
                                { $limit: limit }
                            ]
                        }
                    }
                ]);
                getData = getData[0];
                if (getData.result.length > 0) {
                    let result = getData.result;
                    let noTrack = [];
                    let arr = [];
                    for (let i = 0; i < result.length; i++) {
                        if (!result[i].orderId) {
                            noTrack.push(result[i]);
                        }
                        else {
                            arr.push(result[i]);
                        }
                    }
                    noTrack.push(...arr);
                    res({ status: 200, data: { total_count: getData.total_count[0].count, result: noTrack } });
                }
                else {
                    rej({ status: 404, message: "No data found!!" });
                }
            }
            catch (err) {
                console.log(err)
                rej({ status: 500, error: err, message: "something went wrong!!" });
            }
        });
    },

    insurance: (userId, isRefund, page, limit) => {
        return new Promise(async (res, rej) => {
            try {
                let qry = {};
                page = parseInt(page);
                limit = parseInt(limit);
                qry = { orderTrackingStatus: "cancel", insurance: true, userId: mongoose.Types.ObjectId(userId) };
                if (isRefund && isRefund !== 'all') {
                    if (isRefund === 'true') {
                        qry['isRefund'] = true
                    }
                    else {
                        qry['isRefund'] = false
                    }
                }
                let getData = await orderModel.aggregate([
                    { $match: qry },
                    {
                        $lookup: {
                            from: "payments",
                            localField: "userId",
                            foreignField: "userId",
                            as: "orderPaymentData"
                        }
                    },
                    {
                        $lookup: {
                            from: "courierservices",
                            localField: "courierServiceId",
                            foreignField: "_id",
                            as: "orderServiceData"
                        }
                    },
                    { $unwind: '$orderServiceData' },
                    {
                        $facet: {
                            total_count: [
                                {
                                    $group: {
                                        _id: null,
                                        count: { $sum: 1 }
                                    }
                                }
                            ],
                            result: [
                                {
                                    $project: {
                                        userId: 1,
                                        isRefund: 1,
                                        insurance: 1,
                                        createdAt: 1,
                                        message: { $first: '$orderPaymentData.message' },
                                        'orderId': '$_id',
                                        orderTrackingStatus: 1,
                                        trackingURL: 1,
                                        courierId: 1,
                                        amount: 1,
                                        trackingNo: 1,
                                        address: 1,
                                        product: 1,
                                        updatedAt: 1,
                                        date: 1,
                                        consignName: 1,
                                        extraCharge: 1,
                                        serviceName: '$orderServiceData.name',
                                        refund: 1
                                    }
                                },
                                { $sort: { createdAt: -1 } },
                                { $skip: (page - 1) * limit },
                                { $limit: limit }
                            ]
                        }
                    }
                ]);
                getData = getData[0];
                if (getData.result.length > 0) {
                    res({ status: 200, data: { total_count: getData.total_count[0].count, result: getData.result } });
                }
                else {
                    rej({ status: 404, message: "No data found!!" });
                }
            }
            catch (err) {
                console.log(err)
                rej({ status: 500, error: err, message: "something went wrong!!" });
            }
        });
    },

}
