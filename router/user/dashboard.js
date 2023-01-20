const { Router } = require("express");
const dashBoardRoute = Router();
const dashBoardController = require("../../controller/user/dashboard");

dashBoardRoute.get("/", dashBoardController.get);
dashBoardRoute.get("/notification", dashBoardController.notification);

module.exports = dashBoardRoute;
