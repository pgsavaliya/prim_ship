let service = require("../../service/admin/service");
let { response } = require("../../middleware/responseMiddleware");

exports.addService = async (req, res) => {
  try {
    let resp = await service.addService(req.body);
    if (resp) return response("SUCCESS..!!", {}, 200, res);
    else return response("Error..!!", err.error, err.status, res);
  } catch (err) {
    return response(err.message, err?.error, err.status, res);
  }
};

exports.get = async (req, res) => {
  try {
    let page = req.query.page;
    let limit = req.query.limit;
    if (!page || !limit) {
      return response(
        "page and limit are require for pagination..!!",
        {},
        404,
        res
      );
    } else {
      let resp = await service.get(page, limit, req.query?.str);
      if (resp) return response("SUCCESS..!!", resp.data, 200, res);
      else return response("Error..!!", err.error, err.status, res);
    }
  } catch (err) {
    console.log("err", err);
    return response(err.message, err?.error, err.status, res);
  }
};

exports.byId = async (req, res) => {
  try {
    let resp = await service.byId(req.query.serviceId, req.query?.str);
    if (resp) return response("SUCCESS..!!", resp.data, 200, res);
    else return response("Error..!!", err.error, err.status, res);
  } catch (err) {
    console.log("err", err);
    return response(err.message, err?.error, err.status, res);
  }
};

exports.edit = async (req, res) => {
  try {
    let resp = await service.edit(req.body);
    if (resp)
      return response("record updated successfully..!!!!", {}, 200, res);
    else return response("Error..!!", {}, 500, res);
  } catch (err) {
    console.log("err", err);
    return response(err.message, err?.error, err.status, res);
  }
};

exports.delete = async (req, res) => {
  try {
    let resp = await service.delete(req.query.serviceId);
    if (resp)
      return response("record deleted successfully..!!!!", {}, 200, res);
    else return response("Error..!!", {}, 500, res);
  } catch (err) {
    console.log("err", err);
    return response(err.message, err?.error, err.status, res);
  }
};

exports.addPriceChart = async (req, res) => {
  try {
    let resp = await service.addPriceChart(req.userId, req.body);
    if (resp)
      return response("price chart added successfully..!!", {}, 200, res);
    else return response("Error..!!", {}, err.status, res);
  } catch (err) {
    return response(err.message, err?.error, err.status, res);
  }
};

exports.deleteCountry = async (req, res) => {
  try {
    let resp = await service.deleteCountry(
      req.query.serviceId,
      req.query.countryId
    );
    if (resp) return response("SUCCESS..!!", {}, 200, res);
    else return response("Error..!!", {}, err.status, res);
  } catch (err) {
    return response(err.message, err?.error, err.status, res);
  }
};

exports.getPriceChart = async (req, res) => {
  try {
    let resp = await service.getPriceChart(
      req.query.serviceId,
      req.query.countryId
    );
    if (resp) {
      return response("SUCCESS..!!", resp.data, 200, res);
    } else return response("Error..!!", {}, err.status, res);
  } catch (err) {
    return response(err.message, err?.isData, err.status, res);
  }
};

exports.getServiceData = async (req, res) => {
  try {
    let resp = await service.getServiceData(req.query._id);
    if (resp) {
      return response("SUCCESS..!!", resp.data, 200, res);
    } else return response("Error..!!", {}, err.status, res);
  } catch (err) {
    return response(err.message, err?.error, err.status, res);
  }
};

exports.editPriceChart = async (req, res) => {
  try {
    let resp = await service.editPriceChart(req.body);
    if (resp) {
      return response("SUCCESS..!!", resp.data, 200, res);
    } else return response("Error..!!", {}, err.status || 400, res);
  } catch (err) {
    return response(err.message, err?.error, err.status || 500, res);
  }
};
