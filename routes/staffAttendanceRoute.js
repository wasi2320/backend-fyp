const express = require("express");
const router = express.Router();
const staffAttendanceModel = require("../models/staffAttendanceModel");
const labsModel = require("../models/labsModel");
const usersModel = require("../models/usersModel");

router.post("/insert", (request, responce) => {
  staffAttendanceModel.findOne(
    {
      date: request.body.date,
      staffId: request.body.staffId,
      status: request.body.status,
    },
    (error, data) => {
      if (error) {
        console.log(error);
      }
      if (!data) {
        let staffAttendanceModelObject = new staffAttendanceModel({
          staffId: request.body.staffId,
          date: request.body.date,
          status: request.body.status,
        });
        staffAttendanceModelObject
          .save()
          .then((callbackData) => {
            responce.json(callbackData);
          })
          .catch((error) => {
            responce.json(error);
          });
      } else {
        responce.json({ message: `Already checked ${request.body.status}!` });
      }
    }
  );
});

router.get("/qrcode/:month/:day/:year/:staffId/:status/:url", (request, responce) => {
  staffAttendanceModel.findOne(
    {
      date: `${request.params.month}/${request.params.day}/${request.params.year}`,
      staffId: request.params.staffId,
      status: request.params.status,
    },
    (error, data) => {
      if (error) {
        console.log(error);
      }
      if (!data) {
        let staffAttendanceModelObject = new staffAttendanceModel({
          staffId: request.params.staffId,
          date: `${request.params.month}/${request.params.day}/${request.params.year}`,
          status: request.params.status,
        });
        staffAttendanceModelObject
          .save()
          .then((callbackData) => {
            console.log(callbackData);
            responce.redirect(`http://${request.params.url}/feedback?message=You are checked ${request.params.status} successfully!`);
          })
          .catch((error) => {
            console.log(error);
            responce.redirect(`http://${request.params.url}/feedback?message=An error occured. Please try again!`);
          });
      } else {
        console.log({ message: `Already checked ${request.params.status}!` });
        responce.redirect(`http://${request.params.url}/feedback?message=Already checked ${request.params.status}!`);
      }
    }
  );
});

router.get("/view", (request, responce) => {
  staffAttendanceModel.find({}, null, { sort: { date: -1 } }, (error, data) => {
    if (error) {
      console.log(error);
    } else {
      responce.json(data);
    }
  });
});

router.post("/check", (request, responce) => {
  staffAttendanceModel.find(
    { date: request.body.date, staffId: request.body.staffId },
    (error, data) => {
      if (error) {
        console.log(error);
      }
      if (!data) {
        responce.json([]);
      } else {
        responce.json(
          data.map((a, b) => {
            return a.status;
          })
        );
      }
    }
  );
});

router.get("/view/:staffId", (request, responce) => {
  staffAttendanceModel.find(
    { staffId: request.params.staffId },
    null,
    { sort: { date: -1 } },
    (error, data) => {
      if (error) {
        console.log(error);
      } else {
        responce.json(data);
      }
    }
  );
});

router.get("/view/dated/:month/:day/:year", (request, responce) => {
  staffAttendanceModel.find(
    {
      date: `${request.params.month}/${request.params.day}/${request.params.year}`,
      status: "in",
    },
    null,
    { sort: { date: -1 } },
    (error, data) => {
      if (error) {
        console.log(error);
      } else {
        presentStaff = data.map((a, i) => {
          return a.staffId;
        });
        responce.json(presentStaff);
      }
    }
  );
});

router.post("/view/dated", (request, responce) => {
  staffAttendanceModel
    .find(
      {
        date: { $gte: request.body.from },
        date: { $lte: request.body.till },
        staffId: request.body.staffId,
        status: "in",
      },
      null,
      { sort: { date: -1 } }
    )
    .populate({
      path: "staffId",
    })
    .exec((error, data) => {
      if (error) {
        console.log(error);
      } else {
        let date1 = new Date(request.body.from);
        let date2 = new Date(request.body.till);
        let diffTime = Math.abs(date2 - date1);
        let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        responce.json({
          total: diffDays,
          present: data.length,
          absent: diffDays - data.length,
          staff: data.map((a, b) => {
            return {
              _id: a.staffId._id,
              username: a.staffId.username,
              email: a.staffId.email,
              identity: a.staffId.identity,
              date: a.date,
            };
          }),
        });
      }
    });
});

router.post("/view/dated/weekly", (request, responce) => {
  staffAttendanceModel
    .find(
      {
        date: { $gte: request.body.from },
        date: { $lte: request.body.till },
        staffId: request.body.staffId,
      },
      null,
      { sort: { date: -1 } }
    )
    .populate({
      path: "staffId",
    })
    .exec((error, data) => {
      if (error) {
        console.log(error);
      } else {
        let dates = [
          ...new Set(
            data.map((one, i) => {
              return one.date;
            })
          ),
        ];
        let temp = [];
        dates.map((one, i) => {
          temp.push({
            date: one,
            data: data
              .filter((a, b) => {
                return a.date === one;
              })
              .map((a, b) => {
                return {
                  time: a.createdAt,
                  status: a.status,
                };
              }),
          });
        });
        responce.json(temp);
      }
    });
});

router.post("/delete/:id", (request, responce) => {
  staffAttendanceModel.findByIdAndDelete(request.params.id, (error, data) => {
    if (error) {
      console.log(error);
    } else {
      responce.json(data);
    }
  });
});

router.get("/delete", (request, responce) => {
  staffAttendanceModel.deleteMany({}, (error, data) => {
    if (error) {
      console.log(error);
    } else {
      responce.json(data);
    }
  });
});

module.exports = router;
