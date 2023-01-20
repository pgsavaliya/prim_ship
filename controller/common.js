const commonService = require("../service/common");
let { response } = require("../middleware/responseMiddleware");
const userModel = require("../model/user.model");
const adminModel = require("../model/admin.model");
const randomstring = require("randomstring");
const { sendOtpOnSMS } = require("../helper/sendSMS");

exports.getCountryList = async (req, res) => {
  try {
    let resp = await commonService.getCountryList(req.query?.str);
    if (resp) return response("SUCCESS..!!", resp.data, 200, res);
    else return response("Error..!!", {}, 500, res);
  } catch (err) {
    return response(err.message, err?.error, err.status, res);
  }
};

exports.findService = async (req, res) => {
  try {
    let resp = await commonService.findService(
      req.body.countryId,
      req.body.weight,
      req.body.length,
      req.body.width,
      req.body.height
    );
    if (resp) return response("SUCCESS..!!", resp.data, 200, res);
    else return response("Error..!!", {}, 500, res);
  } catch (err) {
    return response(err.message, err?.error, err.status, res);
  }
};

exports.placeOrder = async (req, res) => {
  try {
    let userData = await userModel.findById({ _id: req.userId });
    let adminData = await adminModel.findById({ _id: req.userId });

    let resp;
    if (adminData && !userData) {
      console.log("in adminData...", adminData);
      if (!req.body.userId) {
        return response("please provide userId", {}, 404, res);
      } else {
        req.body.adminId = req.userId;
        resp = await commonService.placeOrder(req.body.userId, req.body);
      }
    } else {
      resp = await commonService.placeOrder(req.userId, req.body);
    }
    if (resp) return response("SUCCESS..!!", resp.data, 200, res);
    else return response("Error..!!", {}, 500, res);
  } catch (err) {
    return response(err.message, err?.error, err.status, res);
  }
};

exports.byId = async (req, res) => {
  try {
    let resp = await commonService.byId(req.params.orderId);
    if (resp) return response("SUCCESS..!!", resp.data, 200, res);
    else return response("Error..!!", {}, 500, res);
  } catch (err) {
    return response(err.message, err?.error, err.status, res);
  }
};

exports.getAboutUs = async (req, res) => {
  try {
    let resp = await commonService.getAboutUs();
    if (resp) return response("SUCCESS..!!", resp.data[0], 200, res);
    else return response("Error..!!", err.error, err.status, res);
  } catch (err) {
    return response(err.message, err?.error, err.status, res);
  }
};

exports.upload = async (req, res) => {
  try {
    let resp = await commonService.upload(req.file);
    if (resp) return response("SUCCESS..!!", resp.data, 200, res);
    else return response("Error..!!", {}, 500, res);
  } catch (err) {
    return response(err.message, err?.error, err.status, res);
  }
};

exports.delete = async (req, res) => {
  try {
    let resp = await commonService.delete(req.body.imgName);
    if (resp) return response("SUCCESS..!!", resp.data, 200, res);
    else return response("Error..!!", {}, 500, res);
  } catch (err) {
    return response(err.message, err?.error, err.status, res);
  }
};
exports.sendOtp = async (req, res) => {
  try {
    console.log("req.body.mobileno....", req.body.mobile);
    if (req.body.mobile.toString().length != 10) {
      return res.send(
        responseMiddleWares(
          "mobile no must be of 10 digits",
          false,
          undefined,
          400
        )
      );
    }
    let u_code = randomstring.generate({
      length: 4,
      charset: "numeric",
    });
    mobileno = req.body.mobile;
    otp = u_code;
    //store otp to databse
    let resp = await commonService.sendOtp(
      req.body?.mobile,
      req.body?.email,
      otp
    );
    if (resp) {
      let success = await sendOtpOnSMS(mobileno, otp);

      if (success) {
        return response(
          "OTP sent successfully! otp will delete in 5 min",
          {},
          200,
          res
        );
      } else {
        console.log("not send via otp");
      }
    } else {
      return response("Error..!!", {}, 500, res);
    }
  } catch (err) {
    console.log("err...", err?.message);
    return response(err.message, err?.error, err?.status || 500, res);
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    let resp = await commonService.verifyOtp(
      req.body?.mobile,
      req.body?.email,
      req.body.otp
    );
    if (resp) return response("SUCCESS..!!", resp.token, 200, res);
    else return response("Error..!!", {}, err.status, res);
  } catch (err) {
    return response(err.message, err?.error, err.status, res);
  }
};

exports.getLogo = async (req, res) => {
  try {
    let resp = await commonService.getLogo();
    if (resp) {
      return response("SUCCESS..!!", resp.data, 200, res);
    } else {
      return response("Error..!!", {}, 500, res);
    }
  } catch (err) {
    return response(err.message, err?.error, err.status, res);
  }
};
