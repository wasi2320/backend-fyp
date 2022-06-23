const express = require("express");
const router = express.Router();
const timetableModel = require("../models/timetableModel");

router.post("/insert", (request, responce) => {
  let slots = request.body.slots;
  let sendBack = [];
  slots.map((item, i) => {
    timetableModel.findOne(
      {
        labId: request.body.labId,
        day: item.day,
        startTime: item.startTime,
        endTime: item.endTime,
      },
      (error, data) => {
        if (error) {
          console.log(error);
        }
        if (!data) {
          let timetableModelObject = new timetableModel({
            labId: request.body.labId,
            day: item.day,
            startTime: item.startTime,
            endTime: item.endTime,
            subjectName: item.subjectName,
            teacherId: item.teacherId,
            updatedAt: new Date().toLocaleString(),
          });
          timetableModelObject
            .save()
            .then((callbackData) => {
              // Done
            })
            .catch((error) => {
              sendBack.push({ slot: parseInt(i) + 1, message: error });
            });
        } else {
          sendBack.push({
            slot: parseInt(i) + 1,
            message: "Slot is already reserved!",
          });
        }
      }
    );
  });
  if (sendBack.length > 0) {
    responce.json(sendBack);
  } else {
    responce.json({});
  }
});

router.get("/view", (request, responce) => {
  timetableModel.find((error, data) => {
    if (error) {
      console.log(error);
    } else {
      responce.json(data);
    }
  });
});

router.post("/lab", (request, responce) => {
  let labs = request.body;
  timetableModel.find({}, (error, data) => {
    if (error) {
      console.log(error);
    } else {
      if (data) {
        labs.map((one, i) => {
          let status = false;
          data.map((two, j) => {
            if (one._id === two.labId.toString()) {
              status = true;
            }
          });
          labs[i].status = status;
        });
        responce.json(labs);
      }
    }
  });
});

function pad(d) {
  return d < 10 ? "0" + d.toString() : d.toString();
}

const fetchRanges = (slots) => {
  let temp = slots;
  let days = [];
  let defaultValue = temp[0].day;
  days.push(defaultValue);
  temp.map((one, i) => {
    if (one.day !== defaultValue) {
      defaultValue = one.day;
      days.push(one.day);
    }
  });
  let time = [];
  temp.map((one, i) => {
    time = [...time, one.startTime + "-" + one.endTime];
  });
  time = [...new Set(time)]
    .sort(function (a, b) {
      return a.split("-")[0].localeCompare(b.split("-")[0]);
    })
    .map((one, i) => {
      let tt = one.split("-");
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
      return tt[0] + "-" + tt[1];
    });
  return [days, time];
};

const formatSlots = (slots) => {
  let temp = slots;
  const sorter = {
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
    sunday: 7,
  };
  temp = temp.sort(function sortByDay(a, b) {
    let day1 = a.day.toLowerCase();
    let day2 = b.day.toLowerCase();
    return sorter[day1] - sorter[day2];
  });
  let temp2 = [];
  let defaultDay = temp[0].day;
  temp2.push([]);
  temp.map((one, i) => {
    if (one.day !== defaultDay) {
      defaultDay = one.day;
      temp2.push([]);
      temp2[temp2.length - 1].push(one);
    } else {
      temp2[temp2.length - 1].push(one);
    }
  });
  temp = [];
  temp2.map((one, i) => {
    temp = [
      ...temp,
      ...one.sort(function (a, b) {
        return a.startTime.localeCompare(b.startTime);
      }),
    ];
  });
  return temp;
};

router.get("/lab/:labId", (request, responce) => {
  timetableModel
    .find({ labId: request.params.labId })
    .populate({
      path: "teacherId",
    })
    .exec((error, data) => {
      if (error) {
        console.log(error);
      } else {
        if (data) {
          let slots = [];
          data.map((one, i) => {
            slots.push({
              day: one.day,
              startTime: one.startTime,
              endTime: one.endTime,
              subjectName: one.subjectName,
              teacherId: {
                username: one.teacherId.username,
                email: one.teacherId.email,
              },
              _id: one._id,
              updatedAt: one.updatedAt,
            });
          });
          try {
            responce.json({
              slots: formatSlots(slots),
              addOn: fetchRanges(slots),
            });
          } catch (e) {
            responce.json(slots);
          }
        }
      }
    });
});

