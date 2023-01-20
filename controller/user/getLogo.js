let service = require("../../service/user/getLogo");
let { response } = require("../../middleware/responseMiddleware");


exports.getLogo = async (req, res) => {
    try {
        let resp = await service.getLogo();
        if (resp) return response("SUCCESS..!!", resp.data, 200, res);
        else return response("Error..!!", {}, 500, res);
    } catch (err) {
        return response(err.message, err?.error, err.status, res);
    }
};
