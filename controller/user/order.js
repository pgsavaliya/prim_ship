const orderService = require("../../service/user/order");
let { response } = require("../../middleware/responseMiddleware");
let userModel = require("../../model/user.model");
const { query } = require("express");

exports.getCountry = async (req, res) => {
  try {
    let resp = await orderService.getCountry(req.query?.str);
    if (resp) return response("SUCCESS..!!", resp.data, 200, res);
    else return response("Error..!!", {}, 500, res);
  } catch (err) {
    return response(err.message, err?.error, err.status, res);
  }
};

exports.print = async (req, res) => {
  try {
    let resp = await orderService.print(req.query.orderId);

    if (resp) {
      return response("SUCCESS..!!", resp.data, 200, res);
    } else {
      return response("Error..!!", {}, 500, res);
    }
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
        req.userId,
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
        req.userId,
        req.query.page,
        req.query.limit,
        req.query.startDate,
        req.query.endDate
      );
      let billobj = await orderService.billObj(
        req.userId,
        req.query.startDate,
        req.query.endDate
      );
      if (resp)
        return response(
          "SUCCESS..!!",
          { invoice: resp.data, billobj: billobj.data || {} },
          200,
          res
        );
      else return response("Error..!!", {}, 500, res);
    }
  } catch (err) {
    return response(err.message, err?.error, err.status, res);
  }
};

exports.printInVoice = async (req, res) => {
  try {
    let resp = await orderService.printInVoice(
      req.userId,
      req.query.startDate,
      req.query.endDate
    );
    let billobj = await orderService.billObj(
      req.userId,
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
          businessData,
          userData,
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

exports.trackOrder = async (req, res) => {
  try {
    let resp = await orderService.trackOrder(req.userId, req.query.trackingNo);
    if (resp) return response("SUCCESS..!!", resp.data, 200, res);
    else return response("Error..!!", {}, 500, res);
  } catch (err) {
    return response(err.message, err?.error, err.status, res);
  }
};

exports.orderCount = async (req, res) => {
  try {
    let resp = await orderService.orderCount(req.userId);
    if (resp) return response("SUCCESS..!!", resp.data, 200, res);
    else return response("Error..!!", {}, 500, res);
  } catch (err) {
    return response(err.message, err?.error, err.status, res);
  }
};

exports.billObj = async (req, res) => {
  try {
    let resp = await orderService.billObj(req.userId);
    if (resp) return response("SUCCESS..!!", resp.data, 200, res);
    else return response("Error..!!", {}, 500, res);
  } catch (err) {
    return response(err.message, err?.error, err.status, res);
  }
};
