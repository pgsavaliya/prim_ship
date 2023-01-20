let service = require("../../service/user/auth");
let { response } = require("../../middleware/responseMiddleware");
let userModel = require("../../model/user.model");
const { verifyOtpToken } = require("../../middleware/verifytoken");

exports.login = async (req, res) => {
  try {
    let resp = await service.login(req.body.email, req.body.password);
    if (resp) return response("SUCCESS..!!", resp.token, 200, res);
    else return response("Error..!!", undefined, err.status, res);
  } catch (err) {
    return response(err.message, err?.result, err.status, res);
  }
};

exports.register = async (req, res) => {
  try {
    let resp = await service.register(req.body);
    if (resp) return response("SUCCESS..!!", resp.data, 200, res);
    else return response("Error..!!", {}, 500, res);
  } catch (err) {
    console.log(err);
    return response(err.message, err?.error, err.status, res);
  }
};

//   try {
//     if (!req.body?.mobile && !req.body?.email) {
//       return response("Please enter mobile or email...", {}, err.status, res);
//     } else {
//       let resp = await service.sendOtp(req.body?.mobile, req.body?.email);
//       if (resp)
//         return response(
//           "OTP sent successfully! otp will delete in 5 min",
//           resp.data,
//           200,
//           res
//         );
//       else return response("Error..!!", {}, err.status, res);
//     }
//   } catch (err) {
//     return response(err.message, err?.error, err.status, res);
//   }
// };

// exports.verifyOtp = async (req, res) => {
//   try {
//     let resp = await service.verifyOtp(
//       req.body?.mobile,
//       req.body?.email,
//       req.body.otp
//     );
//     console.log("reso", resp);
//     if (resp) return response("SUCCESS..!!", resp.token, 200, res);
//     else return response("Error..!!", {}, err.status, res);
//   } catch (err) {
//     return response(err.message, err?.error, err.status, res);
//   }
// };

exports.forgotPassword = async (req, res) => {
  try {
    let getData;
    let data;
    if (req.body.token) {
      data = await verifyOtpToken(req.body.token);
      if (data.mobile) {
        getData = await userModel.findOne({ mobile: data.mobile });
      } else if (data.email) {
        getData = await userModel.findOne({ email: data.email });
      }
    }
    if (!getData) {
      return response("You added wong email or mobile number !!", {}, 404, res);
    } else {
      let resp = await service.forgotPassword(
        data.mobile,
        data.email,
        req.body.password
      );
      if (resp)
        return response(
          "Password change successfully..!!",
          resp.data,
          200,
          res
        );
      else return response("something went wrong", {}, 500, res);
    }
  } catch (err) {
    return response(err.message, err?.error, err.status, res);
  }
};
