/**
 * Created by Ivan on 1/30/2017.
 */

const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost', function (err) {
  if (err) {
    console.log(err);
  }
  else {
    console.log("Mongoose connected.");
  }
});