const userController = require('../controllers/user.js');
const authController = require('../controllers/authentication');
const redisController = require('../controllers/redis');

var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.route('/createuser').post(userController.createUser);
router.route('/login').post(authController.login);
router.route('/verify/:link').get(redisController.verify);

module.exports = router;
