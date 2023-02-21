var mongoose = require('mongoose');
var Schema = mongoose.Schema;

eventInfoSchema = new Schema( {
	name: String,
	venue: String,
    username: String,
	date: String,

	
}),
events = mongoose.model('Event', eventInfoSchema);

module.exports = events;