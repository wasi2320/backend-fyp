const express = require("express");
const router = express.Router();
const labsModel = require("../models/labsModel");
const dailyEquipmentReportModel = require("../models/dailyEquipmentReportModel");

router.post("/insert", (request, responce) => {
  dailyEquipmentReportModel.findOne(
    {
      date: request.body.date,
      staffId: request.body.staffId,
    },
    (error, data) => {
      if (error) {
        console.log(error);
      }
      if (!data) {
        let dailyEquipmentReportModelObject = new dailyEquipmentReportModel({
          staffId: request.body.staffId,
          problemDomain: request.body.problemDomain,
          problemWithHardware: parseInt(request.body.problemWithHardware),
          problemWithSoftware: parseInt(request.body.problemWithSoftware),
          problemWithNetworking: parseInt(request.body.problemWithNetworking),
          problemWithOtherEquipment: parseInt(
            request.body.problemWithOtherEquipment
          ),
          description: request.body.description,
          date: request.body.date,
        });
        dailyEquipmentReportModelObject
          .save()
          .then((callbackData) => {
            responce.json(callbackData);
          })
          .catch((error) => {
            responce.json(error);
          });
      } else {
        responce.json({ message: "Report Already Submitted!" });
      }
    }
  );
});

router.get("/view", (request, responce) => {
  dailyEquipmentReportModel.find().exec((error, data) => {
    if (error) {
      console.log(error);
    } else {
      responce.json(data);
    }
  });
});

const fetchTodayDate = () => {
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, "0");
  var mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
  var yyyy = today.getFullYear();
  today = mm + "/" + dd + "/" + yyyy;
  return today;
};

const fetchPreviousMonthDate = () => {
  let now = new Date();
  let today = "";
  if (now.getMonth() === 0) {
    today = new Date(now.getFullYear() - 1, 3, now.getDate());
  } else {
    today = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
  }
  var dd = String(today.getDate()).padStart(2, "0");
  var mm = String(today.getMonth() - 1).padStart(2, "0"); //January is 0!
  var yyyy = today.getFullYear();
  today = mm + "/" + dd + "/" + yyyy;
  return today;
};

router.get("/view/dynamic/:problemWith/:range", (request, responce) => {
  let problemWith =
    "problemWith" +
    request.params.problemWith[0].toUpperCase() +
    request.params.problemWith.slice(1);
  let range = request.params.range;
  if (range === "today") {
    dailyEquipmentReportModel
      .find({ [problemWith]: { $gt: 0 }, date: fetchTodayDate() })
      .populate({
        path: "staffId",
      })
      .exec((error, data) => {
        if (error) {
          console.log(error);
        } else {
          responce.json(
            data.map((a, b) => {
              return {
                staffId: a.staffId,
                problem:
                  request.params.problemWith === "software"
                    ? a.problemWithSoftware
                    : request.params.problemWith === "hardware"
                    ? a.problemWithHardware
                    : request.params.problemWith === "networking"
                    ? a.problemWithNetworking
                    : request.params.problemWith === "others"
                    ? a.problemWithOtherEquipment
                    : "",
                problemDomain:
                  request.params.problemWith === "software"
                    ? a.problemDomain.softwareCategory
                    : request.params.problemWith === "hardware"
                    ? a.problemDomain.hardwareCategory
                    : request.params.problemWith === "networking"
                    ? a.problemDomain.networkingCategory
                    : request.params.problemWith === "others"
                    ? a.problemDomain.otherEquipmentCategory
                    : "",
              };
            })
          );
        }
      });
  } else if (range === "monthly") {
    dailyEquipmentReportModel
      .find({
        [problemWith]: { $gt: 0 },
        date: { $gte: fetchPreviousMonthDate() },
        date: { $lte: fetchTodayDate() },
      })
      .populate({
        path: "staffId",
      })
      .exec((error, data) => {
        if (error) {
          console.log(error);
        } else {
          responce.json(
            data.map((a, b) => {
              return {
                staffId: a.staffId,
                problem:
                  request.params.problemWith === "software"
                    ? a.problemWithSoftware
                    : request.params.problemWith === "hardware"
                    ? a.problemWithHardware
                    : request.params.problemWith === "networking"
                    ? a.problemWithNetworking
                    : request.params.problemWith === "others"
                    ? a.problemWithOtherEquipment
                    : "",
                problemDomain:
                  request.params.problemWith === "software"
                    ? a.problemDomain.softwareCategory
                    : request.params.problemWith === "hardware"
                    ? a.problemDomain.hardwareCategory
                    : request.params.problemWith === "networking"
                    ? a.problemDomain.networkingCategory
                    : request.params.problemWith === "others"
                    ? a.problemDomain.otherEquipmentCategory
                    : "",
                date: a.date,
              };
            })
          );
        }
      });
  } else {
    responce.json({
      message: "Invalid",
    });
  }
});

router.get("/view/software", (request, responce) => {
  dailyEquipmentReportModel
    .find({ problemWithSoftware: { $gt: 0 } })
    .populate({
      path: "staffId",
    })
    .exec((error, data) => {
      if (error) {
        console.log(error);
      } else {
        responce.json(
          data.map((a, b) => {
            return {
              staffId: a.staffId,
              problem: a.problemWithSoftware,
            };
          })
        );
      }
    });
});

router.get("/view/hardware", (request, responce) => {
  dailyEquipmentReportModel
    .find({ problemWithHardware: { $gt: 0 } })
    .populate({
      path: "staffId",
    })
    .exec((error, data) => {
      if (error) {
        console.log(error);
      } else {
        responce.json(
          data.map((a, b) => {
            return {
              staffId: a.staffId,
              problem: a.problemWithHardware,
            };
          })
        );
      }
    });
});

router.get("/view/me/:id", (request, responce) => {
  dailyEquipmentReportModel
    .find({ staffId: request.params.id }, null, {
      sort: { createdAt: -1 },
    })
    .exec((error, data) => {
      if (error) {
        console.log(error);
      } else {
        responce.json(data);
      }
    });
});

router.get("/view/:id", (request, responce) => {
  dailyEquipmentReportModel.findById(request.params.id, (error, data) => {
    if (error) {
      console.log(error);
    } else {
      responce.json(data);
    }
  });
});

router.post("/delete/:id", (request, responce) => {
  dailyEquipmentReportModel.findByIdAndDelete(
    request.params.id,
    (error, data) => {
      if (error) {
        console.log(error);
      } else {
        responce.json(data);
      }
    }
  );
});

module.exports = router;
