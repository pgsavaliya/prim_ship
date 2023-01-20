const adminModel = require("../../model/admin.model");

module.exports = {
  updateService: (userId, data, staffIds) => {
    return new Promise(async (res, rej) => {
      try {
        adminModel.findById(userId).then(async (result) => {
          if (result.role == "superAdmin") {
            let updateData = await adminModel.updateMany(
              { role: "staff", _id: { $in: staffIds } },
              { service: data },
              { new: true }
            );
            if (updateData) {
              res({ status: 200, data: {} });
            } else {
              rej({ status: 500, message: "something went wrong!!" });
            }
          }
        });
      } catch (err) {
        console.log(err);
        rej({ status: 500, error: err, message: "something went wrong!!" });
      }
    });
  },

  getService: (staffId) => {
    return new Promise(async (res, rej) => {
      try {
        let getData = await adminModel.findOne(
          { _id: staffId },
          { service: 1 }
        );
        if (getData) res({ status: 200, data: getData.service });
        else rej({ status: 500, message: "something went wrong" });
      } catch (err) {
        rej({ status: 500, error: err, message: "something went wrong!!" });
      }
    });
  },
};
