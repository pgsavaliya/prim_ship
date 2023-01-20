const setupModel = require("../../model/setup");
const adminModel = require("../../model/admin.model");
const bussinessModel = require("../../model/bussiness.model");

module.exports = {
  add: (data) => {
    return new Promise(async (res, rej) => {
      try {
        let setupData;
        let obj = {};
        obj["firstName"] = data.firstName;
        obj["lastName"] = data.lastName;
        obj["password"] = data.password;
        obj["email"] = data.email;
        obj["mobile"] = data.mobile;
        obj["mobileOptional"] = data.mobileOptional;
        obj["isCheck"] = data.isCheck;
        obj["address"] = data.businessAddress;
        obj["role"] = "superAdmin";
        obj["service"] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        let newAdminModel = new adminModel(obj);
        let adminData = await newAdminModel.save();
        bussinessModel.deleteOne().then(async () => {
          let newBussinessModel = new bussinessModel(data);
          let savedata = await newBussinessModel.save();
          if (savedata) {
            setupModel
              .deleteMany()
              .then(async (result) => {
                setupData = await setupModel.updateOne(
                  {},
                  { isSetup: true },
                  { upsert: true }
                );
                res({ status: 200, data: "new admin added" });
              })
              .catch((err) => {
                console.log(err);
                rej({ status: 500, error: err, message: "setUp failed!!" });
              });
          } else {
            rej({ status: 500, message: "something went wrong!!" });
          }
        });
      } catch (err) {
        console.log(err);
        rej({ status: 500, error: err, message: "something went wrong!!" });
      }
    });
  },

  get: () => {
    return new Promise(async (res, rej) => {
      try {
        let getData = await setupModel.find();
        getData = getData[0];
        if (getData) {
          res({ status: 200, data: getData.isSetup });
        } else {
          rej({ status: 404, message: "No Admin Added!!!" });
        }
      } catch (err) {
        console.log("err..", err);
        rej({ status: 500, message: err.message, error: err.error });
      }
    });
  },

};
