const { Router } = require("express");
const credentialRoute = Router();
const credenController = require("../../controller/admin/credential");

const {
  verifySuperAdminToken,
  verifyStaffToken,
} = require("../../middleware/verifytoken");

credentialRoute.put(
  "/updateService",

  credenController.updateService
);

module.exports = credentialRoute;
