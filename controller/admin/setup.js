let service = require("../../service/admin/setup")
let { response } = require("../../middleware/responseMiddleware")

exports.add = async (req, res) => {
    try {
        let resp = await service.add(req.body);
        if (resp)
            return response("SUCCESS..!!", resp.data, 200, res)
        else
            return response("Error..!!", err.error, err.status, res)
    }
    catch (err) {
        return response(err.message, err?.error, err.status, res)
    }
}

exports.get = async (req, res) => {
    try {
        let resp = await service.get()
        if (resp)
            return response("SUCCESS..!!", resp.data, 200, res)
        else
            return response("Error..!!", err.error, err.status, res)
    }
    catch (err) {
        return response(err.message, err?.error, err.status, res)
    }
}