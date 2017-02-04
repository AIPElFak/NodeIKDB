/**
 * Created by Ivan on 1/30/2017.
 */

const neo4j = require('node-neo4j');
let db = new neo4j('http://neo4j:test@localhost:7474');


exports.getAllLabels = function (callback) {

    db.listAllLabels(callback);
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
                 res.status(200).json({"nodes": result});
             }
        })
    }
    else {
       res.status(400).json("No labels supplied");
    }
    
};
