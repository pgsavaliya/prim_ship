let service = require("../../service/admin/emailManagement");
let { response } = require("../../middleware/responseMiddleware");

exports.inquiry = async (req, res) => {
  try {
    if (!req.query.page || !req.query.limit) {
      return response("pagination is require for pagination..!!", {}, 404, res);
    } else {
      let resp = await service.inquiry(req.query.page, req.query.limit);
      if (resp) {
        return response("SUCCESS..!!", resp.data, 200, res);
      } else return response("Error..!!", err.error, err.status, res);
    }
  } catch (err) {
    return response(err.message, err?.error, err.status, res);
  }
};

exports.view = async (req, res) => {
  try {
    let resp = await service.view(req.params._id);
    if (resp) {
      return response("SUCCESS..!!", resp.data, 200, res);
    } else return response("Error..!!", err.error, err.status, res);
  } catch (err) {
    return response(err.message, err?.error, err.status, res);
  }
};
