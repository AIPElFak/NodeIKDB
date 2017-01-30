/**
 * Created by Ivan on 1/30/2017.
 */

const userController = require('..\\controllers\\user.js');
const neo4jController = require('..\\controllers\\neo4j.js');
const authController = require('../controllers/authentication');
const redisController = require('../controllers/redis');

const express = require('express');
const router = express.Router();

module.exports = router;