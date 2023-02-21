var mongoose = require('mongoose');
var Schema = mongoose.Schema;

userInfoSchema = new Schema( {
	
	unique_id: Number,
	email: String,
	username: String,
	password: String,
	passwordConf: String,
	lat: String,
	long: String
}),
User = mongoose.model('User', userInfoSchema);

module.exports = User;