let service = require("../../service/admin/adminData");
const { required } = require("joi");
let { response } = require("../../middleware/responseMiddleware");

exports.get = async (req, res) => {
  try {
    let resp = await service.get(req.userId);
    if (resp) {
      return response("SUCCESS..!!", resp.data, 200, res);
    } else return response("Error..!!", err.error, err.status, res);
  } catch (err) {
    return response(err.message, err?.error, err.status, res);
  }
};

exports.update = async (req, res) => {
  try {
    let resp = await service.update(req.userId, req.body);
    if (resp) return response("SUCCESS..!!", {}, 200, res);
    else return response("Error..!!", err.error, err.status, res);
  } catch (err) {
    return response(err.message, err?.error, err.status, res);
  }
};

exports.sendNotification = async (req, res) => {
  try {
    if (req.body.message) {
      let resp = await service.sendNotification(req.userId, req.body.message);
      if (resp) {
        return response("SUCCESS..!!", resp.data, 200, res);
      } else return response("Error..!!", err.error, err.status, res);
    } else {
      res.send("You can only add message.....");
    }
  } catch (err) {
    return response(err.message, err?.error, err.status, res);
  }
};
