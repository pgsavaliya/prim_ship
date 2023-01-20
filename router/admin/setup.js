const { Router } = require("express");
const setupRouter = Router();
const setupcontroller = require("../../controller/admin/setup");

setupRouter.post("/add", setupcontroller.add);
setupRouter.get("/", setupcontroller.get);

module.exports = setupRouter;
