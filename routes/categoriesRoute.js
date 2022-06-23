const express = require("express");
const router = express.Router();
const categoriesModel = require("../models/categoriesModel");

router.post("/insert", (request, responce) => {
    categoriesModel.findOne(
        {
            type: request.body.type,
            name: request.body.name,
        },
        (error, data) => {
            if (error) {
                console.log(error);
            }
            if (!data) {
                let categoriesModelObject = new categoriesModel({
                    type: request.body.type,
                    name: request.body.name,
                });
                categoriesModelObject
                    .save()
                    .then((callbackData) => {
                        responce.json(callbackData);
                    })
                    .catch((error) => {
                        responce.json(error);
                    });
            } else {
                responce.json({ message: `Already exist ${request.body.name} in type ${request.body.type}!` });
            }
        }
    );
});

router.get("/view", (request, responce) => {
    categoriesModel.find((error, data) => {
        if (error) {
            console.log(error);
        } else {
            responce.json(data);
        }
    });
});


router.post("/delete/:id", (request, responce) => {
    categoriesModel.findByIdAndDelete(request.params.id, (error, data) => {
        if (error) {
            console.log(error);
        } else {
            responce.json(data);
        }
    });
});


module.exports = router;