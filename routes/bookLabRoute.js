const express = require("express");
const router = express.Router();
const labsModel = require("../models/labsModel");
const bookLabModel = require("../models/bookLabModel");

router.post("/insert", (request, responce) => {
  let bookLabModelObject = new bookLabModel({
    ...request.body,
  });
  bookLabModelObject
    .save()
    .then((callbackData) => {
      responce.json(callbackData);
    })
    .catch((error) => {
      responce.json(error);
    });
});

router.get("/view", (request, responce) => {
  bookLabModel
    .find({ confirmation: { $eq: [] } }, null, {
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

const fetchTodayDate = (type = "") => {
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, "0");
  var mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
  var yyyy = today.getFullYear();
  today = mm + "/" + dd + "/" + yyyy;
  if (type === "u") {
    today = yyyy + "-" + mm + "-" + dd;
  }
  return today;
};

const fetchPreviousMonthDate = (type = "") => {
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
  if (type === "u") {
    today = yyyy + "-" + mm + "-" + dd;
  }
  return today;
};

router.get("/view/isToday/:labId", (request, responce) => {
  bookLabModel
    .find(
      {
        date: fetchTodayDate("u"),
        confirmation: request.params.labId,
        completed: false,
      },
      null,
      {
        sort: { createdAt: -1 },
      }
    )
    .exec((error, data) => {
      if (error) {
        console.log(error);
      } else {
        responce.json(data);
      }
    });
});

router.put("/update/complete/:id", (request, responce) => {
  bookLabModel.findByIdAndUpdate(
    request.params.id,
    {
      completed: true,
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

router.get("/view/lab/:id", (request, responce) => {
  bookLabModel
    .find({ confirmation: request.params.id }, null, {
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

router.get("/view/all", (request, responce) => {
  bookLabModel
    .find({}, null, {
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

router.get("/view/all/today", (request, responce) => {
  bookLabModel
    .find({ date: fetchTodayDate("u") }, null, {
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

router.get("/view/all/monthly", (request, responce) => {
  bookLabModel
    .find(
      {
        date: { $gte: fetchPreviousMonthDate("u") },
        date: { $lte: fetchTodayDate("u") },
      },
      null,
      {
        sort: { createdAt: -1 },
      }
    )
    .exec((error, data) => {
      if (error) {
        console.log(error);
      } else {
        responce.json(data);
      }
    });
});

router.put("/confirm/:id", (request, responce) => {
  bookLabModel.findByIdAndUpdate(
    request.params.id,
    {
      confirmation: request.body.confirmation,
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

function pad(d) {
  return d < 10 ? "0" + d.toString() : d.toString();
}
const getRange = (tt) => {
  tt.map((two, j) => {
    if (parseInt(tt[j].slice(0, 2)) <= 12) {
      tt[j] += "AM";
    } else {
      tt[j] =
        pad(parseInt(parseInt(tt[j].slice(0, 2)) - 12)) + tt[j].slice(2) + "PM";
    }
  });
  return tt[0] + "-" + tt[1];
};

router.get("/view/me/:id", (request, responce) => {
  bookLabModel
    .find({ staffId: request.params.id }, null, {
      sort: { createdAt: -1 },
    })
    .exec((error, data) => {
      if (error) {
        console.log(error);
      } else {
        responce.json(
          data.map((one) => {
            return {
              name: one.labId.name,
              date: one.date,
              slot: getRange([one.startTime, one.endTime]),
              createdAt: one.createdAt,
              confirmation: one.confirmation,
            };
          })
        );
      }
    });
});

router.get("/view/:id", (request, responce) => {
  bookLabModel.findById(request.params.id, (error, data) => {
    if (error) {
      console.log(error);
    } else {
      responce.json(data);
    }
  });
});

router.post("/delete/:id", (request, responce) => {
  bookLabModel.findByIdAndDelete(request.params.id, (error, data) => {
    if (error) {
      console.log(error);
    } else {
      responce.json(data);
    }
  });
});

module.exports = router;
