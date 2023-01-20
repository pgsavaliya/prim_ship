const mongoose = require("mongoose");
const { response } = require("../../middleware/responseMiddleware");
const orderModel = require("../../model/order.model");
const userModel = require("../../model/user.model");
const notificationModel = require("../../model/notification.model");

module.exports = {
  get: (_id) => {
    return new Promise(async (res, rej) => {
      try {
        let userData = await userModel.findById(_id, { credit: 1, address: 1 });
        let getData = await orderModel.aggregate([
          {
            $match: {
              userId: mongoose.Types.ObjectId(_id),
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
          let totalCnt = 0,
            cancelCnt = 0,
            pendingCnt = 0,
            completeCnt = 0;
          getData.map((item) => {
            totalCnt += item.count;
            if (item._id == "pending") {
              pendingCnt += item.count;
            } else if (item._id == "cancel") {
              cancelCnt += item.count;
            } else if (item._id == "complete" || item._id == "parcelDispatch") {
              completeCnt += item.count;
            }
          });
          let remaining;
          if (!userData.address) {
            remaining = "address";
          } else {
            remaining = "";
          }
          res({
            status: 200,
            data: {
              pendingCnt,
              cancelCnt,
              completeCnt,
              totalCnt: totalCnt,
              wallet: userData.credit,
              remaining,
            },
          });
        } else rej({ status: 404, message: "something went wrong!!" });
      } catch (err) {
        console.log(err);
        rej({ status: 500, error: err, message: "something went wrong!!" });
      }
    });
  },

  notification: (userId, page, limit, type) => {
    return new Promise(async (res, rej) => {
      try {
        let qry = {};
        page = parseInt(page);
        limit = parseInt(limit);
        qry["$or"] = [
          {
            $and: [{ type: "admin", toAll: true }],
          },
          { userId: mongoose.Types.ObjectId(userId) },
        ];
        if (type && type !== "all") {
          qry["type"] = type;
        };
        let getData = await notificationModel.aggregate([
          {
            $match: {
              userId: mongoose.Types.ObjectId(userId)
            }
          },
          {
            $match: qry,
          },
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
