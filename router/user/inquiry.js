const { Router } = require("express")
const inquiryRoute = Router()
const inquiryController = require("../../controller/user/inquiry")

inquiryRoute.post("/", inquiryController.add)

module.exports = inquiryRoute