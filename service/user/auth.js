const authModel = require("../../model/user.model");
const jwt = require("jsonwebtoken");
const { encrypt } = require("../../helper/encrypt-decrypt");
const bcrypt = require("bcrypt");
const otpModel = require("../../model/otp.model");
const path = require("path");
const userModel = require("../../model/user.model");
const { notification } = require("../../helper/notification");
require("dotenv").config({ path: path.join(__dirname, "../../config/.env") });

module.exports = {
  login: (email, password) => {
    return new Promise(async (res, rej) => {
      try {
        let logindata;
        if (typeof email == "string") {
          logindata = await authModel.findOne(
            { email },
            {
              password: 1,
              firstName: 1,
              lastName: 1,
              mobile: 1,
              email: 1,
              verifiedStatus: 1,
              credit: 1,
              aadharCardFrontImg: 1,
              aadharCardBackImg: 1,
              panCardImg: 1,
              gstImg: 1,
              gstNo: 1,
              message: 1,
            }
          );
        } else {
          logindata = await authModel.findOne(
            { mobile: email },
            {
              password: 1,
              firstName: 1,
              lastName: 1,
              mobile: 1,
              email: 1,
              verifiedStatus: 1,
              credit: 1,
              aadharCardFrontImg: 1,
              aadharCardBackImg: 1,
              panCardImg: 1,
              gstImg: 1,
              gstNo: 1,
              message: 1,
            }
          );
        }
        if (logindata) {
          const isMatch = await bcrypt.compare(password, logindata.password);
          if (isMatch) {
            if (logindata.verifiedStatus == "approve") {
              let key1 = process.env.USER_ENCRYPTION_KEY;
              let encryptUser = encrypt(logindata._id, key1);
              let encryptPass = encrypt(logindata.password, key1);
              let token = jwt.sign(
                { user_id: encryptUser, password: encryptPass },
                process.env.USER_ACCESS_TOKEN,
                { expiresIn: process.env.USER_ACCESS_TIME }
              );

              res({ status: 200, token: token });
            } else if (
              logindata.verifiedStatus == "pending" ||
              logindata.verifiedStatus == "reject"
            ) {
              rej({
                status: 402,
                message: `your verify status is ${logindata.verifiedStatus}`,
                result: logindata,
              });
            }
          } else {
            rej({
              status: 403,
              message: "password is wrong for this email or mobile",
              result: {},
            });
          }
        } else {
          rej({
            status: 404,
            message: "You enetered invalid email or mobile!!",
          });
        }
      } catch (err) {
        rej({ status: 500, error: err, message: "Internal Server Error" });
      }
    });
  },

  register: (data) => {
    return new Promise(async (res, rej) => {
      try {
        let newAuthModel = new authModel(data);
        let savedata = await newAuthModel.save();
        if (savedata) {
          let notify = await notification(
            savedata._id,
            "registered successfully!!",
            "registered successsfully!!",
            "user"
          );
          res({ status: 200, data: "new user added" });
        } else {
          rej({ status: 500, message: "something went wrong!!" });
        }
      } catch (err) {
        rej({ status: 500, error: err, message: "something went wrong!!" });
      }
    });
  },

  forgotPassword: (mobile, email, password) => {
    return new Promise(async (res, rej) => {
      try {
        let updatePassword;
        password = await bcrypt.hash(password, 12);
        if (!email)
          updatePassword = await userModel.findOneAndUpdate(
            { mobile },
            { password },
            { new: true }
          );
        if (!mobile) {
          updatePassword = await userModel.findOneAndUpdate(
            { email },
            { password },
            { new: true }
          );
        }
        if (updatePassword) res({ status: 200, data: {} });
        else rej({ status: 404, message: "Invalid email or mobile number!!" });
      } catch (err) {
        console.log(err);
        rej({ status: 500, error: err, message: "something went wrong!!" });
      }
    });
  },

};
