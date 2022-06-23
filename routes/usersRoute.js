const { cryptPassword, comparePassword } = require("../encryption");
const express = require("express");
const router = express.Router();
const usersModel = require("../models/usersModel");

router.post("/insert", (request, responce) => {
  usersModel.findOne({ email: request.body.email }, (error, data) => {
    if (error) {
      console.log(error);
    }
    if (!data) {
      cryptPassword(request.body.password, (e, encrypted) => {
        let usersModelObject = new usersModel({
          username: request.body.username,
          email: request.body.email,
          password: encrypted,
          phone: request.body.phone,
          role: request.body.role,
          identity: request.body.identity,
        });
        usersModelObject
          .save()
          .then((callbackData) => {
            responce.json(callbackData);
          })
          .catch((error) => {
            responce.json(error);
          });
      });
    } else {
      responce.json({ message: "User Already Registered" });
    }
  });
});

router.post("/validate", (request, responce) => {
  let email = request.body.email;
  let password = request.body.password;
  if (email !== "" && password !== "") {
    usersModel.findOne({ email: email }, (error, data) => {
      if (error) {
        console.log(error);
      }
      if (data) {
        comparePassword(password, data.password, (p, q) => {
          if (q) {
            responce.json({
              username: data.username,
              email: data.email,
              phone: data.phone,
              role: data.role,
              identity: data.identity,
              createdAt: data.createdAt,
              _id: data._id,
            });
          } else {
            responce.json({ message: "Incorrect Password" });
          }
        });
      } else {
        responce.json({ message: "No Account Found" });
      }
    });
  } else {
    responce.json({ message: "Please Fill All Fields" });
  }
});

router.get("/view", (request, responce) => {
  // comparePassword(
  //   "rehan1223",
  //   "$2b$10$7kTusy1iYoWwMtX5ZiO2f.8L2SQobym4qdg/Gx1bv9rUdO8SgjF6a",
  //   (p, q) => {
  //     console.log(p, q);
  //   }
  // );

  // console.log(
  //   cryptPassword("admin", (e, r) => {
  //     console.log(e, r);
  //   })
  // );
  usersModel.find((error, data) => {
    if (error) {
      console.log(error);
    } else {
      responce.json(data);
    }
  });
});

router.get("/view/:id", (request, responce) => {
  usersModel.findById(request.params.id, (error, data) => {
    if (error) {
      console.log(error);
    } else {
      responce.json(data);
    }
  });
});

router.get("/view/role/:role", (request, responce) => {
  usersModel.find({ role: request.params.role }, (error, data) => {
    if (error) {
      console.log(error);
    } else {
      responce.json(
        data.map((one) => {
          return {
            username: one.username,
            email: one.email,
            identity: one.identity,
            _id: one._id,
          };
        })
      );
    }
  });
});

router.post("/delete/:id", (request, responce) => {
  usersModel.findByIdAndDelete(request.params.id, (error, data) => {
    if (error) {
      console.log(error);
    } else {
      responce.json(data);
    }
  });
});

router.get("/delete", (request, responce) => {
  usersModel.deleteMany({}, (error, data) => {
    if (error) {
      console.log(error);
    } else {
      responce.json(data);
    }
  });
});

router.post("/update/:id", (request, responce) => {
  usersModel.findById(request.params.id, (error, userData) => {
    if (error) {
      console.log(error);
    } else {
      let toUpdate = {};
      if (request.body.username !== userData.username) {
        toUpdate.username = request.body.username;
      }
      if (request.body.email !== userData.email) {
        toUpdate.email = request.body.email;
      }
      if (request.body.phone !== userData.phone) {
        toUpdate.phone = request.body.phone;
      }
      if (request.body.role !== userData.role) {
        toUpdate.role = request.body.role;
      }
      if (request.body.identity !== userData.identity) {
        toUpdate.identity = request.body.identity;
      }

      if (
        request.body.password !== userData.password &&
        request.body.password !== ""
      ) {
        cryptPassword(request.body.password, (e, r) => {
          toUpdate.password = r;
          usersModel.findByIdAndUpdate(
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
        });
      } else {
        usersModel.findByIdAndUpdate(
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
    }
  });
});

module.exports = router;
