var mongoose = require('mongoose');
var Schema = mongoose.Schema;

checkInSchema = new Schema( {
	userId: Number,
    eventId:mongoose.ObjectId,
}),
checkin = mongoose.model('CheckIn', checkInSchema);

module.exports = checkin;