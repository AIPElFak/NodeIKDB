/**
 * Created by Ivan on 6/23/2017.
 */


const User = require('./User');

var mongoose = require('mongoose');

var CategorySuggestionSchema = mongoose.Schema({
    author: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    suggestion_type: String,
    name: String,
    date_created: {type: Date, default: Date.now()},
    votes_for: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    votes_against: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}]
});

CategorySuggestion = mongoose.model('CategorySuggestion', CategorySuggestionSchema);

module.exports = CategorySuggestion;