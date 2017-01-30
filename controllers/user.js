/**
 * Created by Ivan on 1/30/2017.
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const redis = require('./redis');
const nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport("SMTP", {
     service: 'Gmail',
     auth: {
         user: 'idee.verify',
         pass: 'droptablegoogle'
     }
 });


var User = require('../Schemas/User');

//process.env.SECRET_KEY = "UserAuthKey";


exports.createUser = function(req,res){
    if(req.body.username && req.body.email && req.body.password)
    {
        User.find({$or:[{"username":req.body.username},{"email":req.body.email}]},function (err,users) {
            if(err) {
                res.status(500).json("An error occurred");
            }
            else if(users && users.length!=0){
                res.status(400).json("Existing username or email");
            }
            else {
                bcrypt.hash(req.body.password,10,function (err,hash) {
                    if(err){
                        res.status(500).json("An error occurred");
                    }
                    else {
                        var user = new User();
                        user.username = req.body.username;
                        user.email = req.body.email;
                        user.password=hash;
                        user.verified = false;

                         user.token = jwt.sign(user, process.env.SECRET_KEY ,{

                                });
                        user.save(function (err) {
                            if(err) {
                                res.status(500).json("An error occurred");
                            }
                            else {
                                var time = Date.now();
                                var link = "127.0.0.1:3000/verify/" + time;
                                redis.pushVerificationLink(time, user.username);
                                var mailOptions = {
                                    to: user.email,
                                    subject: 'Account verification',
                                    html: '<h1> Idee DNS</h1> <br /> \
                                    <br /> <h2> Click on the link below to verify your account \
                                    <br /> <link href = "'+ link + '">' + link + '</link></h2>'
                                };
                                transporter.sendMail(mailOptions, function (err, info) {
                                    if (err) {
                                        console.log(err);
                                    }
                                    else {
                                        console.log(info);
                                    }
                                    res.status(200).json(user);

                                });
                            }
                        });
                    }
                });
            }
        });
    }
    else {
        res.status(400).json("Specify an username,email and password");
    }

};