"use strict";
const { Users } = require("./../schemas/schemas");

exports.users = (_req, res) => {
    Users.find({})
        .select("-history")
        .then((result) => {
            res.send(result);
        });
};

exports.oneUser = async (req, res) => {
    try {
        const startDate = new Date(req.query.startDate);
        const endDate = new Date(req.query.endDate);

        const result = await Users.findOne(
            {
                _id: req.params.id,
                "history.date": { $gte: startDate, $lte: endDate },
            }
        ).lean();
        if (!result) {
            const plainUsr = await Users.findOne({ _id: req.params.id }).select("-history").lean();
            if (!plainUsr) {
                return res.status(404).json({ message: "User not found" });
            }
            plainUsr.history = [];
            return res.send(plainUsr);
        }
        if (result.history.length > 0) {
            const overallQnt = result.history.reduce(
                (acc, obj) => acc + obj.quantity,
                0
            );
            result.overall = overallQnt;
        }
        res.send(result);
    } catch (error) {
        res.status(500).send("Error: " + error.message);
    }

};

exports.addHistory = async (id, hst) => {
    const userF = await Users.findOne({ _id: id });
    if (userF) {
        userF.history.push(hst);
        return await userF.save();
    } else {
        return false;
    }
};

exports.loginUser = async (req, res) => {
    const { login, password } = req.body;
    try {
        const loggedUser = await Users.findOne({ login, password });
        if (loggedUser) {
            res.send(loggedUser);
        } else {
            res.status(401).send("User Unauthorized");
        }
    } catch (error) {
        res.status(500).send("Error: " + err.message);
    }
};

exports.addUser = (req, res) => {
    const newOrder = new Users(req.body);
    newOrder.save((err, newOrderDoc) => {
        if (err) {
            res.send(err);
        } else {
            res.send(newOrderDoc);
        }
        // saved!
    });
};

exports.deleteUser = async (req, res) => {
    Users.deleteOne({ _id: req.body.id }, (err) => {
        if (err) res.send(err);
        res.send("success!");
    });
};
exports.updateUser = (req, res) => {
    Users.findOneAndUpdate({ _id: req.body.id }, req.body.new, {
        new: true,
    }).then((doc) => {
        res.send(doc);
    });
};
