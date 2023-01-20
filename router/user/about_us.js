const { Router } = require("express")
const aboutUsRoute = Router()
const commonController = require("../../controller/common")

aboutUsRoute.get("/", commonController.getAboutUs)

module.exports = aboutUsRoute