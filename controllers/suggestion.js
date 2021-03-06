/**
 * Created by Ivan on 2/14/2017.
 */

const LinkSuggestion = require('../Schemas/LinkSuggestion');
const NodeSuggestion = require('../Schemas/NodeSuggestion');
const CategorySuggestion = require('../Schemas/CategorySuggestion');

const neo4j = require('node-neo4j');
let db = new neo4j('http://neo4j:test@localhost:7474');

const socketController = require('./socket');

exports.getNodeSuggestion = () => {
    if (req.body._id) {
        //mongo doesn't support lambda functions
        NodeSuggestion.findOne({"_id": req.body._id}, function (err, doc) {
            if (err) {
                res.status(500).json("Server error");
            }
            else if (!doc) {
                res.status(400).json("Invalid _id suplied");
            }
            else {
                res.status(200).json(doc);
            }
        })
    }
    else {
        res.status(400).json("No _id in request");
    }
};

exports.getLinkSuggestion = () => {
    if (req.body._id) {
        LinkSuggestion.findOne({"_id": req.body._id}, function (err, doc) {
            if (err) {
                res.status(500).json("Server error");
            }
            else if (!doc) {
                res.status(400).json("Invalid _id suplied");
            }
            else {
                res.status(200).json(doc);
            }
        })
    }
    else {
        res.status(400).json("No _id in request");
    }
};

