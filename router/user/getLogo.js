const { Router } = require("express");
const authRoute = Router();
const Controller = require("../../controller/user/getLogo");

authRoute.get("/getLogo", Controller.getLogo);

module.exports = authRoute;
