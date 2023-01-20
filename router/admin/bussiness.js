const { Router } = require("express");
const bussinessRoute = Router();
const bussinessController = require("../../controller/admin/bussiness");
const commonController = require("../../controller/common");
const { verifySuperAdminToken } = require("../../middleware/verifytoken");

bussinessRoute.get("/", bussinessController.get);
bussinessRoute.put("/update", bussinessController.update);
bussinessRoute.get("/getLogo", commonController.getLogo);

module.exports = bussinessRoute;
