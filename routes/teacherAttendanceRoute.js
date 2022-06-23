const express = require("express");
const router = express.Router();
const teacherAttendanceModel = require("../models/teacherAttendanceModel");

router.post("/insert", (request, responce) => {
  teacherAttendanceModel.findOne(
    {
      date: request.body.date,
      teacherId: request.body.teacherId,
      slotId: request.body.slotId,
      status: request.body.status,
    },
    (error, data) => {
      if (error) {
        console.log(error);
      }
      if (!data) {
        let teacherAttendanceModelObject = new teacherAttendanceModel({
          teacherId: request.body.teacherId,
          date: request.body.date,
          slotId: request.body.slotId,
          status: request.body.status,
          confirmation: request.body.confirmation,
        });
        teacherAttendanceModelObject
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

router.get("/view", (request, responce) => {
  teacherAttendanceModel.find(
    {},
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

function pad(d) {
  return d < 10 ? "0" + d.toString() : d.toString();
}

router.get("/view/:id", (request, responce) => {
  teacherAttendanceModel
    .find({ teacherId: request.params.id }, null, { sort: { createdAt: -1 } })
    .populate({
      path: "slotId",
      populate: {
        path: "labId",
        model: "labs",
      },
    })
    .exec((error, data) => {
      if (error) {
        console.log(error);
      } else {
        responce.json(
          data.map((one, i) => {
            let tt = [one.slotId.startTime, one.slotId.endTime];
            tt.map((two, j) => {
              if (parseInt(tt[j].slice(0, 2)) <= 12) {
                tt[j] += "AM";
              } else {
                tt[j] =
                  pad(parseInt(parseInt(tt[j].slice(0, 2)) - 12)) +
                  tt[j].slice(2) +
                  "PM";
              }
            });
            return {
              date: one.date,
              name: one.slotId.labId.name,
              subjectName: one.slotId.subjectName,
              status: one.status,
              confirmation: one.confirmation,
              createdAt: one.createdAt,
              range: tt[0] + "-" + tt[1],
            };
          })
        );
      }
    });
});
const fetchTodayDate = () => {
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, "0");
  var mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
  var yyyy = today.getFullYear();
  return mm + "/" + dd + "/" + yyyy;
};

router.get("/view/dated/today", (request, responce) => {
  teacherAttendanceModel
    .find({ date: fetchTodayDate() }, null, { sort: { createdAt: -1 } })
    .populate({
      path: "slotId",
      populate: {
        path: "labId",
        model: "labs",
      },
    })
    .exec((error, data) => {
      if (error) {
        console.log(error);
      } else {
        responce.json(
          data.map((one, i) => {
            let tt = [one.slotId.startTime, one.slotId.endTime];
            tt.map((two, j) => {
              if (parseInt(tt[j].slice(0, 2)) <= 12) {
                tt[j] += "AM";
              } else {
                tt[j] =
                  pad(parseInt(parseInt(tt[j].slice(0, 2)) - 12)) +
                  tt[j].slice(2) +
                  "PM";
              }
            });
            return {
              date: one.date,
              name: one.slotId.labId.name,
              subjectName: one.slotId.subjectName,
              status: one.status,
              confirmation: one.confirmation,
              createdAt: one.createdAt,
              range: tt[0] + "-" + tt[1],
            };
          })
        );
      }
    });
});

router.post("/view/dated/monthly", (request, responce) => {
  teacherAttendanceModel.find(
    {
      date: { $gte: request.body.from, $lte: request.body.till },
      status: "in",
      confirmation: true,
    },
    null,
    { sort: { date: -1 } },
    (error, data) => {
      if (error) {
        console.log(error);
      } else {
        responce.json(
          data.map((a, b) => {
            return a.slotId;
          })
        );
      }
    }
  );
});

router.post("/view/dated/weekly", (request, responce) => {
  teacherAttendanceModel
    .find(
      {
        date: { $gte: request.body.from },
        date: { $lte: request.body.till },
        confirmation: true,
      },
      null,
      { sort: { date: -1 } }
    )
    .populate({
      path: "slotId",
    })
    .exec((error, data) => {
      if (error) {
        console.log(error);
      } else {
        data = data.filter((a, b) => {
          return a.slotId.labId.toString() === request.body.labId.toString();
        });
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
            day: data.filter((a, b) => {
              return a.date === one;
            })[0].slotId.day,
            data: data
              .filter((a, b) => {
                return a.date === one;
              })
              .map((a, b) => {
                return {
                  time: a.createdAt,
                  status: a.status,
                  startTime: a.slotId.startTime,
                  endTime: a.slotId.endTime,
                };
              }),
          });
        });
        responce.json(temp);

        // .map((a, b) => {
        //   return a.slotId;
        // })
      }
    });
});

router.get("/view/staff/:id", (request, responce) => {
  teacherAttendanceModel
    .find({ confirmation: false }, null, { sort: { date: -1 } })
    .populate({
      path: "slotId",
      populate: {
        path: "labId",
        model: "labs",
      },
    })
    .exec((error, data) => {
      if (error) {
        console.log(error);
      } else {
        responce.json(
          data
            .filter((one, i) => {
              return (
                one.slotId.labId.controller.toString() === request.params.id
              );
            })
            .map((one, i) => {
              let tt = [one.slotId.startTime, one.slotId.endTime];
              tt.map((two, j) => {
                if (parseInt(tt[j].slice(0, 2)) <= 12) {
                  tt[j] += "AM";
                } else {
                  tt[j] =
                    pad(parseInt(parseInt(tt[j].slice(0, 2)) - 12)) +
                    tt[j].slice(2) +
                    "PM";
                }
              });
              return {
                _id: one._id,
                date: one.date,
                name: one.slotId.labId.name,
                subjectName: one.slotId.subjectName,
                status: one.status,
                confirmation: one.confirmation,
                createdAt: one.createdAt,
                range: tt[0] + "-" + tt[1],
              };
            })
        );
      }
    });
});

router.put("/update/confirm/:id", (request, responce) => {
  teacherAttendanceModel.findByIdAndUpdate(
    request.params.id,
    {
      confirmation: true,
    },
    { new: true },
    (error, data) => {
      if (error) {
        console.log(error);
      } else {
        responce.json(data);
      }
    }
  );
});

router.post("/checkSlotAttendance", (request, responce) => {
  let slots = request.body.slots;
  let date = request.body.date;
  let teacherId = request.body.teacherId;
  teacherAttendanceModel.find(
    { date: date, teacherId: teacherId },
    (error, data) => {
      if (error) {
        console.log(error);
      } else {
        if (data) {
          slots.map((one, i) => {
            let status = [];
            data.map((two, j) => {
              if (one._id === two.slotId.toString()) {
                status.push(two.status);
              }
            });
            slots[i].status = status;
          });
          responce.json(slots);
        }
      }
    }
  );
});

router.post("/check", (request, responce) => {
  teacherAttendanceModel.find(
    {
      date: request.body.date,
      teacherId: request.body.teacherId,
      slotId: request.body.slotId,
    },
    (error, data) => {
      if (error) {
        console.log(error);
      } else {
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
    }
  );
});

router.get(
  "/qrcode/:month/:day/:year/:teacherId/:slotId/:status/:url",
  (request, responce) => {
    teacherAttendanceModel.findOne(
      {
        date: `${request.params.month}/${request.params.day}/${request.params.year}`,
        teacherId: request.params.teacherId,
        slotId: request.params.slotId,
        status: request.params.status,
      },
      (error, data) => {
        if (error) {
          console.log(error);
        }
        if (!data) {
          let teacherAttendanceModelObject = new teacherAttendanceModel({
            teacherId: request.params.teacherId,
            date: `${request.params.month}/${request.params.day}/${request.params.year}`,
            status: request.params.status,
            slotId: request.params.slotId,
          });
          teacherAttendanceModelObject
            .save()
            .then((callbackData) => {
              console.log(callbackData);
              responce.redirect(
                `http://${request.params.url}/feedback?message=You are checked ${request.params.status} successfully!`
              );
            })
            .catch((error) => {
              console.log(error);
              responce.redirect(
                `http://${request.params.url}/feedback?message=An error occured. Please try again!`
              );
            });
        } else {
          console.log({ message: `Already checked ${request.params.status}!` });
          responce.redirect(
            `http://${request.params.url}/feedback?message=Already checked ${request.params.status}!`
          );
        }
      }
    );
  }
);

router.post("/delete/:id", (request, responce) => {
  teacherAttendanceModel.findByIdAndDelete(request.params.id, (error, data) => {
    if (error) {
      console.log(error);
    } else {
      responce.json(data);
    }
  });
});

module.exports = router;
