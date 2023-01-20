const userModel = require("../../model/user.model");

module.exports = {
  get: (userid) => {
    return new Promise(async (res, rej) => {
      try {
        let getImg = await userModel.findById(
          { _id: userid },
          { profileImage: 1, _id: 0 }
        );
        if (getImg) {
          res({ status: 200, data: getImg });
        } else {
          rej({ status: 404, message: "No data found or invalid userid!!" });
        }
      } catch (err) {
        rej({ status: 500, error: err });
      }
    });
  },

};
