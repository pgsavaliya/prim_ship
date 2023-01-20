const mongoose = require("mongoose");
const { response } = require("../../middleware/responseMiddleware");
const orderModel = require("../../model/order.model");
const notificationModel = require("../../model/notification.model");

module.exports = {
  get: () => {
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
          let refundCnt = 0,
            pendingCnt = 0,
            cancelCnt = 0,
            completeCnt = 0,
            totalCnt = 0;
          if (getData.length > 0) {
            for (let i = 0; i < getData.length; i++) {
              if (getData[i]._id == "cancel") {
                for (let j = 0; j < getData[i].result.length; j++) {
                  if (getData[i].result[j].isRefund) {
                    refundCnt++;
                  }
                }
                cancelCnt = getData[i].count;
              } else if (getData[i]._id == "pending") {
                pendingCnt = getData[i].count;
              } else if (
                getData[i]._id == "parcelDispatch" ||
                getData[i]._id == "complete"
              ) {
                completeCnt = getData[i].count;
              }
              totalCnt = cancelCnt + pendingCnt + completeCnt;
            }
          }
          res({
            status: 200,
            data: [
              { name: "Pending", value: pendingCnt || 0 },
              { name: "Cancel", value: cancelCnt || 0 },
              { name: "Complete", value: completeCnt || 0 },
              { name: "Total Order", value: totalCnt || 0 },
              { name: "Refunded order", value: refundCnt || 0 },
            ],
          });
        } else rej({ status: 500, message: "something went wrong!!" });
      } catch (err) {
        rej({ status: 500, error: err, message: "something went wrong!!" });
      }
    });
  },

  notification: (page, limit) => {
    return new Promise(async (res, rej) => {
      try {
        let qry = {};

        page = parseInt(page);
        limit = parseInt(limit);

        let getData = await notificationModel.aggregate([
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
                    userId: 1,
                    message: 1,
                    reason: 1,
                    type: 1,
                    orderId: 1,
                    createdAt: 1,
                    updatedAt: 1,
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
          rej({ status: 404, message: "Invalid user id!!" });
        }
      } catch (err) {
        console.log("err", err);
        rej({ status: 500, error: err, message: "something went wrong!!" });
      }
    });
  },

};
