const { Router } = require("express")
const v1 = Router()

const userRouter = require("./user/user.routes")
const adminRouter = require("./admin/admin.routes")
const commonRoute = require("./common")

v1.get('/', (req, res) => {
    res.status(200).json({ message: "v1 routes working" })
})
v1.use("/user", userRouter)
v1.use("/admin", adminRouter)
v1.use("/common", commonRoute)


module.exports = v1