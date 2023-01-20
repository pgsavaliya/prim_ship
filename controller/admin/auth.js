let service = require("../../service/admin/auth");
let { response } = require("../../middleware/responseMiddleware");
let adminModel = require("../../model/admin.model");
const { verifyAdminToken } = require("../../middleware/verifytoken");
const { verifyOtpToken } = require("../../middleware/verifytoken");

exports.login = async (req, res) => {
  try {
    let resp = await service.login(
      req.body?.mobile,
      req.body?.email,
      req.body.password
    );
    if (resp) return response("SUCCESS..!!", resp.token, 200, res);
    else return response("Error..!!", err.status, res);
  } catch (err) {
    return response(err.message, err?.error, err.status, res);
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    let getData;
    let data;
    if (req.body.token) {
      data = await verifyOtpToken(req.body.token);
      if (data.mobile) {
        getData = await adminModel.findOne({ mobile: data.mobile });
      }
    }
    if (!getData) {
      return response("You added wong email or mobile number !!", {}, 404, res);
    } else {
      let resp = await service.forgotPassword(data.mobile, req.body.password);
      if (resp)
        return response(
          "Password change successfully..!!",
          resp.data,
          200,
          res
        );
      else return response("something went wrong", {}, 500, res);
    }
  } catch (err) {
    return response(err.message, err?.error, err.status, res);
  }

};
