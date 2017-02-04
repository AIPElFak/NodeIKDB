/**
 * Created by Ivan on 2/4/2017.
 */

const User = require('./User');

var mongoose = require('mongoose');

var LinkSuggestionSchema = mongoose.Schema({
    author: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    type : String,
    link_id: String,
    link : mongoose.Schema.Types.Mixed,
    node_from: String,
    node_to: String,
    date_created : Number,
    votes_for: Number,
    votes_against: Number
});



LinkSuggestion = mongoose.model('LinkSuggestion', LinkSuggestionSchema);

module.exports = LinkSuggestion;