router.get("/lab/book/:labId/:day", (request, responce) => {
  timetableModel
    .find({ labId: request.params.labId, day: request.params.day })
    .populate({
      path: "teacherId",
    })
    .exec((error, data) => {
      if (error) {
        console.log(error);
      } else {
        if (data) {
          let slots = [];
          data.map((one, i) => {
            slots.push({
              day: one.day,
              startTime: one.startTime,
              endTime: one.endTime,
              subjectName: one.subjectName,
              teacherId: {
                username: one.teacherId.username,
                email: one.teacherId.email,
              },
              _id: one._id,
              updatedAt: one.updatedAt,
            });
          });
          try {
            responce.json(fetchRanges(slots)[1]);
          } catch (e) {
            responce.json([]);
          }
        }
      }
    });
});

router.get("/editLab/:labId", (request, responce) => {
  try {
    timetableModel.find({ labId: request.params.labId }).exec((error, data) => {
      if (error) {
        console.log(error);
        responce.json({
          message: true,
        });
      } else {
        if (data) {
          if (data.length > 0) {
            responce.json({
              labId: request.params.labId,
              slots: formatSlots(data),
            });
          } else {
            responce.json({
              message: true,
            });
          }
        }
      }
    });
  } catch (e) {
    responce.json({
      message: true,
    });
  }
});

router.get("/view/:id", (request, responce) => {
  timetableModel.findById(request.params.id, (error, data) => {
    if (error) {
      console.log(error);
    } else {
      responce.json(data);
    }
  });
});

router.get("/view/teacher/:id/:day", (request, responce) => {
  timetableModel
    .find({ teacherId: request.params.id, day: request.params.day })
    .populate({
      path: "labId",
    })
    .exec((error, data) => {
      if (error) {
        console.log(error);
      } else {
        let temp = [];
        data.map((one, i) => {
          let tt = [one.startTime, one.endTime];
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
          temp.push({
            _id: one._id,
            subjectName: one.subjectName,
            name: one.labId.name,
            range: tt[0] + "-" + tt[1],
            startTime: one.startTime,
            endTime: one.endTime,
          });
        });
        responce.json(temp);
      }
    });
});

const getCurrentTime = () => {
  let today = new Date();
  let h = today.getHours();
  let m = today.getMinutes();
  return pad(h) + ":" + pad(m);
};

router.get("/view/teacher/qr/:id/:day", (request, responce) => {
  timetableModel
    .find({ teacherId: request.params.id, day: request.params.day })
    .populate({
      path: "labId",
    })
    .exec((error, data) => {
      if (error) {
        console.log(error);
      } else {
        let temp = [];
        data.map((one, i) => {
          if (
            Date.parse(`01/01/2011 ${one.startTime}:00`) <=
              Date.parse(`01/01/2011 ${getCurrentTime()}:00`) &&
            Date.parse(`01/01/2011 ${getCurrentTime()}:00`) <=
              Date.parse(`01/01/2011 ${one.endTime}:00`)
          ) {
            let tt = [one.startTime, one.endTime];
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
            temp.push({
              _id: one._id,
              subjectName: one.subjectName,
              name: one.labId.name,
              range: tt[0] + "-" + tt[1],
              startTime: one.startTime,
              endTime: one.endTime,
            });
          }
        });
        responce.json(temp);
      }
    });
});

router.post("/delete/:id", (request, responce) => {
  timetableModel.findByIdAndDelete(request.params.id, (error, data) => {
    if (error) {
      console.log(error);
    } else {
      responce.json(data);
    }
  });
});

const deleteAsap = (id) => {
  try {
    timetableModel.findByIdAndDelete(id, (error, data) => {
      if (error) {
        console.log(error);
      } else {
        return true;
      }
    });
  } catch (e) {
    return false;
  }
  return false;
};

