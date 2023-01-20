const bussinessModel = require("../../model/bussiness.model");

module.exports = {
    getLogo: () => {
        return new Promise(async (res, rej) => {
            try {
                let getData = await bussinessModel.find({}, { logo: 1, bussinessName: 1, _id: 0 });
                if (getData.length > 0) {
                    res({ status: 200, data: getData[0] });
                } else {
                    rej({ status: 404, message: "No data found!!" });
                }
            } catch (err) {
                console.log(err);
                rej({ status: 500, error: err, message: "something went wrong!!" });
            }
        });
    },
};
