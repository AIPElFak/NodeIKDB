/**
 * Created by Ivan on 1/30/2017.
 */

const neo4j = require('node-neo4j');
let db = new neo4j('http://neo4j:test@localhost:7474');


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

exports.getRelationshipById = function (req,res) {
    if (req.params._id) {
        db.readRelationship(req.params._id, function (err, relationship) {
            if (err) {
                res.status(500).json("Server error");
            }
            else {
                res.status(200).json({"relationship": relationship});
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
        if (req.body.vote == "POSITIVE") {
            db.updateNode(req.body.node_id, {votes_for: votes_for + req.body.user_id, votes_against: votes_against - req.body.user_id}, function (err, res) {
                if (err) {

                }
            });
        }
        else if (req.body.vote == "NEGATIVE") {

        }
        else {
            res.status(400).json("Unsupported vote type");
        }
    }
    else {
        res.status(400).json("Insufficient data supplied");
    }
};

