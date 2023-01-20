let service = require("../../service/admin/staff");
const { required } = require("joi");
let { response } = require("../../middleware/responseMiddleware");
const bcrypt = require("bcrypt");

exports.add = async (req, res) => {
  try {
    let resp = await service.add(req.body);
    if (resp) return response("SUCCESS..!!", resp.data, 200, res);
    else return response("Error..!!", err.error, err.status, res);
  } catch (err) {
    return response(err.message, err?.error, err.status, res);
  }
};

exports.get = async (req, res) => {
  try {
    if (!req.query.page || !req.query.limit) {
      return response("pagination is require for pagination..!!", {}, 404, res);
    } else {
      let resp = await service.get(
        req.query?.str,
        req.query?.status,
        req.query.page,
        req.query.limit
      );
      if (resp) return response("SUCCESS..!!", resp.data, 200, res);
      else return response("Error..!!", err.error, err.status, res);
    }
  } catch (err) {
    return response(err.message, err?.error, err.status, res);
  }
};

exports.byId = async (req, res) => {
  try {
    let resp = await service.byId(req.query.userId);
    if (resp) return response("SUCCESS..!!", resp.data, 200, res);
    else return response("Error..!!", err.error, err.status, res);
  } catch (err) {
    return response(err.message, err?.error, err.status, res);
  }
};

exports.updateStatus = async (req, res) => {
  try {
    let resp = await service.updateStatus(req.query.userId, req.body.status);
    if (resp) {
      return response("status updated successfully..!!", {}, 200, res);
    } else return response("Error..!!", err.error, err.status, res);
  } catch (err) {
    return response(err.message, err?.error, err.status, res);
  }
};

exports.edit = async (req, res) => {
  try {
    if (req.body.password) {
      let password = req.body.password;
      password = await bcrypt.hash(password, 12);
      req.body.password = password;
    }
    let resp = await service.edit(req.query.userId, req.body);
    if (resp) return response("SUCCESS..!!", resp.data, 200, res);
    else return response("Error..!!", err.error, err.status, res);
  } catch (err) {
    return response(err.message, err?.error, err.status, res);
  }
};

exports.delete = async (req, res) => {
  try {
    let resp = await service.delete(req.query.userId);
    if (resp) return response("SUCCESS..!!", resp.data, 200, res);
    else return response("Error..!!", err.error, err.status, res);
  } catch (err) {
    return response(err.message, err?.error, err.status, res);
  }
};
