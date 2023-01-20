const jwt = require("jsonwebtoken");
const { decrypt } = require("../helper/encrypt-decrypt");
const path = require("path");
const userModel = require("../model/user.model");
const adminModel = require("../model/admin.model");
const { connectStorageEmulator } = require("@firebase/storage");

require("dotenv").config({ path: path.join(__dirname, "../config/.env") });

function verifyUserToken(req, res, next) {
  let token = req.headers["authorization"];
  if (!token) {
    res.status(403).json({ success: false, message: "token missing" });
  } else {
    token = token.split(" ")[1];
    jwt.verify(token, process.env.USER_ACCESS_TOKEN, (err, payload) => {
      if (err) {
        res.status(403).json({ success: false, message: "unauthorized token" });
      } else {
        req.userId = decrypt(payload.user_id, process.env.USER_ENCRYPTION_KEY);
        req.password = decrypt(
          payload.password,
          process.env.USER_ENCRYPTION_KEY
        );
        next();
      }
    });
  }
}

function verifyAdminToken(index) {
  return (req, res, next) => {
    let token = req.headers["authorization"];
    if (!token) {
      res.status(403).json({ success: false, message: "token missing" });
    } else {
      token = token.split(" ")[1];
      jwt.verify(
        token,
        process.env.ADMIN_ACCESS_TOKEN,
        async (err, payload) => {
          if (err) {
            res
              .status(403)
              .json({ success: false, message: "unauthorized token" });
          } else {
            req.userId = decrypt(
              payload.Admin_id,
              process.env.ADMIN_ENCRYPTION_KEY
            );
            req.password = decrypt(
              payload.password,
              process.env.ADMIN_ENCRYPTION_KEY
            );
            let loginData = await adminModel.findOne({
              _id: req.userId,
              password: req.password,
            });

            if (loginData) {
              req.permission = loginData.service;
              if (req.permission[index - 1] == index) next();
              else {
                res.status(403).json({
                  success: false,
                  message:
                    "you are not authorized to do work. please contact admin!!",
                });
              }
            } else {
              res.status(403).json({
                success: false,
                message: "your password may change!! please login again",
              });
            }
          }
        }
      );
    }
  };
}

function verifySuperAdminToken(index) {
  return (req, res, next) => {
    let token = req.headers["authorization"];
    if (!token) {
      res.status(403).json({ success: false, message: "token missing" });
    } else {
      token = token.split(" ")[1];
      jwt.verify(
        token,
        process.env.ADMIN_ACCESS_TOKEN,
        async (err, payload) => {
          if (err) {
            res
              .status(403)
              .json({ success: false, message: "unauthorized token" });
          } else {
            req.userId = decrypt(
              payload.Admin_id,
              process.env.ADMIN_ENCRYPTION_KEY
            );
            req.password = decrypt(
              payload.password,
              process.env.ADMIN_ENCRYPTION_KEY
            );
            let loginData = await adminModel.findOne({
              _id: req.userId,
              password: req.password,
            });

            if (loginData) {
              if (loginData.role == "superAdmin") {
                req.permission = loginData.service;
                if (req.permission[index - 1] == index) next();
                else {
                  res.status(403).json({
                    success: false,
                    message:
                      "you are not authorized to do work. please contact  super admin!!",
                  });
                }
              } else {
                res.status(403).json({
                  success: false,
                  message:
                    "you are not authorized to do work. please contact super admin!!",
                });
              }
            } else {
              res.status(403).json({
                success: false,
                message: "your password may change!! please login again",
              });
            }
          }
        }
      );
    }
  };
}

function verifyStaffToken(req, res, next) {
  let token = req.headers["authorization"];
  if (!token) {
    res.status(403).json({ success: false, message: "token missing" });
  } else {
    token = token.split(" ")[1];
    jwt.verify(token, process.env.ADMIN_ACCESS_TOKEN, async (err, payload) => {
      if (err) {
        res.status(403).json({ success: false, message: "unauthorized token" });
      } else {
        req.userId = decrypt(
          payload.Admin_id,
          process.env.ADMIN_ENCRYPTION_KEY
        );
        req.password = decrypt(
          payload.password,
          process.env.ADMIN_ENCRYPTION_KEY
        );
        next();
      }
    });
  }
}

function verifyOtpToken(token) {
  return new Promise(async (resolve, reject) => {
    if (!token) {
      reject({ message: "token missing", status: 401 });
    } else {
      jwt.verify(token, process.env.USER_OTP_TOKEN, (err, payload) => {
        if (err) {
          reject({ message: "unauthorized token", status: 401 });
        } else {
          resolve(payload);
        }
      });
    }
  });
}

module.exports = {
  verifyUserToken,
  verifyOtpToken,
  verifyAdminToken,
  verifySuperAdminToken,
  verifyStaffToken,
};
