let service = require("../../service/admin/bussiness");
let { response } = require("../../middleware/responseMiddleware");

exports.get = async (req, res) => {
  try {
    let resp = await service.get();
    if (resp) {
      return response("SUCCESS..!!", resp.data, 200, res);
    } else {
      return response("Error..!!", {}, 500, res);
    }
  } catch (err) {
    return response(err.message, err?.error, err.status, res);
  }
};

exports.update = async (req, res) => {
  try {
    let resp = await service.update(req.body);
    if (resp) return response("Details updated successfully..!!", {}, 200, res);
    else return response("Error..!!", err.error, err.status, res);
  } catch (err) {
    return response(err.message, err?.error, err.status, res);
  }
};
