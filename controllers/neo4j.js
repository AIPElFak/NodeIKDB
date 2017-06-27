/**
 * Created by Ivan on 1/30/2017.
 */

const neo4j = require('node-neo4j');
let db = new neo4j('http://neo4j:test@localhost:7474');

const socketController = require('./socket');


exports.getAllLabels = function (callback) {

    db.listAllLabels(callback);
};

exports.getAllNodes = function (req,res) {
    let queryString = "match (n) return n";
    db.cypherQuery(queryString,function (err,result) {
        if(err) {
            res.status(500).json("An error occurred");
            console.log(err);
        }
        else {
            res.status(200).json(result.data);
        }


    })
};
exports.getNodesByLabels = function (req, res) {

    if (req.body.labels && req.body.labels.length) {

        let queryString = "match (n) where ";
        for (let i=0; i<=req.body.labels.length-1; i++) {
            if (i != 0) {
                queryString += " and ";
            }
            queryString += "n:" + req.body.labels[i];
        }
        queryString += " return n"; //ID(n) as _id, n.name as name";
        console.log(queryString);
        db.cypherQuery(queryString, function (err, result) {
             if (err) {
                 res.status(500).json("An error occurred");
                 console.log(err);
             }
            else {
                 res.status(200).json(result.data);
             }
        })
    }
    else {
       res.status(400).json("No labels supplied");
    }
    
};

exports.getNodeById = function (req,res) {
    if(req.params._id) {
        db.readNode(req.params._id,function (err,node) {
            if(err){
                res.status(500).json("Server error");
            }
            else {
                db.readRelationshipsOfNode(req.params._id,function (err,relationships) {
                    if(err) {
                        res.status(500).json("Server error");
                    }
                    else {
                        db.readLabels(req.params._id, function (err, labels) {
                            if (err) {
                                res.status(500).json("Server error");
                            }
                            else {
                                res.status(200).json({"node":node,"relationships":relationships, "labels": labels});
                            }
                        });
                    }

                })
            }
        })
    }
    else {
        res.status(400).json("No node id supplied");
    }


};

exports.getNodeByName = (req, res) => {
    if (req.params.name) {
        let query = "match (n) where n.name = \"" + req.params.name + "\" return n;";

        db.cypherQuery(query, (err, result) => {
            if (err) {
                res.status(500).json("An error occurred: " + err);
            }
            else {
                if (result.data && result.data instanceof Array && result.data.length && result.data.length > 0) {
                    let node = result.data[0];

                    db.readRelationshipsOfNode(node._id, (err,relationships) => {
                        if(err) {
                            res.status(500).json("Server error");
                        }
                        else {
                            db.readLabels(node._id, (err, labels) => {
                                if (err) {
                                    res.status(500).json("Server error");
                                }
                                else {
                                    res.status(200).json({"node":node,"relationships":relationships, "labels": labels});
                                }
                            });
                        }

                    });
                }
                else {
                    res.status(400).json("Invalid node name supplied");
                }
            }
        });
    }
    else {
        res.status(400).json("No name supplied.");
    }
};

exports.getRelationshipById = function (req,res) {
    if (req.params._id) {
        db.readRelationship(req.params._id, function (err, relationship) {
            if (err) {
                res.status(500).json("Server error");
            }
            else {
                res.status(200).json(relationship);
            }
        })
    }
    else {
        res.status(400).json("No relationship id supplied");
    }

};

