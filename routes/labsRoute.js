const express = require("express");
const router = express.Router();
const labsModel = require("../models/labsModel");

router.post("/insert", (request, responce) => {
  labsModel.findOne({ name: request.body.name }, (error, data) => {
    if (error) {
      console.log(error);
    }
    if (!data) {
      let labsModelObject = new labsModel({
        name: request.body.name,
        controller: request.body.controller,
      });
      labsModelObject
        .save()
        .then((callbackData) => {
          responce.json(callbackData);
        })
        .catch((error) => {
          responce.json(error);
        });
    } else {
      responce.json({ message: "Lab with same name already exists!" });
    }
  });
});

router.get("/view", (request, responce) => {
  labsModel
    .find({})
    .populate({
      path: "controller",
    })
    .exec((error, data) => {
      if (error) {
        console.log(error);
      } else {
        responce.json(
          data.map((one) => {
            return {
              name: one.name,
              controller: {
                username: one.controller ? one.controller.username : "",
                identity: one.controller ? one.controller.identity : "",
                email: one.controller ? one.controller.email : "",
                _id: one.controller ? one.controller._id : "",
              },
              _id: one._id,
              cameraIp: one.cameraIp,
              numberOfPcs: one.numberOfPcs,
            };
          })
        );
      }
    });
});

router.get("/view/labStaff/:labId", (request, responce) => {
  labsModel.findOne({ _id: request.params.labId }).exec((error, data) => {
    if (error) {
      console.log(error);
    } else {
      responce.json(data);
    }
  });
});

router.get("/view/staffId/:staffId", (request, responce) => {
  labsModel
    .find({})
    .populate({
      path: "controller",
    })
    .exec((error, data) => {
      if (error) {
        console.log(error);
      } else {
        responce.json(
          data
            .filter((one) => {
              if(!one.controller) return;
              return one.controller._id.toString() === request.params.staffId;
            })
            .map((one) => {
              return {
                name: one.name,
                controller: {
                  username: one.controller ? one.controller.username : "",
                  identity: one.controller ? one.controller.identity : "",
                  email: one.controller ? one.controller.email : "",
                  _id: one.controller ? one.controller._id : "",
                },
                _id: one._id,
                cameraIp: one.cameraIp,
                numberOfPcs: one.numberOfPcs,
              };
            })
        );
      }
    });
});

router.get("/view/staffId", (request, responce) => {
  labsModel
    .find({})
    .populate({
      path: "controller",
    })
    .exec((error, data) => {
      if (error) {
        console.log(error);
      } else {
        responce.json(
          data.map((one) => {
            return {
              name: one.name,
              controller: {
                username: one.controller ? one.controller.username : "",
                identity: one.controller ? one.controller.identity : "",
                email: one.controller ? one.controller.email : "",
                _id: one.controller ? one.controller._id : "",
              },
              _id: one._id,
            };
          })
        );
      }
    });
});

router.get("/view/:id", (request, responce) => {
  labsModel.findById(request.params.id, (error, data) => {
    if (error) {
      console.log(error);
    } else {
      responce.json(data);
    }
  });
});

router.get("/view/lab/fetch", (request, responce) => {
  labsModel.find({}).exec((error, data) => {
    if (error) {
      console.log(error);
    } else {
      responce.json(
        data.map((one) => {
          return {
            name: one.name,
            controller: one.controller,
            _id: one._id,
          };
        })
      );
    }
  });
});

router.post("/delete/:id", (request, responce) => {
  labsModel.findByIdAndDelete(request.params.id, (error, data) => {
    if (error) {
      console.log(error);
    } else {
      responce.json(data);
    }
  });
});

router.post("/update/:id", (request, responce) => {
  labsModel.findById(request.params.id, (error, userData) => {
    if (error) {
      console.log(error);
    } else {
      let toUpdate = {};
      if (request.body.name !== userData.name) {
        toUpdate.name = request.body.name;
      }
      if (request.body.cameraIp !== userData.cameraIp) {
        toUpdate.cameraIp = request.body.cameraIp;
      }
      if (request.body.numberOfPcs !== userData.numberOfPcs) {
        toUpdate.numberOfPcs = request.body.numberOfPcs;
      }
      if (request.body.controller !== userData.controller) {
        toUpdate.controller = request.body.controller;
      }
      labsModel.findByIdAndUpdate(
        request.params.id,
        {
          ...toUpdate,
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
    }
  });
});

module.exports = router;