const addAsap = (data) => {
  try {
    let timetableModelObject = new timetableModel({
      labId: data.labId,
      day: data.day,
      startTime: data.startTime,
      endTime: data.endTime,
      subjectName: data.subjectName,
      teacherId: data.teacherId,
      updatedAt: new Date().toLocaleString(),
    });
    timetableModelObject
      .save()
      .then((callbackData) => {
        // Done
        return true;
      })
      .catch((error) => {
        return false;
      });
  } catch (e) {
    return false;
  }
};

const updateAsap = (slotId, data) => {
  try {
    timetableModel.findById(slotId, (error, userData) => {
      if (error) {
        return false;
      } else if (!userData) {
        return false;
      } else {
        let toUpdate = {};
        if (data.day !== userData.day) {
          toUpdate.day = data.day;
        }
        if (data.startTime !== userData.startTime) {
          toUpdate.startTime = data.startTime;
        }
        if (data.endTime !== userData.endTime) {
          toUpdate.endTime = data.endTime;
        }
        if (data.subjectName !== userData.subjectName) {
          toUpdate.subjectName = data.subjectName;
        }
        if (data.teacherId !== userData.teacherId) {
          toUpdate.teacherId = data.teacherId;
        }
        timetableModel.findByIdAndUpdate(
          slotId,
          {
            ...toUpdate,
            updatedAt: new Date().toLocaleString(),
          },
          { new: true },
          (error, data) => {
            if (error) {
              return false;
            } else {
              return data;
            }
          }
        );
      }
    });
  } catch (e) {
    return false;
  }
};

router.put("/evaluate", (request, responce) => {
  let slotsUpdate = request.body.slots;
  let labId = request.body.labId;
  timetableModel.find({ labId: labId.toString() }, (error, slotsOrg) => {
    if (error) {
      console.log(error);
    } else {
      toDelete = [];
      toAdd = [];
      toUpdate = [];
      tempUpdate = new Set(
        slotsUpdate
          .map((a, b) => {
            if (a._id) {
              return a._id.toString();
            } else {
              toAdd.push(a);
              addAsap(a);
              return false;
            }
          })
          .filter((a, b) => {
            return a;
          })
      );
      tempOrg = new Set(
        slotsOrg.map((a, b) => {
          return a._id.toString();
        })
      );
      [...new Set([...tempOrg].filter((x) => !tempUpdate.has(x)))].map(
        (a, b) => {
          toDelete.push(a);
          deleteAsap(a);
        }
      );
      [...new Set([...tempUpdate].filter((x) => tempOrg.has(x)))].map(
        (a, b) => {
          toUpdate.push(a);
          updateAsap(
            a,
            slotsUpdate.filter((h, j) => {
              return h._id === a;
            })[0]
          );
        }
      );
      responce.json(true);
    }
  });

  // let sendBack = [];
  // slots.map((item, i) => {
  //   timetableModel.findOne(
  //     {
  //       labId: request.body.labId,
  //       day: item.day,
  //       startTime: item.startTime,
  //       endTime: item.endTime,
  //     },
  //     (error, data) => {
  //       if (error) {
  //         console.log(error);
  //       }
  //       if (!data) {
  //         let timetableModelObject = new timetableModel({
  //           labId: request.body.labId,
  //           day: item.day,
  //           startTime: item.startTime,
  //           endTime: item.endTime,
  //           subjectName: item.subjectName,
  //           teacherId: item.teacherId,
  //           updatedAt: new Date().toLocaleString(),
  //         });
  //         timetableModelObject
  //           .save()
  //           .then((callbackData) => {
  //             // Done
  //           })
  //           .catch((error) => {
  //             sendBack.push({ slot: parseInt(i) + 1, message: error });
  //           });
  //       } else {
  //         sendBack.push({
  //           slot: parseInt(i) + 1,
  //           message: "Slot is already reserved!",
  //         });
  //       }
  //     }
  //   );
  // });
  // if (sendBack.length > 0) {
  //   responce.json(sendBack);
  // } else {
  //   responce.json({});
  // }
});

