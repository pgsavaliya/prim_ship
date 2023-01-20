const orderService = require("../../service/admin/order");
let { response } = require("../../middleware/responseMiddleware");
const orderModel = require("../../model/order.model");

exports.addForwardingNo = async (req, res) => {
  try {
    let resp = await orderService.addForwardingNo(
      req.userId,
      req.query.orderId,
      req.query.trackingNo
    );
    if (resp)
      return response(
        "Forwarding number is added successfully..!!",
        resp.data,
        200,
        res
      );
    else return response("Error..!!", {}, 500, res);
  } catch (err) {
    return response(err.message, err?.error, err.status, res);
  }
};

exports.get = async (req, res) => {
  try {
    if (!req.query.page || !req.query.limit) {
      return response("pagination is require for pagination..!!", {}, 404, res);
    } else {
      let resp = await orderService.get(
        req.query?.str,
        req.query?.status,
        req.query?.startDate,
        req.query?.endDate,
        req.query.page,
        req.query.limit
      );
      if (resp) return response("SUCCESS..!!", resp.data, 200, res);
      else return response("Error..!!", {}, 500, res);
    }
  } catch (err) {
    return response(err.message, err?.error, err.status, res);
  }
};

exports.edit = async (req, res) => {
  try {
    if (
      req.body.orderTrackingStatus == "pending" ||
      req.body.orderTrackingStatus == "complete" ||
      req.body.orderTrackingStatus == "cancel" ||
      req.body.orderTrackingStatus == "parcelDispatch"
    ) {
      let resp = await orderService.edit(req.userId, req.body);
      if (resp) return response("Data updated successfully..!!", {}, 200, res);
      else return response("Error..!!", {}, 500, res);
    } else {
      return response(
        "status must be either pending, complete,cancel or parcelDispatch.",
        {},
        500,
        res
      );
    }
  } catch (err) {
    return response(err.message, err?.error, err.status, res);
  }
};

exports.getUser = async (req, res) => {
  try {
    let resp = await orderService.getUser();
    if (resp) return response("SUCCESS..!!", resp.data, 200, res);
    else return response("Error..!!", {}, 500, res);
  } catch (err) {
    return response(err.message, err?.error, err.status, res);
  }
};

exports.orderCount = async (req, res) => {
  try {
    let resp = await orderService.orderCount();
    if (resp) return response("SUCCESS..!!", resp.data, 200, res);
    else return response("Error..!!", {}, 500, res);
  } catch (err) {
    return response(err.message, err?.error, err.status, res);
  }
};

exports.extraCharge = async (req, res) => {
  try {
    let orderData = await orderModel.findById(req.body.orderId);
    if (orderData.orderTrackingStatus == "cancel") {
      return response("The order is already cancelled.!!", {}, 404, res);
    } else {
      let resp = await orderService.extraCharge(
        req.userId,
        req.body.orderId,
        req.body.amount,
        req.body.message
      );
      if (resp)
        return response(
          "Extra charges deducted successfully..!!",
          {},
          200,
          res
        );
      else return response("Error..!!", {}, 500, res);
    }
  } catch (err) {
    return response(err.message, err?.error, err.status, res);
  }
};

exports.inVoice = async (req, res) => {
  try {
    if (!req.query.page && !req.query.limit) {
      return response(
        "page and limit are required for pagination!!",
        {},
        500,
        res
      );
    } else {
      let resp = await orderService.inVoice(
        req.params._id,
        req.query.page,
        req.query.limit,
        req.query.startDate,
        req.query.endDate
      );
      let billobj = await orderService.billObj(
        req.params._id,
        req.query.startDate,
        req.query.endDate
      );
      if (resp) {
        return response(
          "SUCCESS..!!",
          { invoice: resp.data, billobj: billobj.data },
          200,
          res
        );
      } else return response("Error..!!", {}, 500, res);
    }
  } catch (err) {
    return response(err.message, err?.error, err.status, res);
  }
};

exports.printInVoice = async (req, res) => {
  try {
    let resp = await orderService.printInVoice(
      req.query.userId,
      req.query.startDate,
      req.query.endDate
    );
    let billobj = await orderService.billObj(
      req.query.userId,
      req.query.startDate,
      req.query.endDate
    );
    if (resp) {
      let businessData = resp.data.businessData;
      let userData = resp.data.userData;
      delete resp.data.businessData;
      delete resp.data.userData;
      return response(
        "SUCCESS..!!",
        {
          businessData: businessData,
          userData: userData,
          invoice: resp.data,
          billobj: billobj.data || {},
        },
        200,
        res
      );
    } else return response("Error..!!", {}, 500, res);
  } catch (err) {
    return response(err.message, err?.error, err.status, res);
  }
};

exports.billObj = async (req, res) => {
  try {
    let resp = await orderService.billObj(
      req.params._id,
      req.query.startDate,
      req.query.endDate
    );
    if (resp) return response("SUCCESS..!!", resp.data, 200, res);
    else return response("Error..!!", {}, 500, res);
  } catch (err) {
    return response(err.message, err?.error, err.status, res);
  }
};