exports.createLinkSuggestion = function (req, res) {
    //valid req.body.author assumed
    if (req.body.author && req.body.suggestion_type) {
        if (req.body.suggestion_type == "CREATE") {
            if (req.body.node_from && req.body.node_to) {
                if (req.body.type) {
                    db.readNode(req.body.node_from, function (err, nodeFrom) {
                        if (err) {
                            res.status(500).json("Internal error");
                        }
                        else if (!nodeFrom) {
                            res.status(400).json("Invalid start node id supplied");
                        }
                        else {
                            db.readNode(req.body.node_to, function (err, nodeTo) {
                                if (err) {
                                    res.status(500).json("Internal error");
                                }
                                else if (!nodeTo) {
                                    res.status(400).json("Invalid end node id supplied");
                                }
                                else {
                                    let newRelationship = new LinkSuggestion();
                                    newRelationship.author = req.body.author;
                                    newRelationship.suggestion_type = req.body.suggestion_type;
                                    newRelationship.link_id = null;
                                    newRelationship.type = req.body.type;
                                    if (req.body.description) {
                                        newRelationship.description = req.body.description;
                                    }
                                    else {
                                        newRelationship.description = null;
                                    }
                                    newRelationship.node_from = req.body.node_from;
                                    newRelationship.node_to = req.body.node_to;
                                    newRelationship.start_name = nodeFrom.name;
                                    newRelationship.end_name = nodeTo.name;

                                    newRelationship.save(function (err) {
                                        if (err) {
                                            res.status(500).json("Internal error");
                                        }
                                        else {
                                            socketController.broadcastEvent("linksuggestion");
                                            res.status(200).json(newRelationship);
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
                else {
                    res.status(400).json("No relationship type supplied");
                }


            }
            else {
                res.status(400).json("Invalid node identificators supplied");
            }
        }
        else if (req.body.suggestion_type == "EDIT") {
            if (req.body.link_id) {
                //let query = "MATCH ()-[r]-() Where ID(r)=" + req.body.link_id + " return r;";
                db.readRelationship(req.body.link_id, function (err, rel) {
                    if (err) {
                        res.status(500).json("Internal error");
                    }
                    else if (!rel) {
                        res.status(400).json("Invalid link_id supplied");
                    }
                    else {
                        console.log(rel);
                        let newRelationship = new LinkSuggestion();
                        newRelationship.author = req.body.author;
                        newRelationship.suggestion_type = req.body.suggestion_type;
                        newRelationship.link_id = req.body.link_id;
                        // if (req.body.type) {
                        //     newRelationship.type = req.body.type;
                        // }
                        // else {
                        //     newRelationship.type = rel._type;
                        // }
                        // onemogucena promena tipa kod veza
                        newRelationship.type = rel._type;

                        if (req.body.description) {
                            newRelationship.description = req.body.description;
                        }
                        else {
                            newRelationship.description = rel.description;
                        }
                        newRelationship.node_from = rel._start;
                        newRelationship.node_to = rel._end;
                        newRelationship.start_name = rel.start_name;
                        newRelationship.end_name = rel.end_name;

                        newRelationship.save(function (err) {
                            if (err) {
                                res.status(500).json("Internal error");
                            }
                            else {
                                socketController.broadcastEvent("linksuggestion");
                                res.status(200).json(newRelationship);
                            }
                        });
                    }
                });
            }
            else {
                res.status(400).json("No link_id in request");
            }
        }
        else if (req.body.suggestion_type == "DELETE") {
            if (req.body.link_id) {
                //let query = "MATCH ()-[r]-() Where ID(r)=" + req.body.link_id + " return r;";
                db.readRelationship(req.body.link_id, function (err, rel) {
                    if (err) {
                        res.status(500).json("Internal error");
                    }
                    else if (!rel) {
                        res.status(400).json("Invalid link_id supplied");
                    }
                    else {
                        let newRelationship = new LinkSuggestion();
                        newRelationship.author = req.body.author;
                        newRelationship.suggestion_type = req.body.suggestion_type;
                        newRelationship.link_id = req.body.link_id;
                        newRelationship.type = rel._type;
                        newRelationship.description = rel.description;
                        newRelationship.node_from = rel._start;
                        newRelationship.node_to = rel._end;
                        newRelationship.start_name = rel.start_name;
                        newRelationship.end_name = rel.end_name;

                        newRelationship.save(function (err) {
                            if (err) {
                                res.status(500).json("Internal error");
                            }
                            else {
                                socketController.broadcastEvent("linksuggestion");
                                res.status(200).json(newRelationship);
                            }
                        });
                    }
                });
            }
            else {
                res.status(400).json("No link_id in request");
            }
        }
        else {
            res.status(400).json("Unsupported suggestion type");
        }
            
    }
    else {
        res.status(400).json("Insufficient data in request");
    }
};


exports.createNodeSuggestion = function (req, res) {
    if (req.body.author && req.body.suggestion_type) {
        if (req.body.suggestion_type == "CREATE") {
            if (req.body.name && req.body.definition) {
                if (req.body.types && req.body.types instanceof Array && req.body.types.length && req.body.types.length > 0) {
                    let newNode = new NodeSuggestion();
                    newNode.author = req.body.author;
                    newNode.suggestion_type = req.body.suggestion_type;
                    newNode.node_id = null;
                    newNode.types = [];
                    for (let i=0; i<=req.body.types.length-1; i++) {
                        newNode.types.push(req.body.types[i]);
                    }
                    newNode.name = req.body.name;
                    newNode.definition = req.body.definition;
                    if (req.body.description) {
                        newNode.description = req.body.description;
                    }
                    else {
                        newNode.description = null;
                    }

                    newNode.save(function (err) {
                        if(err) {
                            res.status(500).json("Internal error");
                        }
                        else {
                            socketController.broadcastEvent("nodesuggestion");
                            res.status(200).json(newNode);
                        }
                    });
                }
                else {
                    res.status(400).json("Invalid type data supplied");
                }
            }
            else {
                res.status(400).json("Insufficient data to build a suggestion");
            }
        }
        else if (req.body.suggestion_type == "EDIT") {
            if (req.body.node_id) {
                db.readNode(req.body.node_id, function (err, node) {
                    if (err) {
                        res.status(500).json("Internal error");
                    }
                    else if (!node) {
                        res.status(400).json("Invalid node_id supplied");
                    }
                    else {
                        let newNode = new NodeSuggestion();
                        newNode.author = req.body.author;
                        newNode.suggestion_type = req.body.suggestion_type;
                        newNode.node_id = req.body.node_id;
                        if (req.body.types) {
                            if (req.body.types instanceof Array && req.body.types.length && req.body.types.length > 0) {
                                newNode.types = [];
                                for (let i=0; i<=req.body.types.length-1; i++) {
                                    newNode.types.push(req.body.types[i]);
                                }
                            }
                            else {
                                res.status(400).json("Invalid node types data supplied");
                            }
                        }
                        else {
                            //if unchanged, see what to do...
                            newNode.types = null;
                        }

                        if (req.body.name) {
                            //ime cvora ne moze da se menja
                            newNode.name = node.name;
                            //newNode.name = req.body.name;
                        }
                        else {
                            newNode.name = node.name;
                        }

                        if (req.body.definition) {
                            newNode.definition = req.body.definition;
                        }
                        else {
                            newNode.definition = node.definition;
                        }

                        if (req.body.description) {
                            newNode.description = req.body.description;
                        }
                        else {
                            newNode.description = node.description;
                        }

                        newNode.save(function (err) {
                            if (err) {
                                res.status(500).json("Internal error");
                            }
                            else {
                                socketController.broadcastEvent("nodesuggestion");
                                res.status(200).json(newNode);
                            }
                        });
                    }
                });

            }
            else {
                res.status(400).json("No node_id in request");
            }
        }
        else if (req.body.suggestion_type == "DELETE") {
            if (req.body.node_id) {
                db.readNode(req.body.node_id, function (err, node) {
                    if (err) {
                        res.status(500).json("Internal error");
                    }
                    else if (!node) {
                        res.status(400).json("Invalid node_id supplied");
                    }
                    else {
                        let newNode = new NodeSuggestion();
                        newNode.author = req.body.author;
                        newNode.suggestion_type = req.body.suggestion_type;
                        newNode.node_id = req.body.node_id;
                        newNode.types = null; //???
                        newNode.name = node.name;
                        newNode.definition = node.definition;
                        newNode.description = node.description;

                        newNode.save(function (err) {
                            if (err) {
                                res.status(500).json("Internal error");
                            }
                            else {
                                socketController.broadcastEvent("nodesuggestion");
                                res.status(200).json(newNode);
                            }
                        });
                    }
                });
            }
            else {
                res.status(400).json("No node_id in request");
            }
        }
        else {
            res.status(400).json("Unsupported suggestion type");
        }
    }
    else {
        res.status(400).json("Insufficient data in request");
    }
};


exports.getNodeSuggestions = function (req, res) {
    if (req.params._id) {
        NodeSuggestion.findOne({"_id": req.params._id}, function (err, result) {
            if (err) {
                res.status(500).json("Internal error");
            }
            else {
                res.status(200).json(result);
            }
        });
    }
    else {
        NodeSuggestion.find({}, function (err, result) {
            if (err) {
                res.status(500).json("Internal error");
            }
            else {
                res.status(200).json(result);
            }
        });
    }
};

exports.getLinkSuggestions = function (req, res) {
    if (req.params._id) {
        LinkSuggestion.findOne({"_id": req.params._id}, function (err, result) {
            if (err) {
                res.status(500).json("Internal error");
            }
            else {
                res.status(200).json(result);
            }
        });
    }
    else {
        LinkSuggestion.find({}, function (err, result) {
            if (err) {
                res.status(500).json("Internal error");
            }
            else {
                res.status(200).json(result);
            }
        });
    }
};

exports.filterNodeSuggestions = function (req, res) {
    if (req.body.name) { //mozda pukne ako se cvor zove "false"
        NodeSuggestion.find({"name": req.body.name}, function (err, result) {
            if (err) {
                res.status(500).json("Internal error");
            }
            else {
                res.status(200).json(result);
            }
        });
    }
    else {
        //ne moze da se desi
        res.status(400).json("No node name in request");
    }
};


exports.voteOnSuggestion = function (req, res) {
    if (req.body.suggestion_type && req.body.suggestion_id && req.body.vote && req.body.user_id) {

        if (req.body.suggestion_type == "NODE") {
            if (req.body.vote == "POSITIVE") {

                NodeSuggestion.findOneAndUpdate({"_id": req.body.suggestion_id}, {$pull: {"votes_against": req.body.user_id, "votes_for": req.body.user_id}}, function (err, result1) {
                    if (err) {
                        res.status(500).json("Internal error");
                    }
                    else {
                        NodeSuggestion.findOneAndUpdate({"_id": req.body.suggestion_id}, {$push: {"votes_for": req.body.user_id}}, function (err, result2) {
                            if (err) {
                                res.status(500).json("Internal error");
                            }
                            else {
                                socketController.broadcastEvent("nodesuggestion-" + req.body.suggestion_id);
                                res.status(200).json("Success");
                            }
                        });
                    }
                });

            }
            else if (req.body.vote == "NEGATIVE") {

                NodeSuggestion.findOneAndUpdate({"_id": req.body.suggestion_id}, {$pull: {"votes_against": req.body.user_id, "votes_for": req.body.user_id}}, function (err, result1) {
                    if (err) {
                        res.status(500).json("Internal error");
                    }
                    else {
                        NodeSuggestion.findOneAndUpdate({"_id": req.body.suggestion_id}, {$push: {"votes_against": req.body.user_id}}, function (err, result2) {
                            if (err) {
                                res.status(500).json("Internal error");
                            }
                            else {
                                socketController.broadcastEvent("nodesuggestion-" + req.body.suggestion_id);
                                res.status(200).json("Success");
                            }
                        });
                    }
                });
            }
            else {
                res.status(400).json("Invalid vote type supplied");
            }
        }
        else if (req.body.suggestion_type == "LINK") {
            if (req.body.vote == "POSITIVE") {

                LinkSuggestion.findOneAndUpdate({"_id": req.body.suggestion_id}, {$pull: {"votes_against": req.body.user_id, "votes_for": req.body.user_id}}, function (err, result1) {
                    if (err) {
                        res.status(500).json("Internal error");
                    }
                    else {
                        LinkSuggestion.findOneAndUpdate({"_id": req.body.suggestion_id}, {$push: {"votes_for": req.body.user_id}}, function (err, result2) {
                            if (err) {
                                res.status(500).json("Internal error");
                            }
                            else {
                                socketController.broadcastEvent("linksuggestion-" + req.body.suggestion_id);
                                res.status(200).json("Success");
                            }
                        });
                    }
                });

            }
            else if (req.body.vote == "NEGATIVE") {

                LinkSuggestion.findOneAndUpdate({"_id": req.body.suggestion_id}, {$pull: {"votes_against": req.body.user_id, "votes_for": req.body.user_id}}, function (err, result1) {
                    if (err) {
                        res.status(500).json("Internal error");
                    }
                    else {
                        LinkSuggestion.findOneAndUpdate({"_id": req.body.suggestion_id}, {$push: {"votes_against": req.body.user_id}}, function (err, result2) {
                            if (err) {
                                res.status(500).json("Internal error");
                            }
                            else {
                                socketController.broadcastEvent("linksuggestion-" + req.body.suggestion_id);
                                res.status(200).json("Success");
                            }
                        });
                    }
                });

            }
            else {
                res.status(400).json("Invalid vote type supplied");
            }
        }
        else {
            res.status(400).json("Invalid suggestion_type supplied");
        }

    }
    else {
        res.status(400).json("Insufficient information supplied");
    }
};


exports.createCategorySuggestion = function (req, res) {
    if (req.body.author && req.body.suggestion_type) {
        if (req.body.suggestion_type == "CREATE") {
            if (req.body.name) {
                db.listAllLabels(function (err, labels) {
                    if (err) {
                        res.status(500).json("Internal error");
                    }
                    else {
                        if (labels && labels instanceof Array && labels.length && labels.length > 0) {
                            let exists = false;
                            for (let i=0; i<=labels.length-1; i++) {
                                if (labels[i] == req.body.name) {
                                    exists = true;
                                    break;
                                }
                            }
                            if (!exists) {
                                let newCategory = new CategorySuggestion();
                                newCategory.author = req.body.author;
                                newCategory.suggestion_type = req.body.suggestion_type;
                                newCategory.name = req.body.name;
                                newCategory.save(function (err) {
                                    if (err) {
                                        res.status(500).json("Internal error");
                                    }
                                    else {
                                        res.status(200).json(newCategory);
                                    }
                                });
                            }
                            else {
                                res.status(400).json("Category already exists");
                            }
                        }
                        else {
                            let newCategory = new CategorySuggestion();
                            newCategory.author = req.body.author;
                            newCategory.suggestion_type = req.body.suggestion_type;
                            newCategory.name = req.body.name;
                            newCategory.save(function (err) {
                                if (err) {
                                    res.status(500).json("Internal error");
                                }
                                else {
                                    res.status(200).json(newCategory);
                                }
                            });
                        }
                    }
                });
            }
            else {
                res.status(400).json("Insufficient data to build a suggestion");
            }
        }
        else if (req.body.suggestion_type == "DELETE") {
            if (req.body.name) {
                db.listAllLabels(function (err, labels) {
                    if (err) {
                        res.status(500).json("Internal error");
                    }
                    else {
                        if (labels && labels instanceof Array && labels.length && labels.length > 0) {
                            let exists = false;
                            for (let i=0; i<=labels.length-1; i++) {
                                if (labels[i] == req.body.name) {
                                    exists = true;
                                    break;
                                }
                            }
                            if (exists) {
                                let newCategory = new CategorySuggestion();
                                newCategory.author = req.body.author;
                                newCategory.suggestion_type = req.body.suggestion_type;
                                newCategory.name = req.body.name;
                                newCategory.save(function (err) {
                                    if (err) {
                                        res.status(500).json("Internal error");
                                    }
                                    else {
                                        res.status(200).json(newCategory);
                                    }
                                });
                            }
                            else {
                                res.status(400).json("Selected label doesn't exist.");
                            }
                        }
                        else {
                            res.status(400).json("Unable to complete operation. No labels to delete?");
                        }
                    }
                });
            }
            else {
                res.status(400).json("No node_id in request");
            }
        }
        else {
            res.status(400).json("Unsupported suggestion type");
        }
    }
    else {
        res.status(400).json("Insufficient data in request");
    }
};