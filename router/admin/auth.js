const { Router } = require("express");
const authRoute = Router();
const adminAuthController = require("../../controller/admin/auth");
const commonController = require("../../controller/common");
const { veryfyMobileAdmin } = require("../../middleware/validation");

authRoute.get("/", (req, res) => {
  res.status(200).json({ message: "auth get api route is working" });
});

authRoute.post("/login", adminAuthController.login);
// authRoute.post("/sendOtp", veryfyMobileAdmin, commonController.sendOtp);
authRoute.post("/sendOtp", commonController.sendOtp);

// authRoute.post("/sendOtpForgot", veryfyMobileRegi, commonController.sendOtp)

authRoute.post("/verifyOtp", commonController.verifyOtp);
authRoute.put("/forgotPassword", adminAuthController.forgotPassword);

module.exports = authRoute;