//user_id assumed valid
exports.voteOnNode = function (req, res) {
    if (req.body.user_id && req.body.node_id && req.body.vote) {

        db.readNode(req.body.node_id, function (err, node) {
            if (err) {
                res.status(500).json("Internal error");
            }
            else if (!node) {
                res.status(400).json("Invalid node_id supplied");
            }
            else {
                let foundPos = false;
                let foundNeg = false;
                for (let i=0; i<=node.votes_for.length-1; i++) {
                    if (node.votes_for[i] == req.body.user_id) {
                        foundPos = true;
                        break;
                    }
                }
                for (let i=0; i<=node.votes_against.length-1; i++) {
                    if (node.votes_against[i] == req.body.user_id) {
                        foundNeg = true;
                        break;
                    }
                }
                let updateQuery = "MATCH (n) WHERE ID(n)=" + req.body.node_id + " SET ";
                if (req.body.vote == "POSITIVE") {
                    if (foundPos) {
                        res.status(400).json("Already voted positively on this node");
                    }
                    else {
                        updateQuery += "n.votes_for= n.votes_for + \"" + req.body.user_id + "\"";
                        if (foundNeg) {
                            updateQuery += ",n.votes_against= FILTER(x IN n.votes_against WHERE x <> \"" + req.body.user_id + "\")";
                            //updateQuery += ",n.votes_against= n.votes_against - \"" + req.body.user_id + "\"";
                        }
                        db.cypherQuery(updateQuery, function (err, result) {
                            if (err) {
                                console.log(err);
                                res.status(500).json("Internal error");
                            }
                            else {
                                socketController.broadcastEvent("node-" + req.body.suggestion_id);
                                res.status(200).json("Successfully voted on node");
                            }
                        });
                    }
                }
                else if (req.body.vote == "NEGATIVE") {
                    if (foundNeg) {
                        res.status(400).json("Already voted negatively on this node");
                    }
                    else {
                        updateQuery += "n.votes_against= n.votes_against + \"" + req.body.user_id + "\"";
                        if (foundPos) {
                            updateQuery += ",n.votes_for= FILTER(x IN n.votes_for WHERE x <> \"" + req.body.user_id + "\")";
                        }
                        db.cypherQuery(updateQuery, function (err, result) {
                            if (err) {
                                res.status(500).json("Internal error");
                                console.log(err);
                            }
                            else {
                                socketController.broadcastEvent("node-" + req.body.suggestion_id);
                                res.status(200).json("Successfully voted on node");
                            }
                        });
                    }
                }
                else {
                    res.status(400).json("Unsupported vote type");
                }
            }
        });

    }
    else {
        res.status(400).json("Insufficient data supplied");
    }
};

exports.voteOnLink = function (req, res) {
    if (req.body.user_id && req.body.link_id && req.body.vote) {
        db.readRelationship(req.body.link_id, function (err, link) {
            if (err) {
                console.log(err);
                res.status(500).json("Internal error");
            }
            else if (!link) {
                res.status(400).json("Invalid link_id supplied");
            }
            else {
                let foundPos = false;
                let foundNeg = false;
                for (let i=0; i<=link.votes_for.length-1; i++) {
                    if (link.votes_for[i] == req.body.user_id) {
                        foundPos = true;
                        break;
                    }
                }
                for (let i=0; i<=link.votes_against.length-1; i++) {
                    if (link.votes_against[i] == req.body.user_id) {
                        foundNeg = true;
                        break;
                    }
                }
                let updateQuery = "MATCH (n)-[r]->(m) where id(r)=" + req.body.link_id + " SET ";
                if (req.body.vote == "POSITIVE") {
                    if (foundPos) {
                        res.status(200).json("Already voted positively on this link");
                    }
                    else {
                        updateQuery += "r.votes_for= r.votes_for + \"" + req.body.user_id + "\"";
                        if (foundNeg) {
                            updateQuery += ",r.votes_against= FILTER(x IN r.votes_against WHERE x <> \"" + req.body.user_id + "\")";
                            //updateQuery += ",n.votes_against= n.votes_against - \"" + req.body.user_id + "\"";
                        }
                        db.cypherQuery(updateQuery, function (err, result) {
                            if (err) {
                                console.log(err);
                                res.status(500).json("Internal error");
                            }
                            else {
                                socketController.broadcastEvent("link-" + req.body.suggestion_id);
                                res.status(200).json("Successfully voted on link");
                            }
                        });
                    }
                }
                else if (req.body.vote == "NEGATIVE") {
                    if (foundNeg) {
                        res.status(200).json("Already voted negatively on this link");
                    }
                    else {
                        updateQuery += "r.votes_against= r.votes_against + \"" + req.body.user_id + "\"";
                        if (foundPos) {
                            updateQuery += ",r.votes_for= FILTER(x IN r.votes_for WHERE x <> \"" + req.body.user_id + "\")";
                        }
                        db.cypherQuery(updateQuery, function (err, result) {
                            if (err) {
                                res.status(500).json("Internal error");
                                console.log(err);
                            }
                            else {
                                socketController.broadcastEvent("link-" + req.body.suggestion_id);
                                res.status(200).json("Successfully voted on link");
                            }
                        });
                    }
                }
                else {
                    res.status(400).json("Unsupported vote type");
                }
            }
        });
    }
    else {
        res.status(400).json("Insufficient data supplied");
    }
};

