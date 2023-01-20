const { Router } = require("express");
const authRoute = Router();
const Controller = require("../../controller/user/profile");
const { upload } = require("../../middleware/imageUpload");
const { mobileCheck } = require("../../middleware/validation");
const { validatePassword } = require("../../middleware/validation");
const { verifyUserToken } = require("../../middleware/verifytoken");

authRoute.get("/", verifyUserToken, Controller.get);
authRoute.put("/update", verifyUserToken, mobileCheck, Controller.update);

authRoute.put(
  "/image",
  verifyUserToken,
  upload.single("img"),
  Controller.image
);

authRoute.put("/resetPassword", verifyUserToken, Controller.resetPassword);
authRoute.post("/resetProofImage", Controller.resetProofImage);
authRoute.get("/wallet", verifyUserToken, Controller.wallet);

module.exports = authRoute;
