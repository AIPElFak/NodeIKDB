/**
 * Created by Ivan on 2/4/2017.
 */

const User = require('./User');

var mongoose = require('mongoose');

var NodeSuggestionSchema = mongoose.Schema({
    author: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    suggestion_type : String,
    node_id: String,
    types: [String],
    name: String,
    definition: String,
    description: String,
    date_created : {type: Date, default: Date.now()},
    votes_for: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    votes_against: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}]
    //votes_users: [{user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}, positive: Boolean}]
});



NodeSuggestion = mongoose.model('NodeSuggestion', NodeSuggestionSchema);

module.exports = NodeSuggestion;