const commonController = require("../../controller/common");
const controller = require("../../controller/admin/image");
let { Router } = require("express");
const imgRoute = Router();
const { upload } = require("../../middleware/imageUpload");

imgRoute.post("/upload", upload.single("img"), commonController.upload);
imgRoute.delete("/delete", commonController.delete);

module.exports = imgRoute;