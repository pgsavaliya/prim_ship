const { Router } = require("express");
const notificationRoute = Router();
const adminDataController = require("../../controller/admin/adminData");

notificationRoute.post(
  "/sendNotification",
  adminDataController.sendNotification
);

module.exports = notificationRoute;
