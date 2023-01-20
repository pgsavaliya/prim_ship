const { Router } = require("express");
const adminDataRoute = Router();
const adminDataController = require("../../controller/admin/adminData");
const { verifySuperAdminToken } = require("../../middleware/verifytoken");

adminDataRoute.get("/", adminDataController.get);
adminDataRoute.put("/update", adminDataController.update);
adminDataRoute.post("/sendNotification", adminDataController.sendNotification);

module.exports = adminDataRoute;
