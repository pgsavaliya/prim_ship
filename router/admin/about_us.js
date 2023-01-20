const { Router } = require("express");
const aboutUsRoute = Router();
const aboutUsController = require("../../controller/admin/about_us");
const commonController = require("../../controller/common");

aboutUsRoute.post("/add", aboutUsController.add);
aboutUsRoute.get("/", commonController.getAboutUs);
aboutUsRoute.put("/edit", aboutUsController.edit);

module.exports = aboutUsRoute;
