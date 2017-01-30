/**
 * Created by Ivan on 1/30/2017.
 */

const User = require("../Schemas/User");

const redis = require("redis");

const client2 = redis.createClient();
client2.select(2, function (err, res) {
    if (err) {
        console.log('Redis client 2 error');
    }
    else {
        console.log('Redis client 2 up');
    }
});

exports.pushVerificationLink = function (link, user) {
    client2.set(link, user);
};

exports.verify = function (req, res) {
    var pom = req.params.link;
    client2.get(pom, function (err, reply) {
        if (err) {
                res.status(500).json("Internal error");
            }
            else if (!reply) {
                res.status(404).json("Not found");
            }
            else {
                User.findOneAndUpdate({"username": reply}, {"verified": true}, function (err, doc) {
                    if (err) {
                        res.status(500).json("Internal error");
                    }
                    else if (!doc) {
                        res.status(404).json("Not found");
                    }
                    else {
                        client2.del(pom);
                        res.status(200).json("User verified");
                    }
                });
            }
    });
};