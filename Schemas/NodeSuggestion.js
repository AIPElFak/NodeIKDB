/**
 * Created by Ivan on 2/4/2017.
 */

const User = require('./User');

var mongoose = require('mongoose');

var NodeSuggestionSchema = mongoose.Schema({
    author: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    type : String,
    node_id: String,
    node : mongoose.Schema.Types.Mixed,
    date_created : Number,
    votes_for: Number,
    votes_against: Number
});



NodeSuggestion = mongoose.model('NodeSuggestion', NodeSuggestionSchema);

module.exports = NodeSuggestion;