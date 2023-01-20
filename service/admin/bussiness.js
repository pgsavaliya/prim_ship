const bussinessModel = require("../../model/bussiness.model");
const mongoose = require("mongoose");
const setupModel = require("../../model/setup");

module.exports = {
  get: () => {
    return new Promise(async (res, rej) => {
      try {
        let getData = await bussinessModel.find();
        if (getData.length > 0) {
          res({ status: 200, data: getData[0] });
        } else {
          rej({ status: 404, message: "No data found!!" });
        }
      } catch (err) {
        rej({ status: 500, error: err, message: "something went wrong!!" });
      }
    });
  },

  update: (data) => {
    return new Promise(async (res, rej) => {
      try {
        bussinessModel.deleteOne().then(async () => {
          let newBussinessModel = new bussinessModel(data);
          let savedata = await newBussinessModel.save();
          if (savedata) {
            res({ status: 200, data: {} });
          } else {
            rej({ status: 500, message: "something went wrong!!" });
          }
        });
      } catch (err) {
        rej({ status: 500, error: err, message: "something went wrong!!" });
      }
    });
  },
};
