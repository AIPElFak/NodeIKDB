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
router.route('/getallnodes').get(neo4jController.getAllNodes);
router.route('/getrelationshipbyid/:_id').get(neo4jController.getRelationshipById);

router.route('/createnodesuggestion').post(suggestionController.createNodeSuggestion);
router.route('/createlinksuggestion').post(suggestionController.createLinkSuggestion);
router.route('/getnodesuggestions/:_id?').get(suggestionController.getNodeSuggestions);
router.route('/getlinksuggestions/:_id?').get(suggestionController.getLinkSuggestions);
router.route('/voteonsuggestion').post(suggestionController.voteOnSuggestion);
router.route('/voteonnode').post(neo4jController.voteOnNode);
router.route('/voteonlink').post(neo4jController.voteOnLink);



module.exports = router;