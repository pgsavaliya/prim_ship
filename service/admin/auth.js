const adminModel = require("../../model/admin.model");
const jwt = require("jsonwebtoken");
const { encrypt } = require("../../helper/encrypt-decrypt");
const bcrypt = require("bcrypt");
const path = require("path");

require("dotenv").config({ path: path.join(__dirname, "../../config/.env") });

module.exports = {
  login: (mobile, email, password) => {
    return new Promise(async (res, rej) => {
      try {
        var logindata;
        if (email) {
          logindata = await adminModel.findOne(
            { email },
            { password: 1, service: 1 }
          );
        } else if (mobile) {
          logindata = await adminModel.findOne(
            { mobile },
            { password: 1, service: 1 }
          );
        }
        if (logindata) {
          const isMatch = await bcrypt.compare(password, logindata.password);
          if (isMatch) {
            let key1 = process.env.ADMIN_ENCRYPTION_KEY;
            let encryptAdmin = encrypt(logindata._id, key1);
            let encryptPass = encrypt(logindata.password, key1);
            let token = jwt.sign(
              { Admin_id: encryptAdmin, password: encryptPass },
              process.env.ADMIN_ACCESS_TOKEN,
              { expiresIn: process.env.ADMIN_ACCESS_TIME }
            );
            res({ status: 200, token: token });
          } else {
            rej({ status: 404, message: "Invalid id or password!!" });
          }
        } else {
          rej({
            status: 404,
            message: "You enetered invalid id or mobile!!",
          });
        }
      } catch (err) {
        rej({ status: 500, error: err, message: "something went wrong!!" });
      }
    });
  },

  forgotPassword: (mobile, password) => {
    return new Promise(async (res, rej) => {
      try {
        let updatePassword;
        password = await bcrypt.hash(password, 12);
        updatePassword = await adminModel.findOneAndUpdate(
          { mobile },
          { password },
          { new: true }
        );
        if (updatePassword) res({ status: 200, data: {} });
        else rej({ status: 404, message: "Invalid mobile number!!" });
      } catch (err) {
        rej({ status: 500, error: err, message: "something went wrong!!" });
      }
    });
  },

};
