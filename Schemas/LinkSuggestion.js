/**
 * Created by Ivan on 2/4/2017.
 */

const User = require('./User');

var mongoose = require('mongoose');

var LinkSuggestionSchema = mongoose.Schema({
    author: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    suggestion_type : String,
    link_id: String,
    type: String,
    description: String,
    node_from: String,
    node_to: String,
    start_name: String,
    end_name: String,
    date_created : {type: Date, default: Date.now()},
    votes_for: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    votes_against: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}]
    //votes_users: [{user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}, positive: Boolean}]
});



LinkSuggestion = mongoose.model('LinkSuggestion', LinkSuggestionSchema);

module.exports = LinkSuggestion;