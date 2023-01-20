const { Router } = require("express")
const subscribeRoute = Router()
const subscribeController = require("../../controller/user/subscriber")


subscribeRoute.post("/add", subscribeController.add)

module.exports = subscribeRoute