const updateSlot = (slotId, request, responce) => {
  try {
    timetableModel.findById(slotId, (error, userData) => {
      if (error) {
        responce.json(false);
      } else if (!userData) {
        responce.json(false);
      } else {
        let toUpdate = {};
        if (request.body.day !== userData.day) {
          toUpdate.day = request.body.day;
        }
        if (request.body.startTime !== userData.startTime) {
          toUpdate.startTime = request.body.startTime;
        }
        if (request.body.endTime !== userData.endTime) {
          toUpdate.endTime = request.body.endTime;
        }
        if (request.body.subjectName !== userData.subjectName) {
          toUpdate.subjectName = request.body.subjectName;
        }
        if (request.body.teacherId !== userData.teacherId) {
          toUpdate.teacherId = request.body.teacherId;
        }
        timetableModel.findByIdAndUpdate(
          slotId,
          {
            ...toUpdate,
            updatedAt: new Date().toLocaleString(),
          },
          { new: true },
          (error, data) => {
            if (error) {
              responce.json(false);
            } else {
              responce.json(data);
            }
          }
        );
      }
    });
  } catch (e) {
    responce.json(false);
  }
};

router.post("/update/:id", (request, responce) => {
  updateSlot(request.params.id, request, responce);
});

module.exports = router;

// {
//   "labId": "6217da697a0f89aff0a62206",
//   "slots": [
//       {
//           "day": "monday",
//           "startTime": "11:30",
//           "endTime": "13:00",
//           "subjectName": "DE",
//           "teacherId": "621b58f54607b18a0e6f43ce"
//       },
//       {
//           "day": "monday",
//           "startTime": "13:00",
//           "endTime": "14:30",
//           "subjectName": "AI",
//           "teacherId": "621b59034607b18a0e6f43d1"
//       },
//       {
//           "day": "tuesday",
//           "startTime": "11:30",
//           "endTime": "13:00",
//           "subjectName": "HCI",
//           "teacherId": "621b58f54607b18a0e6f43ce"
//       },
//       {
//           "day": "thursday",
//           "startTime": "11:30",
//           "endTime": "13:00",
//           "subjectName": "HCI",
//           "teacherId": "621b58f54607b18a0e6f43ce"
//       },
//       {
//           "day": "wednesday",
//           "startTime": "11:30",
//           "endTime": "13:00",
//           "subjectName": "DE",
//           "teacherId": "621b58f54607b18a0e6f43ce"
//       },
//       {
//           "day": "wednesday",
//           "startTime": "13:00",
//           "endTime": "14:30",
//           "subjectName": "AI",
//           "teacherId": "621b59034607b18a0e6f43d1"
//       },
//       {
//           "day": "thursday",
//           "startTime": "08:30",
//           "endTime": "11:30",
//           "subjectName": "AI Lab",
//           "teacherId": "621b59034607b18a0e6f43d1"
//       },
//       {
//           "day": "friday",
//           "startTime": "08:30",
//           "endTime": "11:30",
//           "subjectName": "DS",
//           "teacherId": "621b59034607b18a0e6f43d1"
//       },
//       {
//           "day": "saturday",
//           "startTime": "11:30",
//           "endTime": "15:00",
//           "subjectName": "PDC",
//           "teacherId": "621b59034607b18a0e6f43d1"
//       },
//       {
//           "day": "saturday",
//           "startTime": "15:00",
//           "endTime": "18:00",
//           "subjectName": "Dev Ops",
//           "teacherId": "621b59034607b18a0e6f43d1"
//       }
//   ]
// }

// !(
//   parseInt(new Date().getHours()) >=
//     parseInt(one.startTime.slice(0, 2)) &&
//   parseInt(new Date().getMinutes()) >=
//     parseInt(one.startTime.slice(3)) &&
//   parseInt(new Date().getHours()) <=
//     parseInt(one.endTime.slice(0, 2)) &&
//   parseInt(new Date().getMinutes()) <=
//     parseInt(one.startTime.slice(3))
// )
