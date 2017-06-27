/**
 * Created by Ivan on 1/30/2017.
 */

const userController = require('../controllers/user.js');
const neo4jController = require('../controllers/neo4j.js');
const authController = require('../controllers/authentication');
const suggestionController = require('../controllers/suggestion');

const express = require('express');
const router = express.Router();

router.use(authController.authenticate);



router.route('/getnodeswithlabels').post(neo4jController.getNodesByLabels);
router.route('/getnodebyid/:_id').get(neo4jController.getNodeById);
router.route('/getnodebyname/:name').get(neo4jController.getNodeByName);
router.route('/getallnodes').get(neo4jController.getAllNodes);
router.route('/getrelationshipbyid/:_id').get(neo4jController.getRelationshipById);

router.route('/createnodesuggestion').post(suggestionController.createNodeSuggestion);
router.route('/createlinksuggestion').post(suggestionController.createLinkSuggestion);
router.route('/getnodesuggestions/:_id?').get(suggestionController.getNodeSuggestions);
router.route('/getlinksuggestions/:_id?').get(suggestionController.getLinkSuggestions);


const User = require('../Schemas/User.js');
function checkValidUserId(req, res, next) {
    if (req.body.user_id) {
        User.findOne({'_id': req.body.user_id}, function (err, user) {
            if (err) {
                res.status(500).json("Internal error");
            }
            else if (!user) {
                res.status(400).json("Invalid user_id supplied");
            }
            else {
                next()
            }
        })
    }
    else {
        res.status(400).json("No user_id supplied");
    }

}
router.route('/voteonsuggestion').post(checkValidUserId, suggestionController.voteOnSuggestion);
router.route('/voteonnode').post(checkValidUserId, neo4jController.voteOnNode);
router.route('/voteonlink').post(checkValidUserId, neo4jController.voteOnLink);



module.exports = router;