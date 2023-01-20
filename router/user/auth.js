const { Router } = require("express");
const authRoute = Router();
const userAuthController = require("../../controller/user/auth");
const {
  validateSchema,
  userSchema,
  mobileCheck,
  veryfyMobileRegi,
} = require("../../middleware/validation");
const { verifyOtpToken } = require("../../middleware/verifytoken");
const commonController = require("../../controller/common");

authRoute.post("/login", userAuthController.login);
authRoute.post(
  "/register",
  mobileCheck,
  validateSchema(userSchema),
  userAuthController.register
);

authRoute.post("/sendOtp", veryfyMobileRegi, commonController.sendOtp);
authRoute.post("/verifyOtp", commonController.verifyOtp);
authRoute.put("/forgotPassword", userAuthController.forgotPassword);

module.exports = authRoute;
