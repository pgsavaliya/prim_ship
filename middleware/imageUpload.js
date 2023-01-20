const multer = require("multer");

let storageMulter = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, "./upload");
  },
  filename: function (req, file, callback) {
    callback(null, file.originalname);
  },
});
exports.upload = multer({ storage: storageMulter });
