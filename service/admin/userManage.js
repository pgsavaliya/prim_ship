const userModel = require("../../model/user.model")
const paymentModel = require("../../model/payment.model")
const mongoose = require("mongoose")
const { string } = require("joi")
const notificationModel = require("../../model/notification.model")
let { notification } = require("../../helper/notification")
const orderModel = require("../../model/order.model")

module.exports = {
    unVerified: (str, userStatus, verifiedStatus, page, limit) => {
        return new Promise(async (res, rej) => {
            try {
                page = parseInt(page)
                limit = parseInt(limit)
                let qry = { verifiedStatus: { '$in': ["pending", "reject"] } }
                if (str) {
                    qry['$or'] = [
                        { 'firstName': { $regex: str, $options: 'i' } },
                        { 'lastName': { $regex: str, $options: 'i' } },
                        { 'email': { $regex: str, $options: 'i' } },
                        {
                            "$expr": {
                                "$regexMatch": {
                                    "input": { "$toString": "$mobile" },
                                    "regex": str
                                }
                            }
                        }
                    ]
                }
                if (userStatus) {
                    qry['userStatus'] = userStatus
                }
                if (verifiedStatus) {
                    qry['verifiedStatus'] = verifiedStatus
                }
                let getData = await userModel.aggregate([
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
                                        firstName: 1,
                                        lastName: 1,
                                        mobile: 1,
                                        email: 1,
                                        userStatus: 1,
                                        verifiedStatus: 1,
                                        profileImage: 1
                                    }
                                },
                                { $sort: { date: -1 } },
                                { $skip: (page - 1) * limit },
                                { $limit: limit }
                            ]
                        }
                    }
                ])
                getData = getData[0]
                if (getData.result.length > 0) {
                    let result = getData.result
                    let noTrack = []
                    let arr = []
                    for (let i = 0; i < result.length; i++) {
                        if (!result[i].mobile) {
                            noTrack.push(result[i])
                        }
                        else {
                            arr.push(result[i])
                        }
                    }
                    noTrack.push(...arr)
                    res({ status: 200, data: { total_count: getData.total_count[0].count, result: noTrack } })
                }
                else {
                    rej({ status: 404, message: "No data found!!" })
                }
            }
            catch (err) {
                console.log(err)
                rej({ status: 500, error: err, message: "something went wrong!!" })
            }
        })
    },

    updateStatus: (userId, userStatus, verifiedStatus, message) => {
        return new Promise(async (res, rej) => {
            try {
                let qry = {}
                if (message) {
                    qry['message'] = message
                }
                let updateData = await userModel.findByIdAndUpdate(userId, { 'userStatus': userStatus, 'verifiedStatus': verifiedStatus, 'message': message }, { new: true })
                if (updateData) {
                    if (userStatus) {
                        let notify = notification(userId, `Your userStatus is updated to ${updateData.userStatus} with message ${updateData.message}`, 'UserStatus updated!!', 'admin')
                    }
                    else {
                        let notify = notification(userId, `Your verifiedStatus is updated to ${updateData.verifiedStatus} with message ${updateData.message}`, 'verifiedStatus updated!!', 'admin')
                    }
                    res({ status: 200, data: updateData })
                }
                else {
                    rej({ status: 404, message: "Invalid admin id!!" })
                }
            }
            catch (err) {
                console.log(err)
                rej({ status: 500, error: err, message: "something went wrong!!" })
            }
        })
    },

    verify: (str, userStatus, page, limit) => {
        return new Promise(async (res, rej) => {
            try {
                page = parseInt(page)
                limit = parseInt(limit)
                let qry = { verifiedStatus: "approve" }
                if (str) {
                    qry['$or'] = [
                        { 'firstName': { $regex: str, $options: 'i' } },
                        { 'lastName': { $regex: str, $options: 'i' } },
                        { 'email': { $regex: str, $options: 'i' } },
                        {
                            "$expr": {
                                "$regexMatch": {
                                    "input": { "$toString": "$mobile" },
                                    "regex": str
                                }
                            }
                        }
                    ]
                }
                if (userStatus) {
                    qry['userStatus'] = userStatus
                }
                let getData = await userModel.aggregate([
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
                                        firstName: 1,
                                        lastName: 1,
                                        mobile: 1,
                                        email: 1,
                                        userStatus: 1,
                                        verifiedStatus: 1,
                                        profileImage: 1
                                    }
                                },
                                { $sort: { date: -1 } },
                                { $skip: (page - 1) * limit },
                                { $limit: limit }
                            ]
                        }
                    }
                ])
                getData = getData[0]
                if (getData.result.length > 0) {
                    let result = getData.result
                    let noTrack = []
                    let arr = []
                    for (let i = 0; i < result.length; i++) {
                        if (!result[i].mobile) {
                            noTrack.push(result[i])
                        }
                        else {
                            arr.push(result[i])
                        }
                    }
                    noTrack.push(...arr)
                    res({ status: 200, data: { total_count: getData.total_count[0].count, result: noTrack } })
                }
                else {
                    rej({ status: 404, message: "No data found!!" })
                }
            }
            catch (err) {
                console.log(err)
                rej({ status: 500, error: err, message: "something went wrong!!" })
            }
        })
    },

    getProofImg: (_id) => {
        return new Promise(async (res, rej) => {
            try {
                let getData = await userModel.aggregate([
                    {
                        $match: {
                            _id: mongoose.Types.ObjectId(_id)
                        }
                    },
                    {
                        $project: {
                            aadharCardFrontImg: 1,
                            aadharCardBackImg: 1,
                            panCardImg: 1,
                            gstImg: 1,
                            gstNo: 1
                        }
                    }
                ])
                if (getData) {
                    res({ status: 200, data: getData })
                }
                else {
                    rej({ status: 404, message: "Invalid admin id!!" })
                }
            }
            catch (err) {
                console.log(err)
                rej({ status: 500, error: err, message: "something went wrong!!" })
            }
        })
    },

    getPaymentData: (userId, page, limit, transactionType) => {
        return new Promise(async (res, rej) => {
            try {
                page = parseInt(page)
                limit = parseInt(limit)
                let qry = {}
                let project = {}
                qry = { userId: mongoose.Types.ObjectId(userId) }
                if (transactionType && transactionType !== 'all') {
                    qry['transactionType'] = transactionType
                    if (transactionType == 'credit') {
                        project = {
                            _id: 1,
                            transactionAmount: 1,
                            paymentDate: 1,
                            transactionType: 1,
                            paymentStatus: 1,
                            orderId: 1,
                            message: 1
                        }
                    }
                    else {
                        project = {
                            _id: 1,
                            transactionAmount: 1,
                            paymentDate: 1,
                            transactionType: 1,
                            orderId: 1,
                            message: 1,
                            serviceName: { $first: '$paymentOrderData.serviceName' }
                        }
                    }
                }
                else {
                    project = {
                        _id: 1,
                        transactionAmount: 1,
                        paymentDate: 1,
                        transactionType: 1,
                        paymentStatus: 1,
                        orderId: 1,
                        message: 1,
                        serviceName: { $first: '$paymentOrderData.serviceName' }
                    }
                }
                let user = await userModel.findById(userId)
                let getData = await paymentModel.aggregate([
                    { $match: qry },
                    {
                        $lookup: {
                            from: "orders",
                            localField: "userId",
                            foreignField: "userId",
                            as: "paymentOrderData"
                        }
                    },
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
                                    $project: project
                                },
                                { $sort: { paymentDate: -1 } },
                                { $skip: (page - 1) * limit },
                                { $limit: limit }
                            ]
                        }
                    }
                ])
                getData = getData[0]
                if (getData.result.length > 0) {
                    res({ status: 200, data: { wallet_amount: user.credit, total_count: getData.total_count[0].count, result: getData.result } })
                }
                else {
                    rej({ status: 404, message: "No data found!!" })
                }
            }
            catch (err) {
                console.log(err)
                rej({ status: 500, error: err, message: "something went wrong!!" })
            }
        })
    },

    addCredit: (_id, credit, proofImg, status) => {
        return new Promise(async (res, rej) => {
            try {
                let getData = await userModel.findByIdAndUpdate(_id, { $inc: { credit: credit }, 'proofImage': proofImg || "" }, { new: true });
                if (getData) {
                    let paymentObj = {
                        'userId': _id,
                        'paymentDate': new Date(),
                        'paymentStatus': status,
                        'transactionAmount': credit,
                        'transactionType': 'credit',
                        'paymentProofImg': proofImg || ""
                    }
                    let newPaymentData = new paymentModel(paymentObj)
                    let savPaymentHis = await newPaymentData.save()
                    res({ status: 200, data: {} })
                    let notify = await notification(_id, `${credit} added to your wallet and your current wallet balance is ${getData.credit}`, "add amount", "payment")
                }
                else {
                    rej({ status: 404, message: "No data found!!" })
                }
            }
            catch (err) {
                console.log(err)
                rej({ status: 500, error: err, message: "something went wrong!!" })
            }
        })
    },

    activeUser: (_id, paymentProofImg, paymentStatus) => {
        return new Promise(async (res, rej) => {
            try {
                let getData = await paymentModel.findByIdAndUpdate({ _id }, { paymentProofImg: paymentProofImg, paymentStatus: paymentStatus }, { new: true })
                if (getData) {
                    res({ status: 200, data: getData })
                    let paymentObj = {
                        'userId': _id,
                        'paymentDate': new Date(),
                        'paymentStatus': data.paymentStatus,
                        'orderTrackingStatus': 'pending',
                        'transactionAmount': differenceData,
                        'transactionType': 'credit',
                        'paymentProofImg': data.paymentProofImg
                    }
                    let newPaymentData = new paymentModel(paymentObj)
                    let savPaymentHis = await newPaymentData.save()
                }
                else {
                    rej({ status: 404, message: "Invalid user id!!" })
                }
            }
            catch (err) {
                console.log(err)
                rej({ status: 500, error: err, message: "something went wrong!!" })
            }
        })
    },
}
