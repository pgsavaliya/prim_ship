const controller = require("../../controller/user/image")
const commonController = require("../../controller/common")
let { Router } = require("express")
const imgRoute = Router()
const { upload } = require("../../middleware/imageUpload")

imgRoute.get("/:userId", controller.get)
imgRoute.post("/upload", upload.single("img"), commonController.upload)
imgRoute.delete("/delete", commonController.delete)

module.exports = imgRoute