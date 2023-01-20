const { Router } = require("express");
const adminRoute = Router();

const serviceRoute = require("./service");
const aboutUsRoute = require("./about_us");
const authRoute = require("./auth");
const staffRoute = require("./staff");
const adminDataRoute = require("./admindata");
const orderRoute = require("./order");
const userManageRoute = require("./userManage");
const dashBoardRoute = require("./dashBoard");
const imgRoute = require("./image");
const emailManagementRoute = require("./emailManagement");
const notificationRoute = require("./notification");
const credientialRoute = require("./credential");
const setupRoute = require("./setup");
const bussinessRoute = require("./bussiness");
const commonController = require("../../controller/common");
const credenController = require("../../controller/admin/credential");

adminRoute.get("/", (req, res) => {
  res.status(200).json({ message: "admin route is working" });
});

const {
  verifyAdminToken,
  verifySuperAdminToken,
  verifyStaffToken,
} = require("../../middleware/verifytoken");

adminRoute.use("/setup", setupRoute);
adminRoute.use("/service", verifyAdminToken(5), serviceRoute);
adminRoute.use("/aboutUS", verifyAdminToken(6), aboutUsRoute);
adminRoute.use("/auth", authRoute);
adminRoute.use("/staff", verifyAdminToken(4), staffRoute);
adminRoute.use("/adminData", verifyAdminToken(8), adminDataRoute);
adminRoute.use("/order", verifyAdminToken(2), orderRoute);
adminRoute.use("/userManage", verifyAdminToken(3), userManageRoute);
adminRoute.use("/notification", verifyAdminToken(10), notificationRoute);
adminRoute.use("/dashBoard", verifyAdminToken(1), dashBoardRoute);
adminRoute.use("/image", imgRoute);
adminRoute.use("/emailManagement", verifyAdminToken(7), emailManagementRoute);
adminRoute.use("/credential", verifySuperAdminToken(9), credientialRoute);
adminRoute.use("/bussiness", verifySuperAdminToken(10), bussinessRoute);
adminRoute.get("/getLogo", commonController.getLogo);
adminRoute.get("/getService", credenController.getService);
adminRoute.get("/getCountry", commonController.getCountryList);

module.exports = adminRoute;
