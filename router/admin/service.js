const { Router } = require("express")
const serviceRoute = Router()
const serviceController = require("../../controller/admin/service")
const commonController = require("../../controller/common")

serviceRoute.post("/addService", serviceController.addService)
serviceRoute.get("/", serviceController.get)
// serviceRoute.get("/getCountry", commonController.getCountryList)
serviceRoute.get("/byId", serviceController.byId)
serviceRoute.put("/edit", serviceController.edit)
serviceRoute.delete("/delete", serviceController.delete)
serviceRoute.post("/addPriceChart", serviceController.addPriceChart)
serviceRoute.put("/deleteCountry", serviceController.deleteCountry)
serviceRoute.get("/getPriceChart", serviceController.getPriceChart)
serviceRoute.get("/getServiceData", serviceController.getServiceData)
serviceRoute.put("/editPriceChart", serviceController.editPriceChart)

module.exports = serviceRoute
