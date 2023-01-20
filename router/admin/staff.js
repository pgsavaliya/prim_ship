const { Router } = require("express");
const staffRoute = Router();
const staffController = require("../../controller/admin/staff");
const { verifyStaffToken } = require("../../middleware/verifytoken");
const { adminMobileCheck } = require("../../middleware/validation");

staffRoute.get("/", (req, res) => {
  res.status(200).json({ message: "staff get api route is working" });
});

staffRoute.post("/add", adminMobileCheck, staffController.add);
staffRoute.get("/get", staffController.get);
staffRoute.get("/byId", staffController.byId);
staffRoute.put("/updateStatus", staffController.updateStatus);
staffRoute.put("/edit", staffController.edit);
staffRoute.delete("/delete", staffController.delete);

module.exports = staffRoute;
