const mongoose = require('mongoose');

const commentsSchema = new mongoose.Schema({
    comment:  { type: String, required: true },
    postedUser: {type: String, required: true}
});

const Comment = mongoose.model('Comment', commentsSchema);

module.exports = Comment;
